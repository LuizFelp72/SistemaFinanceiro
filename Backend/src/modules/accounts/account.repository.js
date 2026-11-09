const pool = require("../../configs/database");
const projection = `a.*, (a.saldo_inicial + COALESCE((
  SELECT SUM(CASE WHEN t.tipo = 'receita' OR t.conta_destino_id = a.id THEN t.valor ELSE -t.valor END)
  FROM transactions t WHERE t.usuario_id = a.usuario_id AND t.status = 'concluida'
    AND (t.conta_id = a.id OR t.conta_destino_id = a.id)
), 0))::text AS saldo_atual`;

async function find(userId, id, db = pool) {
  return (await db.query(`SELECT ${projection} FROM accounts a WHERE a.usuario_id = $1 AND a.id = $2`, [userId, id])).rows[0];
}
async function list(userId, filters) {
  const values = [userId];
  let where = "a.usuario_id = $1";
  for (const field of ["ativo", "tipo"]) if (filters[field] !== undefined) {
    values.push(filters[field]);
    where += ` AND a.${field} = $${values.length}`;
  }
  const total = await pool.query(`SELECT count(*)::int AS total FROM accounts a WHERE ${where}`, values);
  values.push(filters.limit, (filters.page - 1) * filters.limit);
  const { rows } = await pool.query(`SELECT ${projection} FROM accounts a WHERE ${where} ORDER BY a.nome, a.id LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
  return { data: rows, total: total.rows[0].total, page: filters.page, limit: filters.limit };
}
async function create(userId, data) {
  const fields = Object.keys(data);
  const values = [userId, ...Object.values(data)];
  const { rows } = await pool.query(`INSERT INTO accounts (usuario_id, ${fields.join(", ")}) VALUES (${values.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`, values);
  return find(userId, rows[0].id);
}
async function update(userId, id, data, db) {
  const fields = Object.keys(data);
  await db.query(`UPDATE accounts SET ${fields.map((field, i) => `${field} = $${i + 3}`).join(", ")} WHERE usuario_id = $1 AND id = $2`, [userId, id, ...Object.values(data)]);
  return find(userId, id, db);
}
async function remove(userId, id) {
  return (await pool.query("DELETE FROM accounts WHERE usuario_id = $1 AND id = $2 RETURNING id", [userId, id])).rows[0];
}
module.exports = { find, list, create, update, remove };
