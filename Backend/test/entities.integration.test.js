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
  if (expected === 201 && !path.startsWith("/auth/")) assert.ok(response.headers.get("location").endsWith(data.id));
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

test("CRUD de bem (asset), filtros e isolamento por usuário", async () => {
  const bem = await request("POST", "/assets", {
    nome: "Honda Civic",
    tipo: "Veículo",
    valor_aquisicao: "85000.00",
    valor_atual: "80000.00",
    data_aquisicao: "2024-03-15",
    descricao: "Carro de uso pessoal",
  }, 201);
  assert.equal(bem.nome, "Honda Civic");
  assert.equal(bem.valor_aquisicao, "85000.00");
  assert.equal(bem.valor_atual, "80000.00");
  assert.equal(bem.data_aquisicao, "2024-03-15");

  const atualizado = await request("PATCH", `/assets/${bem.id}`, { valor_atual: "78500.00" });
  assert.equal(atualizado.valor_atual, "78500.00");

  const lista = await request("GET", "/assets?tipo=Veículo&busca=Civic");
  assert.equal(lista.total, 1);
  assert.equal(lista.data[0].id, bem.id);

  await request("GET", `/assets/${bem.id}`, undefined, 404, otherId);
  await request("DELETE", `/assets/${bem.id}`, undefined, 204);
  await request("GET", `/assets/${bem.id}`, undefined, 404);
});

test("CRUD de categoria, proteção contra troca de tipo vinculada e isolamento", async () => {
  const cat = await request("POST", "/categories", {
    nome: "Salário",
    tipo: "receita",
    cor: "#21A366",
    icone: "wallet",
  }, 201);
  assert.equal(cat.nome, "Salário");
  assert.equal(cat.tipo, "receita");

  const atualizada = await request("PATCH", `/categories/${cat.id}`, { nome: "Salário Mensal" });
  assert.equal(atualizada.nome, "Salário Mensal");

  const lista = await request("GET", "/categories?tipo=receita&busca=Salário");
  assert.equal(lista.total, 1);

  const conta = await account();
  const tx = await transaction(conta, { categoria_id: cat.id, tipo: "receita" });
  await request("PATCH", `/categories/${cat.id}`, { tipo: "despesa" }, 409);
  await request("DELETE", `/categories/${cat.id}`, undefined, 409);

  await request("DELETE", `/transactions/${tx.id}`, undefined, 204);
  await request("GET", `/categories/${cat.id}`, undefined, 404, otherId);
  await request("DELETE", `/categories/${cat.id}`, undefined, 204);
  await request("GET", `/categories/${cat.id}`, undefined, 404);
});

test("CRUD de meta financeira (goal), validação de datas e isolamento", async () => {
  const meta = await request("POST", "/goals", {
    nome: "Viagem de Férias",
    valor_objetivo: "5000.00",
    valor_atual: "1200.00",
    data_inicio: "2026-01-10",
    data_limite: "2026-12-10",
  }, 201);
  assert.equal(meta.nome, "Viagem de Férias");
  assert.equal(meta.status, "ativa");
  assert.equal(meta.valor_objetivo, "5000.00");
  assert.equal(meta.valor_atual, "1200.00");

  await request("PATCH", `/goals/${meta.id}`, { data_limite: "2025-12-31" }, 400);

  const atualizada = await request("PATCH", `/goals/${meta.id}`, {
    valor_atual: "5000.00",
    status: "concluida",
  });
  assert.equal(atualizada.status, "concluida");

  const lista = await request("GET", "/goals?status=concluida&busca=Viagem");
  assert.equal(lista.total, 1);

  await request("GET", `/goals/${meta.id}`, undefined, 404, otherId);
  await request("DELETE", `/goals/${meta.id}`, undefined, 204);
  await request("GET", `/goals/${meta.id}`, undefined, 404);
});

