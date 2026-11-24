const repository = require("./transaction.repository");
const inTransaction = require("../../shared/transaction");
const { AppError } = require("../../shared/errors");
const { createService, ensureFound } = require("../../shared/crud");

const notFound = "Transação não encontrada.";

async function validateReferences(db, userId, data) {
  if (data.tipo === "transferencia") {
    if (!data.conta_destino_id || data.conta_id === data.conta_destino_id) throw new AppError(400, "Transferência exige uma conta de destino diferente da origem.");
    if (data.categoria_id) throw new AppError(400, "Transferências não possuem categoria de receita ou despesa.");
  } else if (data.conta_destino_id) throw new AppError(400, "Somente transferências possuem conta de destino.");

  const ids = [data.conta_id, data.conta_destino_id].filter(Boolean);
  // A ordem fixa evita deadlocks em transferências simultâneas entre as mesmas contas.
  const { rows: accounts } = await db.query("SELECT * FROM accounts WHERE usuario_id = $1 AND id = ANY($2::uuid[]) ORDER BY id FOR UPDATE", [userId, ids]);
  if (accounts.length !== ids.length) throw new AppError(404, "Conta não encontrada.");
  if (accounts.some(account => !account.ativo)) throw new AppError(409, "Não é possível movimentar uma conta inativa.");
  if (accounts.length === 2 && accounts[0].moeda !== accounts[1].moeda) throw new AppError(400, "Transferências exigem contas com a mesma moeda.");
  if (data.categoria_id) {
    const { rows } = await db.query("SELECT tipo FROM categories WHERE usuario_id = $1 AND id = $2 FOR SHARE", [userId, data.categoria_id]);
    if (!rows.length) throw new AppError(404, "Categoria não encontrada.");
    if (rows[0].tipo !== data.tipo) throw new AppError(400, "Categoria incompatível com o tipo da transação.");
  }
  if (data.metodo_pagamento_id) {
    const { rows } = await db.query("SELECT ativo FROM payment_methods WHERE usuario_id = $1 AND id = $2 FOR SHARE", [userId, data.metodo_pagamento_id]);
    if (!rows.length) throw new AppError(404, "Método de pagamento não encontrado.");
    if (!rows[0].ativo) throw new AppError(409, "Método de pagamento inativo.");
  }
}
module.exports = createService({
  repository,
  notFound,
  overrides: {
    create(userId, data) {
      return inTransaction(async db => {
        await validateReferences(db, userId, data);
        // Uma única linha representa as duas pontas: crédito e débito são atômicos.
        return repository.create(userId, data, db);
      });
    },
    update(userId, id, data) {
      return inTransaction(async db => {
        const current = ensureFound(await repository.find(userId, id, db, true), notFound);
        await validateReferences(db, userId, { ...current, ...data });
        return repository.update(userId, id, data, db);
      });
    },
  },
});
