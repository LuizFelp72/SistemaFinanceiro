const { createRepository } = require("../../shared/sql");

// saldo_atual = saldo_inicial + receitas - despesas - transferências enviadas + transferências recebidas (apenas concluídas).
const projection = `a.*, (a.saldo_inicial + COALESCE((
  SELECT SUM(CASE WHEN t.tipo = 'receita' OR t.conta_destino_id = a.id THEN t.valor ELSE -t.valor END)
  FROM transactions t WHERE t.usuario_id = a.usuario_id AND t.status = 'concluida'
    AND (t.conta_id = a.id OR t.conta_destino_id = a.id)
), 0))::text AS saldo_atual`;

module.exports = createRepository({
  table: "accounts",
  alias: "a",
  projection,
  conditions: { ativo: p => `a.ativo = ${p}`, tipo: p => `a.tipo = ${p}` },
  orderBy: "a.nome, a.id",
});
