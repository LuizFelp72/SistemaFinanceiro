const { createRepository, contains } = require("../../shared/sql");

module.exports = createRepository({
  table: "financial_goals",
  projection: `id, usuario_id, nome,
    valor_objetivo::text AS valor_objetivo,
    valor_atual::text AS valor_atual,
    to_char(data_inicio, 'YYYY-MM-DD') AS data_inicio,
    to_char(data_limite, 'YYYY-MM-DD') AS data_limite,
    status`,
  conditions: { status: p => `status = ${p}`, busca: p => `nome ILIKE ${p}` },
  valueOf: { busca: contains },
  orderBy: "data_limite ASC, nome ASC, id ASC",
});
