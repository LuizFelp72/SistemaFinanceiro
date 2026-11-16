const repository = require("./category.repository");
const inTransaction = require("../../shared/transaction");
const { AppError } = require("../../shared/errors");

function verificarEncontrada(category) {
  if (!category) {
    throw new AppError(404, "Categoria não encontrada.");
  }
  return category;
}

async function list(userId, filters) {
  return repository.list(userId, filters);
}

async function find(userId, id) {
  const categoria = await repository.find(userId, id);
  return verificarEncontrada(categoria);
}

async function create(userId, data) {
  return repository.create(userId, data);
}

async function update(userId, id, data) {
  return inTransaction(async (db) => {
    const { rows } = await db.query(
      "SELECT * FROM categories WHERE usuario_id = $1 AND id = $2 FOR UPDATE",
      [userId, id]
    );
    const categoriaAtual = verificarEncontrada(rows[0]);

    if (data.tipo !== undefined && data.tipo !== categoriaAtual.tipo) {
      const vinculada = await db.query(
        "SELECT 1 FROM transactions WHERE usuario_id = $1 AND categoria_id = $2 LIMIT 1",
        [userId, id]
      );
      if (vinculada.rowCount > 0) {
        throw new AppError(
          409,
          "Não é possível alterar o tipo de uma categoria com transações vinculadas."
        );
      }
    }

    return repository.update(userId, id, data, db);
  });
}

async function remove(userId, id) {
  const categoriaRemovida = await repository.remove(userId, id);
  return verificarEncontrada(categoriaRemovida);
}

module.exports = { list, find, create, update, remove };
