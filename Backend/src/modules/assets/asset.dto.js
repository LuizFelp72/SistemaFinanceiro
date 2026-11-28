const v = require("../../shared/validation");
const { createDto } = require("../../shared/dto");

module.exports = createDto({
  validators: {
    nome: value => v.text(value, "nome"),
    tipo: value => v.text(value, "tipo"),
    valor_aquisicao: value => v.nonNegativeMoney(value, "valor_aquisicao"),
    valor_atual: value => v.nonNegativeMoney(value, "valor_atual"),
    moeda: value => {
      if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value)) v.invalid("moeda deve conter três letras maiúsculas, como BRL.");
      return value;
    },
    data_aquisicao: value => v.date(value, "data_aquisicao"),
    descricao: value => v.nullableText(value, "descricao", 5000),
  },
  required: ["nome", "tipo", "valor_aquisicao", "valor_atual", "data_aquisicao"],
  defaults: { moeda: "BRL", descricao: null },
  allowedFilters: ["tipo", "busca", "moeda"],
  filters(query, result) {
    if (query.tipo !== undefined) result.tipo = v.text(query.tipo, "tipo");
    if (query.busca !== undefined) result.busca = v.text(query.busca, "busca");
    if (query.moeda !== undefined) {
      if (typeof query.moeda !== "string" || !/^[A-Z]{3}$/.test(query.moeda)) v.invalid("moeda deve conter três letras maiúsculas, como BRL.");
      result.moeda = query.moeda;
    }
  },
});
