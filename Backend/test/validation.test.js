const { test } = require("node:test");
const assert = require("node:assert/strict");
const account = require("../src/modules/accounts/account.dto");
const transaction = require("../src/modules/transactions/transaction.dto");
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
  for (const dto of [account, transaction]) {
    for (const body of [{ usuario_id: "qualquer" }, { saldo_atual: 500 }, {}, [], null]) {
      assert.throws(() => dto.parse(body, true), { status: 400 });
    }
  }
  assert.deepEqual(account.parse({ nome: "  Carteira  ", tipo: "carteira" }), {
    nome: "Carteira", tipo: "carteira", saldo_inicial: "0.00", moeda: "BRL", ativo: true,
  });
  assert.throws(() => account.parse({ nome: "Conta", tipo: "corrente", ativo: "false" }), { status: 400 });
  assert.throws(() => transaction.parse({ valor: -10 }, true), { status: 400 });
});

test("filtros e paginação possuem limites e formatos validados", () => {
  assert.deepEqual(account.filters({ ativo: "false", limit: "5" }), { page: 1, limit: 5, ativo: false });
  for (const query of [{ limit: "101" }, { page: "0" }, { limit: ["1", "2"] }, { extra: "x" }, { data_inicio: "2026-02-02", data_fim: "2026-01-01" }]) {
    assert.throws(() => transaction.filters(query), { status: 400 });
  }
});
