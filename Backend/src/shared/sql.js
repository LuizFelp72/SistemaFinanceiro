const pool = require("../configs/database");

// Escapa curingas de LIKE para que a busca seja por trecho literal (usar com ILIKE).
const contains = text => `%${text.replace(/[\\%_]/g, "\\$&")}%`;

// Fábrica do repository padrão de um recurso pertencente a um usuário.
// Os nomes de colunas vêm sempre das chaves de DTOs validados (lista fechada), nunca do cliente.
//  - table / alias: tabela e alias opcional usado em projection e conditions
//  - projection: lista de colunas do SELECT
//  - conditions: { filtro: placeholder => "trecho SQL" }; valueOf transforma o valor do filtro
//  - orderBy: ORDER BY da listagem
function createRepository({ table, alias, projection, conditions = {}, valueOf = {}, orderBy }) {
  const from = alias ? `${table} ${alias}` : table;
  const col = name => (alias ? `${alias}.${name}` : name);

  async function find(userId, id, db = pool, lock = false) {
    const { rows } = await db.query(
      `SELECT ${projection} FROM ${from} WHERE ${col("usuario_id")} = $1 AND ${col("id")} = $2${lock ? ` FOR UPDATE${alias ? ` OF ${alias}` : ""}` : ""}`,
      [userId, id]
    );
    return rows[0];
  }

  async function list(userId, filters, db = pool) {
    const values = [userId];
    let where = `${col("usuario_id")} = $1`;
    for (const [field, condition] of Object.entries(conditions)) {
      if (filters[field] === undefined) continue;
      values.push(valueOf[field] ? valueOf[field](filters[field]) : filters[field]);
      where += ` AND ${condition(`$${values.length}`)}`;
    }
    const total = await db.query(`SELECT count(*)::int AS total FROM ${from} WHERE ${where}`, values);
    values.push(filters.limit, (filters.page - 1) * filters.limit);
    const { rows } = await db.query(
      `SELECT ${projection} FROM ${from} WHERE ${where} ORDER BY ${orderBy} LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return { data: rows, total: total.rows[0].total, page: filters.page, limit: filters.limit };
  }

  async function create(userId, data, db = pool) {
    const fields = Object.keys(data);
    const values = [userId, ...Object.values(data)];
    const { rows } = await db.query(
      `INSERT INTO ${table} (usuario_id, ${fields.join(", ")}) VALUES (${values.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
      values
    );
    return find(userId, rows[0].id, db);
  }

  async function update(userId, id, data, db = pool) {
    const set = Object.keys(data).map((field, i) => `${field} = $${i + 3}`).join(", ");
    const { rows } = await db.query(
      `UPDATE ${table} SET ${set} WHERE usuario_id = $1 AND id = $2 RETURNING id`,
      [userId, id, ...Object.values(data)]
    );
    return rows[0] ? find(userId, id, db) : null;
  }

  async function remove(userId, id, db = pool) {
    const { rows } = await db.query(`DELETE FROM ${table} WHERE usuario_id = $1 AND id = $2 RETURNING id`, [userId, id]);
    return rows[0];
  }

  return { find, list, create, update, remove };
}

module.exports = { createRepository, contains };
