const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../configs/database");
const { AppError } = require("../../shared/errors");
const { ensureFound } = require("../../shared/crud");

const publicFields = "id, nome, email, created_at";
// Hash descartável para que login de e-mail inexistente leve o mesmo tempo de um e-mail existente.
const dummyHash = bcrypt.hashSync("senha-inexistente", 10);

function signToken(userId) {
  if (!process.env.JWT_SECRET) throw new AppError(503, "Autenticação não configurada.");
  return jwt.sign({}, process.env.JWT_SECRET, {
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
  const { rows } = await pool.query(`SELECT ${publicFields}, senha_hash FROM users WHERE lower(email) = $1`, [email]);
  const user = rows[0];
  const valid = await bcrypt.compare(senha, user ? user.senha_hash : dummyHash);
  if (!user || !valid) throw new AppError(401, "E-mail ou senha inválidos.");
  delete user.senha_hash;
  return { user, token: signToken(user.id) };
}

async function me(userId) {
  const { rows } = await pool.query(`SELECT ${publicFields} FROM users WHERE id = $1`, [userId]);
  return ensureFound(rows[0], "Usuário não encontrado.");
}

module.exports = { register, login, me };
