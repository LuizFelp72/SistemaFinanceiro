const v = require("../../shared/validation");
const { createDto } = require("../../shared/dto");

module.exports = createDto({
  validators: {
    nome: value => v.text(value, "nome"),
    tipo: value => v.text(value, "tipo"),
    valor_aquisicao: value => v.nonNegativeMoney(value, "valor_aquisicao"),
    valor_atual: value => v.nonNegativeMoney(value, "valor_atual"),
    data_aquisicao: value => v.date(value, "data_aquisicao"),
    descricao: value => v.nullableText(value, "descricao", 5000),
  },
  required: ["nome", "tipo", "valor_aquisicao", "valor_atual", "data_aquisicao"],
  defaults: { descricao: null },
  allowedFilters: ["tipo", "busca"],
  filters(query, result) {
    if (query.tipo !== undefined) result.tipo = v.text(query.tipo, "tipo");
    if (query.busca !== undefined) result.busca = v.text(query.busca, "busca");
  },
});
