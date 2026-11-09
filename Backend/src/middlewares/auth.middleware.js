const jwt = require("jsonwebtoken");
const pool = require("../configs/database");
const { AppError } = require("../shared/errors");
const { uuid } = require("../shared/validation");

module.exports = async function authenticate(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) throw new AppError(503, "Autenticação não configurada.");
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || "");
    if (!match) throw new AppError(401, "Autenticação necessária.");
    let userId;
    try {
      const claims = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ["HS256"] });
      userId = uuid(claims.sub, "sub");
      if (!Number.isInteger(claims.exp)) throw new Error("Token sem expiração");
    } catch {
      throw new AppError(401, "Token inválido ou expirado.");
    }
    const { rowCount } = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (!rowCount) throw new AppError(401, "Usuário não encontrado.");
    req.user = { id: userId };
    next();
  } catch (error) { next(error); }
};
