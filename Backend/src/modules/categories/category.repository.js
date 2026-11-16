const pool = require("../../configs/database");

const camposSelect = `
  id,
  usuario_id,
  nome,
  tipo,
  cor,
  icone
`;

async function find(userId, id, db = pool) {
  const sql = `
    SELECT ${camposSelect}
    FROM categories
    WHERE usuario_id = $1 AND id = $2
  `;
  const { rows } = await db.query(sql, [userId, id]);
  return rows[0];
}

async function list(userId, filters) {
  const values = [userId];
  let where = "usuario_id = $1";

  if (filters.tipo !== undefined) {
    values.push(filters.tipo);
    where += ` AND tipo = $${values.length}`;
  }

  if (filters.busca !== undefined) {
    values.push(`%${filters.busca}%`);
    where += ` AND nome ILIKE $${values.length}`;
  }

  const totalResult = await pool.query(
    `SELECT count(*)::int AS total FROM categories WHERE ${where}`,
    values
  );

  const offset = (filters.page - 1) * filters.limit;
  values.push(filters.limit, offset);

  const sql = `
    SELECT ${camposSelect}
    FROM categories
    WHERE ${where}
    ORDER BY nome ASC, id ASC
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;
  const { rows } = await pool.query(sql, values);

  return {
    data: rows,
    total: totalResult.rows[0].total,
    page: filters.page,
    limit: filters.limit,
  };
}

async function create(userId, data) {
  const sql = `
    INSERT INTO categories (
      usuario_id,
      nome,
      tipo,
      cor,
      icone
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;

  const values = [
    userId,
    data.nome,
    data.tipo,
    data.cor,
    data.icone,
  ];

  const { rows } = await pool.query(sql, values);
  return find(userId, rows[0].id);
}

async function update(userId, id, data, db = pool) {
  const campos = Object.keys(data);
  const valores = Object.values(data);

  const setClause = campos
    .map((campo, index) => `${campo} = $${index + 3}`)
    .join(", ");

  const sql = `
    UPDATE categories
    SET ${setClause}
    WHERE usuario_id = $1 AND id = $2
    RETURNING id
  `;

  const { rows } = await db.query(sql, [userId, id, ...valores]);
  if (!rows[0]) {
    return null;
  }

  return find(userId, id, db);
}

async function remove(userId, id) {
  const sql = `
    DELETE FROM categories
    WHERE usuario_id = $1 AND id = $2
    RETURNING id
  `;
  const { rows } = await pool.query(sql, [userId, id]);
  return rows[0];
}

module.exports = { find, list, create, update, remove };
