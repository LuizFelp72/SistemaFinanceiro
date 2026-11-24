const repository = require("./account.repository");
const inTransaction = require("../../shared/transaction");
const { AppError } = require("../../shared/errors");
const { createService, ensureFound } = require("../../shared/crud");

const notFound = "Conta não encontrada.";

module.exports = createService({
  repository,
  notFound,
  overrides: {
    update(userId, id, data) {
      return inTransaction(async db => {
        const { rows } = await db.query("SELECT * FROM accounts WHERE usuario_id = $1 AND id = $2 FOR UPDATE", [userId, id]);
        const account = ensureFound(rows[0], notFound);
        if (data.moeda !== undefined && data.moeda !== account.moeda) {
          const linked = await db.query("SELECT 1 FROM transactions WHERE usuario_id = $1 AND (conta_id = $2 OR conta_destino_id = $2) LIMIT 1", [userId, id]);
          if (linked.rowCount) throw new AppError(409, "Não é possível alterar a moeda de uma conta com movimentações.");
        }
        return repository.update(userId, id, data, db);
      });
    },
  },
});
