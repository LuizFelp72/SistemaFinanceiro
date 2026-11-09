const v = require("../../shared/validation");
const types = ["receita", "despesa", "transferencia"];
const statuses = ["concluida", "pendente"];
const nullableUuid = field => value => value === null ? null : v.uuid(value, field);
const validators = {
  descricao: value => v.text(value, "descricao"),
  valor: value => v.money(value, "valor", true),
  tipo: value => v.choice(value, "tipo", types),
  data: value => v.date(value, "data"),
  status: value => v.choice(value, "status", statuses),
  conta_id: value => v.uuid(value, "conta_id"),
  conta_destino_id: nullableUuid("conta_destino_id"),
  categoria_id: nullableUuid("categoria_id"),
  metodo_pagamento_id: nullableUuid("metodo_pagamento_id"),
  observacao: value => value === null ? null : v.text(value, "observacao", 10000),
};
function parse(body, partial = false) {
  v.object(body, Object.keys(validators), partial);
  const result = partial ? {} : { status: "concluida", conta_destino_id: null, categoria_id: null, metodo_pagamento_id: null, observacao: null };
  if (!partial) for (const field of ["descricao", "valor", "tipo", "data", "conta_id"]) if (!(field in body)) v.invalid(`${field} é obrigatório.`);
  for (const [field, value] of Object.entries(body)) result[field] = validators[field](value);
  return result;
}
function filters(query) {
  const result = v.pagination(query, ["tipo", "status", "conta_id", "categoria_id", "data_inicio", "data_fim", "busca"]);
  for (const field of ["conta_id", "categoria_id"]) if (query[field] !== undefined) result[field] = v.uuid(query[field], field);
  for (const field of ["data_inicio", "data_fim"]) if (query[field] !== undefined) result[field] = v.date(query[field], field);
  if (query.tipo !== undefined) result.tipo = v.choice(query.tipo, "tipo", types);
  if (query.status !== undefined) result.status = v.choice(query.status, "status", statuses);
  if (query.busca !== undefined) result.busca = v.text(query.busca, "busca");
  if (result.data_inicio && result.data_fim && result.data_inicio > result.data_fim) v.invalid("data_inicio deve ser anterior ou igual a data_fim.");
  return result;
}
module.exports = { parse, filters };
