const { createCrudController, createCrudRouter, createService, ensureFound } = require("../../shared/crud");
const { AppError } = require("../../shared/errors");
const inTransaction = require("../../shared/transaction");
const repository = require("./budget.repository");
const dto = require("./budget.dto");
async function validateCategory(db, userId, id) {
  const { rows } = await db.query("SELECT tipo FROM categories WHERE usuario_id=$1 AND id=$2 FOR UPDATE", [userId, id]);
  if (!rows.length) throw new AppError(404, "Categoria não encontrada.");
  if (rows[0].tipo !== "despesa") throw new AppError(400, "Orçamentos exigem categoria de despesa.");
}
const service = createService({
  repository, notFound: "Orçamento não encontrado.",
  overrides: {
    create(userId, data) {
      return inTransaction(async db => {
        await validateCategory(db, userId, data.categoria_id);
        return repository.create(userId, data, db);
      });
    },
    update(userId, id, data) {
      return inTransaction(async db => {
        const current = ensureFound(await repository.find(userId, id, db, true), "Orçamento não encontrado.");
        await validateCategory(db, userId, data.categoria_id || current.categoria_id);
        return repository.update(userId, id, data, db);
      });
    },
  },
});
module.exports = { path: "/budgets", router: createCrudRouter(createCrudController({ dto, service })) };
