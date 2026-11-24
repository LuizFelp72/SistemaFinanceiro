const v = require("../../shared/validation");
const { createDto } = require("../../shared/dto");

const statuses = ["ativa", "concluida", "cancelada"];

module.exports = createDto({
  validators: {
    nome: value => v.text(value, "nome"),
    valor_objetivo: value => v.money(value, "valor_objetivo", true),
    valor_atual: value => v.nonNegativeMoney(value, "valor_atual"),
    data_inicio: value => v.date(value, "data_inicio"),
    data_limite: value => v.date(value, "data_limite"),
    status: value => v.choice(value, "status", statuses),
  },
  required: ["nome", "valor_objetivo", "data_inicio", "data_limite"],
  defaults: { valor_atual: "0.00", status: "ativa" },
  allowedFilters: ["status", "busca"],
  filters(query, result) {
    if (query.status !== undefined) result.status = v.choice(query.status, "status", statuses);
    if (query.busca !== undefined) result.busca = v.text(query.busca, "busca");
  },
  refine(result) {
    if (result.data_inicio && result.data_limite && result.data_inicio > result.data_limite) {
      v.invalid("data_inicio deve ser anterior ou igual a data_limite.");
    }
  },
});
