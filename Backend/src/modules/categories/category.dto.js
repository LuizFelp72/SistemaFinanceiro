const v = require("../../shared/validation");
const { createDto } = require("../../shared/dto");

const types = ["receita", "despesa"];

module.exports = createDto({
  validators: {
    nome: value => v.text(value, "nome"),
    tipo: value => v.choice(value, "tipo", types),
    cor: value => v.nullableText(value, "cor", 50),
    icone: value => v.nullableText(value, "icone", 100),
  },
  required: ["nome", "tipo"],
  defaults: { cor: null, icone: null },
  allowedFilters: ["tipo", "busca"],
  filters(query, result) {
    if (query.tipo !== undefined) result.tipo = v.choice(query.tipo, "tipo", types);
    if (query.busca !== undefined) result.busca = v.text(query.busca, "busca");
  },
});
