const { AppError } = require("../shared/errors");

module.exports = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof AppError) return res.status(error.status).json({ error: error.message });
  if (error.type === "entity.parse.failed") return res.status(400).json({ error: "JSON inválido." });
  if (error.type === "entity.too.large") return res.status(413).json({ error: "Corpo da requisição muito grande." });
  if (["23503", "23505", "23514", "22003"].includes(error.code)) {
    return res.status(409).json({ error: "Operação viola um vínculo ou uma restrição dos dados." });
  }
  console.error(error);
  return res.status(500).json({ error: "Erro interno do servidor." });
};
