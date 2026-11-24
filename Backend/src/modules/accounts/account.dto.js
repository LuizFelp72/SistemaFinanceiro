const v = require("../../shared/validation");
const { createDto } = require("../../shared/dto");

const types = ["corrente", "poupanca", "carteira", "investimento", "outro"];

module.exports = createDto({
  validators: {
    nome: value => v.text(value, "nome"),
    tipo: value => v.choice(value, "tipo", types),
    saldo_inicial: value => v.money(value, "saldo_inicial"),
    moeda: value => {
      if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value)) v.invalid("moeda deve conter três letras maiúsculas, como BRL.");
      return value;
    },
    ativo: value => v.boolean(value, "ativo"),
  },
  required: ["nome", "tipo"],
  defaults: { saldo_inicial: "0.00", moeda: "BRL", ativo: true },
  allowedFilters: ["ativo", "tipo"],
  filters(query, result) {
    if (query.ativo !== undefined) result.ativo = v.booleanQuery(query.ativo, "ativo");
    if (query.tipo !== undefined) result.tipo = v.choice(query.tipo, "tipo", types);
  },
});