test("CRUD de método de pagamento, filtros, exclusão protegida e isolamento", async () => {
  const owner = randomUUID();
  await pool.query("INSERT INTO users(id, nome, email, senha_hash) VALUES ($1, 'Teste', $2, 'fixture-sem-login')", [owner, `${owner}@example.test`]);
  const req = (method, path, body, expected = 200, who = owner) => request(method, path, body, expected, who);
  const pix = await req("POST", "/payment-methods", { nome: "Pix", tipo: "pix" }, 201);
  assert.equal(pix.ativo, true);
  assert.equal(pix.usuario_id, owner);
  await req("POST", "/payment-methods", { nome: "Cartão", tipo: "credito", ativo: false }, 201);
  await req("POST", "/payment-methods", { nome: "X", tipo: "cheque" }, 400);
  await req("POST", "/payment-methods", { tipo: "pix" }, 400);
  await req("POST", "/payment-methods", { nome: "Y", tipo: "pix", usuario_id: otherId }, 400);
  await req("PATCH", "/payment-methods/" + pix.id, {}, 400);

  assert.equal((await req("GET", "/payment-methods?tipo=credito")).total, 1);
  assert.equal((await req("GET", "/payment-methods?ativo=false")).data[0].nome, "Cartão");
  assert.equal((await req("GET", "/payment-methods?busca=pi")).data[0].id, pix.id);
  assert.equal((await req("GET", "/payment-methods?busca=%25")).total, 0);

  assert.equal((await req("PATCH", `/payment-methods/${pix.id}`, { nome: "Pix principal" })).nome, "Pix principal");
  await req("GET", `/payment-methods/${pix.id}`, undefined, 404, otherId);
  await req("PATCH", `/payment-methods/${pix.id}`, { ativo: false }, 404, otherId);
  await req("DELETE", `/payment-methods/${pix.id}`, undefined, 404, otherId);

  const conta = await account({}, owner);
  await req("POST", "/transactions", { descricao: "Compra", valor: "10.00", tipo: "despesa", data: "2026-11-09", conta_id: conta.id, metodo_pagamento_id: pix.id }, 201);
  await req("DELETE", `/payment-methods/${pix.id}`, undefined, 409);
  assert.equal((await req("PATCH", `/payment-methods/${pix.id}`, { ativo: false })).ativo, false);

  const livre = await req("POST", "/payment-methods", { nome: "Dinheiro", tipo: "dinheiro" }, 201);
  await req("DELETE", `/payment-methods/${livre.id}`, undefined, 204);
  await req("GET", `/payment-methods/${livre.id}`, undefined, 404);
});

