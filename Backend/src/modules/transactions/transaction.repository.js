const { createRepository } = require("../../shared/sql");

module.exports = createRepository({
  table: "transactions",
  alias: "t",
  // Formata DATE no PostgreSQL para não depender do fuso horário do processo Node.
  projection: "t.*, to_char(t.data, 'YYYY-MM-DD') AS data",
  conditions: {
    tipo: p => `t.tipo = ${p}`,
    status: p => `t.status = ${p}`,
    conta_id: p => `(t.conta_id = ${p} OR t.conta_destino_id = ${p})`,
    categoria_id: p => `t.categoria_id = ${p}`,
    data_inicio: p => `t.data >= ${p}`,
    data_fim: p => `t.data <= ${p}`,
    busca: p => `strpos(lower(t.descricao), lower(${p})) > 0`,
  },
  orderBy: "t.data DESC, t.id",
});
