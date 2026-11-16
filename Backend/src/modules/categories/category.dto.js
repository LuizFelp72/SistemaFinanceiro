const v = require("../../shared/validation");

const tiposPermitidos = ["receita", "despesa"];

const validators = {
  nome: (value) => v.text(value, "nome"),
  tipo: (value) => v.choice(value, "tipo", tiposPermitidos),
  cor: (value) => {
    if (value === null || value === "") {
      return null;
    }
    return v.text(value, "cor", 50);
  },
  icone: (value) => {
    if (value === null || value === "") {
      return null;
    }
    return v.text(value, "icone", 100);
  },
};

function parse(body, partial = false) {
  v.object(body, Object.keys(validators), partial);

  const result = partial ? {} : { cor: null, icone: null };
  const obrigatorios = ["nome", "tipo"];

  if (!partial) {
    for (const campo of obrigatorios) {
      if (!(campo in body)) {
        v.invalid(`${campo} é obrigatório.`);
      }
    }
  }

  for (const [campo, valor] of Object.entries(body)) {
    result[campo] = validators[campo](valor);
  }

  return result;
}

function filters(query) {
  const result = v.pagination(query, ["tipo", "busca"]);

  if (query.tipo !== undefined) {
    result.tipo = v.choice(query.tipo, "tipo", tiposPermitidos);
  }

  if (query.busca !== undefined) {
    result.busca = v.text(query.busca, "busca");
  }

  return result;
}

module.exports = { parse, filters };