test("cadastro, login e /auth/me", async () => {
  const email = `Novo.${randomUUID()}@Example.test`;
  const body = { nome: "Novo Usuário", email, senha: "senha-segura-1" };
  const registerResponse = await fetch(`${base}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  assert.equal(registerResponse.status, 201);
  const registered = await registerResponse.json();
  assert.equal(registered.user.email, email.toLowerCase());
  assert.equal(registered.user.senha_hash, undefined);
  assert.ok(registered.token);
  const { senha_hash: stored } = (await pool.query("SELECT senha_hash FROM users WHERE id = $1", [registered.user.id])).rows[0];
  assert.notEqual(stored, body.senha);

  await request("POST", "/auth/register", { ...body, email: email.toUpperCase() }, 409, null);
  await request("POST", "/auth/register", { ...body, email: "invalido" }, 400, null);
  await request("POST", "/auth/register", { ...body, email: "a@b.test", senha: "curta" }, 400, null);
  await request("POST", "/auth/register", { nome: "Sem senha", email: "c@d.test" }, 400, null);

  const login = await request("POST", "/auth/login", { email: email.toUpperCase(), senha: body.senha }, 200, null);
  assert.equal(login.user.id, registered.user.id);
  await request("POST", "/auth/login", { email, senha: "senha-errada-1" }, 401, null);
  await request("POST", "/auth/login", { email: "naoexiste@example.test", senha: body.senha }, 401, null);

  // O token emitido funciona nas rotas protegidas e enxerga apenas os dados do próprio usuário.
  const headers = { Authorization: `Bearer ${login.token}` };
  const me = await (await fetch(`${base}/auth/me`, { headers })).json();
  assert.equal(me.id, registered.user.id);
  assert.equal((await fetch(`${base}/auth/me`)).status, 401);
  const accounts = await (await fetch(`${base}/accounts`, { headers })).json();
  assert.equal(accounts.total, 0);
  assert.equal((await fetch(`${base}/health`)).status, 200);
});

test("orçamentos persistem, isolam usuários e somam centavos por moeda", async () => {
  const categoria = await request("POST", "/categories", {nome:"Orçamento teste",tipo:"despesa"},201);
  const body = {categoria_id:categoria.id,mes:"2026-11",valor_limite:"10.00"};
  const budget = await request("POST","/budgets",body,201);
  await request("POST","/budgets",body,409);
  await request("GET","/budgets/"+budget.id,undefined,404,otherId);
  const brl = await account();
  const usd = await account({moeda:"USD"});
  for (const valor of ["0.10","0.20"]) await transaction(brl,{tipo:"despesa",categoria_id:categoria.id,valor});
  await transaction(usd,{tipo:"despesa",categoria_id:categoria.id,valor:"1.00"});
  await transaction(brl,{tipo:"despesa",categoria_id:categoria.id,valor:"2.00",status:"pendente"});
  assert.equal((await request("GET","/budgets/"+budget.id)).valor_gasto,"0.30");
  await request("PATCH","/categories/"+categoria.id,{tipo:"receita"},409);
  await request("PATCH","/budgets/"+budget.id,{valor_limite:"20.00"});
  await request("DELETE","/budgets/"+budget.id,undefined,204);
});

test("perfil e troca de senha revogam tokens anteriores", async () => {
  const email = randomUUID()+"@example.test";
  const registered = await request("POST","/auth/register",{nome:"Perfil",email,senha:"senha-original-1"},201,null);
  const call = (path,method,body,token=registered.token) => fetch(base+path,{method,headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:body ? JSON.stringify(body):undefined});
  assert.equal((await call("/auth/me","PATCH",{nome:"Nome atualizado"})).status,200);
  assert.equal((await call("/auth/password","POST",{senha_atual:"errada",nova_senha:"nova-senha-123"})).status,400);
  const changed = await call("/auth/password","POST",{senha_atual:"senha-original-1",nova_senha:"nova-senha-123"});
  assert.equal(changed.status,200);
  const fresh = await changed.json();
  assert.equal((await call("/auth/me","GET")).status,401);
  assert.equal((await call("/auth/me","GET",undefined,fresh.token)).status,200);
  await request("POST","/auth/login",{email,senha:"senha-original-1"},401,null);
  await request("POST","/auth/login",{email,senha:"nova-senha-123"},200,null);
});

test("recuperação usa token com validade e consumo único", async () => {
  const {createHash,randomBytes}=require("node:crypto");
  const tokenValue=randomBytes(32).toString("hex");
  const hash=createHash("sha256").update(tokenValue).digest("hex");
  await pool.query("INSERT INTO password_resets(token_hash,usuario_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')",[hash,otherId]);
  await request("POST","/auth/reset-password",{token:tokenValue,nova_senha:"senha-recuperada-123"},204,null);
  await request("POST","/auth/reset-password",{token:tokenValue,nova_senha:"senha-recuperada-456"},400,null);
  await request("GET","/accounts",undefined,401,otherId);
  const expired=randomBytes(32).toString("hex");
  await pool.query("INSERT INTO password_resets(token_hash,usuario_id,expires_at) VALUES($1,$2,now()-interval '1 minute')",[createHash("sha256").update(expired).digest("hex"),otherId]);
  await request("POST","/auth/reset-password",{token:expired,nova_senha:"senha-recuperada-456"},400,null);
});
