const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../configs/database");
const { AppError } = require("../../shared/errors");
const { ensureFound } = require("../../shared/crud");

const publicFields = "id, nome, email, created_at";
// Hash descartável para que login de e-mail inexistente leve o mesmo tempo de um e-mail existente.
const dummyHash = bcrypt.hashSync("senha-inexistente", 10);

function signToken(userId, version = 0) {
  if (!process.env.JWT_SECRET) throw new AppError(503, "Autenticação não configurada.");
  return jwt.sign({ ver: version }, process.env.JWT_SECRET, {
    subject: userId,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    algorithm: "HS256",
  });
}

async function register({ nome, email, senha }) {
  const hash = await bcrypt.hash(senha, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING ${publicFields}`,
      [nome, email, hash]
    );
    return { user: rows[0], token: signToken(rows[0].id) };
  } catch (error) {
    if (error.code === "23505") throw new AppError(409, "E-mail já cadastrado.");
    throw error;
  }
}

async function login({ email, senha }) {
  const { rows } = await pool.query(`SELECT ${publicFields}, senha_hash, session_version FROM users WHERE lower(email) = $1`, [email]);
  const user = rows[0];
  const valid = await bcrypt.compare(senha, user ? user.senha_hash : dummyHash);
  if (!user || !valid) throw new AppError(401, "E-mail ou senha inválidos.");
  delete user.senha_hash;
  const version = user.session_version;
  delete user.session_version;
  return { user, token: signToken(user.id, version) };
}

async function me(userId) {
  const { rows } = await pool.query(`SELECT ${publicFields} FROM users WHERE id = $1`, [userId]);
  return ensureFound(rows[0], "Usuário não encontrado.");
}

async function updateProfile(userId, data) {
  const assignments = Object.keys(data).map((key,i) => key + "=$" + (i+2)).join(", ");
  try {
    const { rows } = await pool.query(`UPDATE users SET ${assignments} WHERE id=$1 RETURNING ${publicFields}`, [userId,...Object.values(data)]);
    return ensureFound(rows[0], "Usuário não encontrado.");
  } catch (error) {
    if (error.code === "23505") throw new AppError(409,"E-mail já cadastrado.");
    throw error;
  }
}
async function changePassword(userId, {senha_atual,nova_senha}) {
  const inTransaction = require("../../shared/transaction");
  return inTransaction(async db => {
    const {rows} = await db.query("SELECT senha_hash FROM users WHERE id=$1 FOR UPDATE",[userId]);
    if (!rows[0] || !await bcrypt.compare(senha_atual, rows[0].senha_hash)) throw new AppError(400,"Senha atual incorreta.");
    const hash = await bcrypt.hash(nova_senha,10);
    const updated = await db.query("UPDATE users SET senha_hash=$2, session_version=session_version+1 WHERE id=$1 RETURNING session_version",[userId,hash]);
    return { token: signToken(userId,updated.rows[0].session_version) };
  });
}
module.exports = { register, login, me, updateProfile, changePassword };
