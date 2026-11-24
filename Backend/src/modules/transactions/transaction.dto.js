const v = require("../../shared/validation");
const { createDto } = require("../../shared/dto");

const types = ["receita", "despesa", "transferencia"];
const statuses = ["concluida", "pendente"];

module.exports = createDto({
  validators: {
    descricao: value => v.text(value, "descricao"),
    valor: value => v.money(value, "valor", true),
    tipo: value => v.choice(value, "tipo", types),
    data: value => v.date(value, "data"),
    status: value => v.choice(value, "status", statuses),
    conta_id: value => v.uuid(value, "conta_id"),
    conta_destino_id: value => v.nullableUuid(value, "conta_destino_id"),
    categoria_id: value => v.nullableUuid(value, "categoria_id"),
    metodo_pagamento_id: value => v.nullableUuid(value, "metodo_pagamento_id"),
    observacao: value => (value === null ? null : v.text(value, "observacao", 10000)),
  },
  required: ["descricao", "valor", "tipo", "data", "conta_id"],
  defaults: { status: "concluida", conta_destino_id: null, categoria_id: null, metodo_pagamento_id: null, observacao: null },
  allowedFilters: ["tipo", "status", "conta_id", "categoria_id", "data_inicio", "data_fim", "busca"],
  filters(query, result) {
    for (const field of ["conta_id", "categoria_id"]) if (query[field] !== undefined) result[field] = v.uuid(query[field], field);
    for (const field of ["data_inicio", "data_fim"]) if (query[field] !== undefined) result[field] = v.date(query[field], field);
    if (query.tipo !== undefined) result.tipo = v.choice(query.tipo, "tipo", types);
    if (query.status !== undefined) result.status = v.choice(query.status, "status", statuses);
    if (query.busca !== undefined) result.busca = v.text(query.busca, "busca");
    if (result.data_inicio && result.data_fim && result.data_inicio > result.data_fim) v.invalid("data_inicio deve ser anterior ou igual a data_fim.");
  },
});
