const { createRepository, contains } = require("../../shared/sql");

module.exports = createRepository({
  table: "categories",
  projection: "id, usuario_id, nome, tipo, cor, icone",
  conditions: { tipo: p => `tipo = ${p}`, busca: p => `nome ILIKE ${p}` },
  valueOf: { busca: contains },
  orderBy: "nome ASC, id ASC",
});
