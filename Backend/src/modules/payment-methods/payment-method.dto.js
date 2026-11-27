const v = require("../../shared/validation");
const { createDto } = require("../../shared/dto");

const types = ["pix", "dinheiro", "credito", "debito", "boleto", "outro"];

module.exports = createDto({
  validators: {
    nome: value => v.text(value, "nome"),
    tipo: value => v.choice(value, "tipo", types),
    ativo: value => v.boolean(value, "ativo"),
  },
  required: ["nome", "tipo"],
  defaults: { ativo: true },
  allowedFilters: ["tipo", "ativo", "busca"],
  filters(query, result) {
    if (query.tipo !== undefined) result.tipo = v.choice(query.tipo, "tipo", types);
    if (query.ativo !== undefined) result.ativo = v.booleanQuery(query.ativo, "ativo");
    if (query.busca !== undefined) result.busca = v.text(query.busca, "busca");
  },
});
