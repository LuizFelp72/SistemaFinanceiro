const v = require("../../shared/validation");
const { createDto } = require("../../shared/dto");
function month(value) {
  if (typeof value !== "string" || !/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(value)) v.invalid("Mês inválido.");
  v.date(value + "-01", "mes");
  return value;
}
module.exports = createDto({
  validators: {
    categoria_id: value => v.uuid(value, "categoria_id"),
    mes: month,
    moeda: value => {
      if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value)) v.invalid("Moeda inválida.");
      return value;
    },
    valor_limite: value => v.money(value, "valor_limite", true),
  },
  required: ["categoria_id", "mes", "valor_limite"],
  defaults: { moeda: "BRL" },
  allowedFilters: ["mes"],
  filters(query, result) { if (query.mes !== undefined) result.mes = month(query.mes); },
});
