const { createRepository, contains } = require("../../shared/sql");

module.exports = createRepository({
  table: "payment_methods",
  projection: "id, usuario_id, nome, tipo, ativo",
  conditions: { tipo: p => `tipo = ${p}`, ativo: p => `ativo = ${p}`, busca: p => `nome ILIKE ${p}` },
  valueOf: { busca: contains },
  orderBy: "nome ASC, id ASC",
});
