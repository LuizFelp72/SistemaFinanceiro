const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID, randomBytes } = require("node:crypto");

if (!process.env.TEST_DATABASE_URL) throw new Error("Defina TEST_DATABASE_URL com um PostgreSQL exclusivo para testes.");
const { Pool } = require("pg");
const adminPool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
const schema = `test_entities_${randomBytes(8).toString("hex")}`;
const testUrl = new URL(process.env.TEST_DATABASE_URL);
testUrl.searchParams.set("options", `-c search_path=${schema}`);
process.env.DATABASE_URL = testUrl.toString();
process.env.JWT_SECRET = randomBytes(32).toString("hex");
const jwt = require("jsonwebtoken");
const pool = require("../src/configs/database");
const migrate = require("../scripts/migrate");
const app = require("../src/app");
const userId = randomUUID();
const otherId = randomUUID();
const token = id => jwt.sign({}, process.env.JWT_SECRET, { subject: id, expiresIn: "10m", algorithm: "HS256" });
let server;
let base;

before(async () => {
  await adminPool.query(`CREATE SCHEMA ${schema}`);
  await migrate();
  // A segunda aplicação deve ser inócua.
  await migrate();
  for (const id of [userId, otherId]) {
    await pool.query("INSERT INTO users(id, nome, email, senha_hash) VALUES ($1, 'Teste', $2, 'fixture-sem-login')", [id, `${id}@example.test`]);
  }
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await pool.end();
  await adminPool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await adminPool.end();
});

