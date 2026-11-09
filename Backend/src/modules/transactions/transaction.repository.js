const pool = require("../../configs/database");
// Formata DATE no PostgreSQL para não depender do fuso horário do processo Node.
const projection = "t.*, to_char(t.data, 'YYYY-MM-DD') AS data";
async function find(userId, id, db = pool, lock = false) {
  return (await db.query(`SELECT ${projection} FROM transactions t WHERE t.usuario_id = $1 AND t.id = $2${lock ? " FOR UPDATE" : ""}`, [userId, id])).rows[0];
}
async function list(userId, filters) {
  const values = [userId];
  let where = "t.usuario_id = $1";
  const conditions = {
    tipo: p => `t.tipo = ${p}`, status: p => `t.status = ${p}`,
    conta_id: p => `(t.conta_id = ${p} OR t.conta_destino_id = ${p})`,
    categoria_id: p => `t.categoria_id = ${p}`,
    data_inicio: p => `t.data >= ${p}`, data_fim: p => `t.data <= ${p}`,
    busca: p => `strpos(lower(t.descricao), lower(${p})) > 0`,
  };
  for (const [field, condition] of Object.entries(conditions)) if (filters[field] !== undefined) {
    values.push(filters[field]);
    where += ` AND ${condition(`$${values.length}`)}`;
  }
  const total = await pool.query(`SELECT count(*)::int AS total FROM transactions t WHERE ${where}`, values);
  values.push(filters.limit, (filters.page - 1) * filters.limit);
  const { rows } = await pool.query(`SELECT ${projection} FROM transactions t WHERE ${where} ORDER BY t.data DESC, t.id LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
  return { data: rows, total: total.rows[0].total, page: filters.page, limit: filters.limit };
}
async function create(userId, data, db) {
  const fields = Object.keys(data);
  const values = [userId, ...Object.values(data)];
  const { rows } = await db.query(`INSERT INTO transactions (usuario_id, ${fields.join(", ")}) VALUES (${values.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`, values);
  return find(userId, rows[0].id, db);
}
async function update(userId, id, data, db) {
  const fields = Object.keys(data);
  await db.query(`UPDATE transactions SET ${fields.map((field, i) => `${field} = $${i + 3}`).join(", ")} WHERE usuario_id = $1 AND id = $2`, [userId, id, ...Object.values(data)]);
  return find(userId, id, db);
}
async function remove(userId, id) {
  return (await pool.query("DELETE FROM transactions WHERE usuario_id = $1 AND id = $2 RETURNING id", [userId, id])).rows[0];
}
module.exports = { find, list, create, update, remove };
