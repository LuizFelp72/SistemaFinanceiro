const pool = require("../../configs/database");

const camposSelect = `
  id,
  usuario_id,
  nome,
  tipo,
  valor_aquisicao::text AS valor_aquisicao,
  valor_atual::text AS valor_atual,
  to_char(data_aquisicao, 'YYYY-MM-DD') AS data_aquisicao,
  descricao
`;

async function find(userId, id) {
  const sql = `
    SELECT ${camposSelect}
    FROM assets
    WHERE usuario_id = $1 AND id = $2
  `;
  const { rows } = await pool.query(sql, [userId, id]);
  return rows[0];
}

async function list(userId, filters) {
  const values = [userId];
  let where = "usuario_id = $1";

  if (filters.tipo !== undefined) {
    values.push(filters.tipo);
    where += ` AND lower(tipo) = lower($${values.length})`;
  }

  if (filters.busca !== undefined) {
    values.push(`%${filters.busca}%`);
    where += ` AND nome ILIKE $${values.length}`;
  }

  const totalResult = await pool.query(
    `SELECT count(*)::int AS total FROM assets WHERE ${where}`,
    values
  );

  const offset = (filters.page - 1) * filters.limit;
  values.push(filters.limit, offset);

  const sql = `
    SELECT ${camposSelect}
    FROM assets
    WHERE ${where}
    ORDER BY data_aquisicao DESC, nome ASC, id ASC
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
    INSERT INTO assets (
      usuario_id,
      nome,
      tipo,
      valor_aquisicao,
      valor_atual,
      data_aquisicao,
      descricao
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;

  const values = [
    userId,
    data.nome,
    data.tipo,
    data.valor_aquisicao,
    data.valor_atual,
    data.data_aquisicao,
    data.descricao,
  ];

  const { rows } = await pool.query(sql, values);
  return find(userId, rows[0].id);
}

async function update(userId, id, data) {
  const campos = Object.keys(data);
  const valores = Object.values(data);

  const setClause = campos
    .map((campo, index) => `${campo} = $${index + 3}`)
    .join(", ");

  const sql = `
    UPDATE assets
    SET ${setClause}
    WHERE usuario_id = $1 AND id = $2
    RETURNING id
  `;

  const { rows } = await pool.query(sql, [userId, id, ...valores]);
  if (!rows[0]) {
    return null;
  }

  return find(userId, id);
}

async function remove(userId, id) {
  const sql = `
    DELETE FROM assets
    WHERE usuario_id = $1 AND id = $2
    RETURNING id
  `;
  const { rows } = await pool.query(sql, [userId, id]);
  return rows[0];
}

module.exports = { find, list, create, update, remove };
