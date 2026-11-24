const repository = require("./payment-method.repository");
const { AppError } = require("../../shared/errors");
const { createService, ensureFound } = require("../../shared/crud");

const notFound = "Método de pagamento não encontrado.";

module.exports = createService({
  repository,
  notFound,
  overrides: {
    // Métodos usados em transações não podem ser excluídos: o histórico é preservado e o método deve ser desativado.
    async remove(userId, id) {
      try {
        ensureFound(await repository.remove(userId, id), notFound);
      } catch (error) {
        if (error.code === "23001" || error.code === "23503") {
          throw new AppError(409, "Método de pagamento com transações vinculadas não pode ser excluído. Desative-o com ativo: false.");
        }
        throw error;
      }
    },
  },
});
