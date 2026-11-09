const repository = require("./account.repository");
const inTransaction = require("../../shared/transaction");
const { AppError } = require("../../shared/errors");
function required(account) {
  if (!account) throw new AppError(404, "Conta não encontrada.");
  return account;
}
module.exports = {
  list: repository.list,
  create: repository.create,
  async find(userId, id) { return required(await repository.find(userId, id)); },
  async update(userId, id, data) {
    return inTransaction(async db => {
      const { rows } = await db.query("SELECT * FROM accounts WHERE usuario_id = $1 AND id = $2 FOR UPDATE", [userId, id]);
      const account = required(rows[0]);
      if (data.moeda !== undefined && data.moeda !== account.moeda) {
        const linked = await db.query("SELECT 1 FROM transactions WHERE usuario_id = $1 AND (conta_id = $2 OR conta_destino_id = $2) LIMIT 1", [userId, id]);
        if (linked.rowCount) throw new AppError(409, "Não é possível alterar a moeda de uma conta com movimentações.");
      }
      return repository.update(userId, id, data, db);
    });
  },
  async remove(userId, id) { required(await repository.remove(userId, id)); },
};
