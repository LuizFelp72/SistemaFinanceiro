const { test } = require("node:test");
const assert = require("node:assert/strict");
const account = require("../src/modules/accounts/account.dto");
const transaction = require("../src/modules/transactions/transaction.dto");
const asset = require("../src/modules/assets/asset.dto");
const category = require("../src/modules/categories/category.dto");
const goal = require("../src/modules/goals/goal.dto");
const v = require("../src/shared/validation");

test("valores monetários mantêm precisão decimal, incluindo o limite de NUMERIC(15,2)", () => {
  assert.equal(v.money("9999999999999.99", "valor", true), "9999999999999.99");
  assert.equal(v.money("0.10", "valor", true), "0.10");
  assert.equal(v.money(-20.5, "saldo_inicial"), "-20.50");
  assert.equal(v.money("-0.01", "saldo_inicial"), "-0.01");
  for (const value of ["1.001", "1e3", "10000000000000", "NaN", Infinity, null, {}, "0", -1]) {
    assert.throws(() => v.money(value, "valor", true), { status: 400 });
  }
});

test("datas inválidas não são normalizadas silenciosamente", () => {
  assert.equal(v.date("2024-02-29", "data"), "2024-02-29");
  for (const value of ["2025-02-29", "2026-04-31", "2026-13-01", "0000-01-01", "01/01/2026", null]) {
    assert.throws(() => v.date(value, "data"), { status: 400 });
  }
});

test("DTOs rejeitam alteração de proprietário, campos desconhecidos e PATCH vazio", () => {
  for (const dto of [account, transaction, asset, category, goal]) {
    for (const body of [{ usuario_id: "qualquer" }, { saldo_atual: 500 }, {}, [], null]) {
      assert.throws(() => dto.parse(body, true), { status: 400 });
    }
  }
  assert.deepEqual(account.parse({ nome: "  Carteira  ", tipo: "carteira" }), {
    nome: "Carteira", tipo: "carteira", saldo_inicial: "0.00", moeda: "BRL", ativo: true,
  });
  assert.deepEqual(asset.parse({
    nome: "  Apartamento  ",
    tipo: "Imóvel",
    valor_aquisicao: "350000.00",
    valor_atual: "420000.50",
    data_aquisicao: "2024-05-10",
  }), {
    nome: "Apartamento",
    tipo: "Imóvel",
    valor_aquisicao: "350000.00",
    valor_atual: "420000.50",
    moeda: "BRL",
    data_aquisicao: "2024-05-10",
    descricao: null,
  });
  assert.throws(() => asset.parse({ moeda: "brl" }, true), { status: 400 });
  assert.deepEqual(category.parse({
    nome: "  Alimentação  ",
    tipo: "despesa",
    cor: "#FF0000",
  }), {
    nome: "Alimentação",
    tipo: "despesa",
    cor: "#FF0000",
    icone: null,
  });
  assert.deepEqual(goal.parse({
    nome: "  Reserva de Emergência  ",
    valor_objetivo: "15000.00",
    data_inicio: "2026-01-01",
    data_limite: "2026-12-31",
  }), {
    nome: "Reserva de Emergência",
    valor_objetivo: "15000.00",
    valor_atual: "0.00",
    data_inicio: "2026-01-01",
    data_limite: "2026-12-31",
    status: "ativa",
  });
  assert.throws(() => account.parse({ nome: "Conta", tipo: "corrente", ativo: "false" }), { status: 400 });
  assert.throws(() => transaction.parse({ valor: -10 }, true), { status: 400 });
  assert.throws(() => asset.parse({ valor_aquisicao: -1 }, true), { status: 400 });
  assert.throws(() => category.parse({ nome: "Teste", tipo: "transferencia" }), { status: 400 });
  assert.throws(() => goal.parse({
    nome: "Meta inválida",
    valor_objetivo: "1000.00",
    data_inicio: "2026-12-31",
    data_limite: "2026-01-01",
  }), { status: 400 });
});

test("filtros e paginação possuem limites e formatos validados", () => {
  assert.deepEqual(account.filters({ ativo: "false", limit: "5" }), { page: 1, limit: 5, ativo: false });
  assert.deepEqual(asset.filters({ tipo: "Veículo", busca: "Civic" }), { page: 1, limit: 20, tipo: "Veículo", busca: "Civic" });
  assert.deepEqual(category.filters({ tipo: "receita", busca: "Sal" }), { page: 1, limit: 20, tipo: "receita", busca: "Sal" });
  assert.deepEqual(goal.filters({ status: "ativa", busca: "Reserva" }), { page: 1, limit: 20, status: "ativa", busca: "Reserva" });
  for (const query of [{ limit: "101" }, { page: "0" }, { limit: ["1", "2"] }, { extra: "x" }, { data_inicio: "2026-02-02", data_fim: "2026-01-01" }]) {
    assert.throws(() => transaction.filters(query), { status: 400 });
  }
});

test("DTOs de método de pagamento e autenticação validam campos e rejeitam extras", () => {
  const payment = require("../src/modules/payment-methods/payment-method.dto");
  const auth = require("../src/modules/auth/auth.dto");
  assert.deepEqual(payment.parse({ nome: " Pix ", tipo: "pix" }), { nome: "Pix", tipo: "pix", ativo: true });
  assert.throws(() => payment.parse({ nome: "X", tipo: "cheque" }), { status: 400 });
  assert.throws(() => payment.parse({ nome: "X", tipo: "pix", usuario_id: "x" }), { status: 400 });
  assert.deepEqual(payment.filters({ ativo: "false", busca: "a" }), { page: 1, limit: 20, ativo: false, busca: "a" });
  assert.throws(() => payment.filters({ ativo: "talvez" }), { status: 400 });

  assert.deepEqual(auth.register({ nome: "Ana", email: " ANA@Mail.com ", senha: "12345678" }), { nome: "Ana", email: "ana@mail.com", senha: "12345678" });
  assert.throws(() => auth.register({ nome: "Ana", email: "ana@mail.com", senha: "1234567" }), { status: 400 });
  assert.throws(() => auth.register({ nome: "Ana", email: "ana@mail.com", senha: "é".repeat(37) }), { status: 400 });
  assert.throws(() => auth.register({ nome: "Ana", email: "sem-arroba", senha: "12345678" }), { status: 400 });
  assert.throws(() => auth.login({ email: "ana@mail.com" }), { status: 400 });
});
