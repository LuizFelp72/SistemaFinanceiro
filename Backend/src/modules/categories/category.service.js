const repository = require("./category.repository");
const inTransaction = require("../../shared/transaction");
const { AppError } = require("../../shared/errors");
const { createService, ensureFound } = require("../../shared/crud");

const notFound = "Categoria não encontrada.";

module.exports = createService({
  repository,
  notFound,
  overrides: {
    update(userId, id, data) {
      return inTransaction(async db => {
        const current = ensureFound(await repository.find(userId, id, db, true), notFound);
        if (data.tipo !== undefined && data.tipo !== current.tipo) {
          const linked = await db.query("SELECT 1 FROM transactions WHERE usuario_id = $1 AND categoria_id = $2 LIMIT 1", [userId, id]);
          const budgets = await db.query("SELECT 1 FROM budgets WHERE usuario_id=$1 AND categoria_id=$2 LIMIT 1", [userId,id]);
          if (linked.rowCount || budgets.rowCount) throw new AppError(409, "Não é possível alterar o tipo de uma categoria com transações vinculadas.");
        }
        return repository.update(userId, id, data, db);
      });
    },
  },
});