async function request(method, path, body, expected = 200, owner = userId) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(owner ? { Authorization: `Bearer ${token(owner)}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = response.status === 204 ? null : await response.json();
  assert.equal(response.status, expected, JSON.stringify(data));
  if (expected === 201) assert.ok(response.headers.get("location").endsWith(data.id));
  return data;
}
const account = (data = {}, owner = userId) => request("POST", "/accounts", { nome: "Conta teste", tipo: "corrente", saldo_inicial: "100.00", ...data }, 201, owner);
const transaction = (conta, data = {}, status = 201) => request("POST", "/transactions", {
  descricao: "Movimentação teste", valor: "10.00", tipo: "receita", data: "2026-11-09", conta_id: conta.id, ...data,
}, status);
const balance = async conta => (await request("GET", `/accounts/${conta.id}`)).saldo_atual;

test("autenticação obrigatória, assinatura, expiração e usuário existente", async () => {
  await request("GET", "/accounts", undefined, 401, null);
  await request("GET", "/transactions", undefined, 401, randomUUID());
  for (const invalid of ["invalido", jwt.sign({}, "outro-segredo", { subject: userId, expiresIn: "1h" }), jwt.sign({}, process.env.JWT_SECRET, { subject: userId, expiresIn: -1 }), jwt.sign({}, process.env.JWT_SECRET, { subject: userId })]) {
    const response = await fetch(`${base}/accounts`, { headers: { Authorization: `Bearer ${invalid}` } });
    assert.equal(response.status, 401);
  }
});

test("CRUD de conta, paginação, filtro e representação decimal", async () => {
  const conta = await account({ saldo_inicial: "9999999999999.99" });
  assert.equal(conta.saldo_atual, "9999999999999.99");
  assert.equal(conta.saldo_inicial, "9999999999999.99");
  const updated = await request("PATCH", `/accounts/${conta.id}`, { nome: "Reserva", ativo: false });
  assert.equal(updated.nome, "Reserva");
  const list = await request("GET", "/accounts?ativo=false&limit=1");
  assert.equal(list.limit, 1);
  assert.ok(list.data.some(row => row.id === conta.id));
  await request("DELETE", `/accounts/${conta.id}`, undefined, 204);
  await request("GET", `/accounts/${conta.id}`, undefined, 404);
});

test("isolamento de usuários em GET, PATCH, DELETE e listagens", async () => {
  const foreign = await account({}, otherId);
  for (const method of ["GET", "PATCH", "DELETE"]) await request(method, `/accounts/${foreign.id}`, method === "PATCH" ? { nome: "Invasão" } : undefined, 404);
  const own = await account();
  const tx = await transaction(own);
  for (const method of ["GET", "PATCH", "DELETE"]) await request(method, `/transactions/${tx.id}`, method === "PATCH" ? { valor: "1.00" } : undefined, 404, otherId);
  const list = await request("GET", "/accounts?limit=100");
  assert.ok(list.data.every(row => row.usuario_id === userId));
  const transactions = await request("GET", "/transactions?limit=100", undefined, 200, otherId);
  assert.equal(transactions.total, 0);
  await transaction(foreign, {}, 404);
  await request("POST", "/accounts", { nome: "Invasão", tipo: "corrente", usuario_id: otherId }, 400);
});

test("receita, despesa, pendência, edição e exclusão recalculam o saldo", async () => {
  const conta = await account();
  const income = await transaction(conta, { valor: "0.10" });
  const expense = await transaction(conta, { valor: "0.20", tipo: "despesa" });
  const pending = await transaction(conta, { valor: "50.00", status: "pendente" });
  assert.equal(await balance(conta), "99.90");
  await request("PATCH", `/transactions/${pending.id}`, { status: "concluida" });
  assert.equal(await balance(conta), "149.90");
  await request("PATCH", `/transactions/${expense.id}`, { valor: "0.10" });
  assert.equal(await balance(conta), "150.00");
  await request("DELETE", `/transactions/${income.id}`, undefined, 204);
  assert.equal(await balance(conta), "149.90");
  const list = await request("GET", `/transactions?conta_id=${conta.id}&tipo=despesa&data_inicio=2026-11-01&data_fim=2026-11-30&busca=teste&limit=1`);
  assert.equal(list.total, 1);
  assert.equal(list.data[0].data, "2026-11-09");
  assert.equal(list.data[0].id, expense.id);
  const empty = await request("GET", `/transactions?conta_id=${conta.id}&page=99`);
  assert.equal(empty.total, 2);
  assert.deepEqual(empty.data, []);
});

test("transferência credita e debita atomicamente, com edição e reversão", async () => {
  const source = await account();
  const destination = await account({ saldo_inicial: "0" });
  const tx = await transaction(source, { tipo: "transferencia", conta_destino_id: destination.id, valor: "25.30" });
  assert.equal(await balance(source), "74.70");
  assert.equal(await balance(destination), "25.30");
  assert.equal((await request("GET", `/transactions?conta_id=${destination.id}`)).total, 1);
  await request("PATCH", `/transactions/${tx.id}`, { valor: "40" });
  assert.equal(await balance(source), "60.00");
  assert.equal(await balance(destination), "40.00");
  await request("PATCH", `/transactions/${tx.id}`, { tipo: "receita", conta_destino_id: null });
  assert.equal(await balance(source), "140.00");
  assert.equal(await balance(destination), "0.00");
  await request("DELETE", `/transactions/${tx.id}`, undefined, 204);
  assert.equal(await balance(source), "100.00");
});

test("transferências inválidas não deixam movimentações parciais", async () => {
  const source = await account();
  const foreign = await account({}, otherId);
  const usd = await account({ moeda: "USD" });
  const inactive = await account({ ativo: false });
  for (const [data, expected] of [
    [{ tipo: "transferencia" }, 400],
    [{ tipo: "transferencia", conta_destino_id: source.id }, 400],
    [{ tipo: "transferencia", conta_destino_id: foreign.id }, 404],
    [{ tipo: "transferencia", conta_destino_id: usd.id }, 400],
    [{ tipo: "transferencia", conta_destino_id: inactive.id }, 409],
    [{ conta_destino_id: usd.id }, 400],
  ]) await transaction(source, data, expected);
  assert.equal(await balance(source), "100.00");
  assert.equal((await request("GET", `/transactions?conta_id=${source.id}`)).total, 0);
  await transaction(inactive, {}, 409);
});

test("edição que falha mantém a transferência original integralmente", async () => {
  const source = await account();
  const destination = await account({ saldo_inicial: "0" });
  const foreign = await account({}, otherId);
  const tx = await transaction(source, { tipo: "transferencia", conta_destino_id: destination.id });
  await request("PATCH", `/transactions/${tx.id}`, { conta_destino_id: foreign.id, valor: "90" }, 404);
  assert.equal(await balance(source), "90.00");
  assert.equal(await balance(destination), "10.00");
  assert.equal((await request("GET", `/transactions/${tx.id}`)).conta_destino_id, destination.id);
});

test("contas vinculadas não podem ser excluídas nem trocar de moeda, mas podem ser desativadas", async () => {
  const source = await account();
  const destination = await account();
  const tx = await transaction(source, { tipo: "transferencia", conta_destino_id: destination.id });
  for (const conta of [source, destination]) {
    await request("DELETE", `/accounts/${conta.id}`, undefined, 409);
    await request("PATCH", `/accounts/${conta.id}`, { moeda: "USD" }, 409);
  }
  await request("PATCH", `/accounts/${source.id}`, { ativo: false });
  assert.equal(await balance(source), "90.00");
  await transaction(source, {}, 409);
  await request("DELETE", `/transactions/${tx.id}`, undefined, 204);
  await request("DELETE", `/accounts/${source.id}`, undefined, 204);
});

test("categorias e métodos de pagamento respeitam propriedade, tipo e ativação", async () => {
  const conta = await account();
  const category = async (owner, type) => (await pool.query("INSERT INTO categories(usuario_id, nome, tipo) VALUES ($1, 'Categoria', $2) RETURNING id", [owner, type])).rows[0].id;
  const payment = async (owner, active) => (await pool.query("INSERT INTO payment_methods(usuario_id, nome, tipo, ativo) VALUES ($1, 'Pix', 'pix', $2) RETURNING id", [owner, active])).rows[0].id;
  const ownCategory = await category(userId, "receita");
  const ownPayment = await payment(userId, true);
  await transaction(conta, { categoria_id: ownCategory, metodo_pagamento_id: ownPayment });
  await transaction(conta, { categoria_id: await category(otherId, "receita") }, 404);
  await transaction(conta, { categoria_id: await category(userId, "despesa") }, 400);
  await transaction(conta, { metodo_pagamento_id: await payment(otherId, true) }, 404);
  await transaction(conta, { metodo_pagamento_id: await payment(userId, false) }, 409);
});

test("o banco também impede vínculos entre usuários e transferências incompletas", async () => {
  const own = await account();
  const foreign = await account({}, otherId);
  const sql = "INSERT INTO transactions(usuario_id, descricao, valor, tipo, data, conta_id, conta_destino_id) VALUES ($1, 'Teste', 1, $2, '2026-11-09', $3, $4)";
  await assert.rejects(pool.query(sql, [userId, "receita", foreign.id, null]), { code: "23503" });
  await assert.rejects(pool.query(sql, [userId, "transferencia", own.id, null]), { code: "23514" });
  await assert.rejects(pool.query(sql, [userId, "transferencia", own.id, foreign.id]), { code: "23503" });
});

test("movimentações concorrentes preservam centavos e o total entre contas", async () => {
  const source = await account();
  const destination = await account({ saldo_inicial: "0" });
  await Promise.all(Array.from({ length: 12 }, () => transaction(source, { tipo: "transferencia", conta_destino_id: destination.id, valor: "0.10" })));
  assert.equal(await balance(source), "98.80");
  assert.equal(await balance(destination), "1.20");
});

test("requisições inválidas e erros retornam HTTP coerente", async () => {
  await request("GET", "/accounts/id-invalido", undefined, 400);
  await request("GET", "/transactions?limit=1000", undefined, 400);
  await request("GET", "/transactions?data_inicio=2026-02-30", undefined, 400);
  await request("POST", "/accounts", { nome: "Teste", tipo: "invalido" }, 400);
  const conta = await account();
  await request("PATCH", `/accounts/${conta.id}`, {}, 400);
  await transaction(conta, { valor: "0" }, 400);
  await transaction(conta, { valor: "1.001" }, 400);
  await request("GET", "/inexistente", undefined, 404);
  const response = await fetch(`${base}/accounts`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token(userId)}` }, body: "{" });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "JSON inválido." });
});
