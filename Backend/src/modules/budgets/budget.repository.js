const { createRepository } = require("../../shared/sql");
module.exports = createRepository({
  table: "budgets", alias: "b",
  projection: `b.id, b.usuario_id, b.categoria_id, b.mes, b.moeda, b.valor_limite::text,
    COALESCE((SELECT SUM(t.valor) FROM transactions t
      JOIN accounts a ON a.id = t.conta_id AND a.usuario_id = t.usuario_id
      WHERE t.usuario_id = b.usuario_id AND t.categoria_id = b.categoria_id
      AND to_char(t.data, 'YYYY-MM') = b.mes AND a.moeda = b.moeda
      AND t.tipo = 'despesa' AND t.status = 'concluida'), 0)::text AS valor_gasto`,
  conditions: { mes: p => `b.mes = ${p}` },
  orderBy: "b.mes DESC, b.id",
});
