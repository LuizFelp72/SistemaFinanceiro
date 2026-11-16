const repository = require("./goal.repository");
const inTransaction = require("../../shared/transaction");
const { AppError } = require("../../shared/errors");

function verificarEncontrada(goal) {
  if (!goal) {
    throw new AppError(404, "Meta financeira não encontrada.");
  }
  return goal;
}

async function list(userId, filters) {
  return repository.list(userId, filters);
}

async function find(userId, id) {
  const meta = await repository.find(userId, id);
  return verificarEncontrada(meta);
}

async function create(userId, data) {
  return repository.create(userId, data);
}

async function update(userId, id, data) {
  return inTransaction(async (db) => {
    const metaAtual = verificarEncontrada(await repository.find(userId, id, db));

    const dataInicioFinal = data.data_inicio ?? metaAtual.data_inicio;
    const dataLimiteFinal = data.data_limite ?? metaAtual.data_limite;

    if (dataInicioFinal > dataLimiteFinal) {
      throw new AppError(400, "data_inicio deve ser anterior ou igual a data_limite.");
    }

    return repository.update(userId, id, data, db);
  });
}

async function remove(userId, id) {
  const metaRemovida = await repository.remove(userId, id);
  return verificarEncontrada(metaRemovida);
}

module.exports = { list, find, create, update, remove };
