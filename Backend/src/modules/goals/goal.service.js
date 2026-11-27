const repository = require("./goal.repository");
const inTransaction = require("../../shared/transaction");
const { AppError } = require("../../shared/errors");
const { createService, ensureFound } = require("../../shared/crud");

const notFound = "Meta financeira não encontrada.";

module.exports = createService({
  repository,
  notFound,
  overrides: {
    // Um PATCH parcial precisa respeitar data_inicio <= data_limite considerando os valores já gravados.
    update(userId, id, data) {
      return inTransaction(async db => {
        const current = ensureFound(await repository.find(userId, id, db, true), notFound);
        if ((data.data_inicio ?? current.data_inicio) > (data.data_limite ?? current.data_limite)) {
          throw new AppError(400, "data_inicio deve ser anterior ou igual a data_limite.");
        }
        return repository.update(userId, id, data, db);
      });
    },
  },
});
