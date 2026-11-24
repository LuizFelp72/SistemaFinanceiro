const v = require("./validation");

// Monta parse/filters de um módulo a partir de validadores por campo.
// - validators: { campo: valor => valorNormalizado }
// - required: campos obrigatórios na criação
// - defaults: valores aplicados na criação (objeto)
// - filters: função (query, result) que acrescenta filtros validados a `result`
// - allowedFilters: nomes de filtros aceitos além de page/limit
// - refine: função (result, partial) para regras entre campos
function createDto({ validators, required = [], defaults = {}, filters, allowedFilters = [], refine }) {
  const fields = Object.keys(validators);

  function parse(body, partial = false) {
    v.object(body, fields, partial);
    if (!partial) {
      for (const field of required) if (!(field in body)) v.invalid(`${field} é obrigatório.`);
    }
    const result = partial ? {} : { ...defaults };
    for (const [field, value] of Object.entries(body)) result[field] = validators[field](value);
    if (refine) refine(result, partial);
    return result;
  }

  function parseFilters(query) {
    const result = v.pagination(query, allowedFilters);
    if (filters) filters(query, result);
    return result;
  }

  return { parse, filters: parseFilters };
}

module.exports = { createDto };
