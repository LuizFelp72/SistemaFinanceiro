const v = require("../../shared/validation");

function validarValorNaoNegativo(value, campo) {
  const formatado = v.money(value, campo);
  if (formatado.startsWith("-")) {
    v.invalid(`${campo} não pode ser negativo.`);
  }
  return formatado;
}

const validators = {
  nome: (value) => v.text(value, "nome"),
  tipo: (value) => v.text(value, "tipo"),
  valor_aquisicao: (value) => validarValorNaoNegativo(value, "valor_aquisicao"),
  valor_atual: (value) => validarValorNaoNegativo(value, "valor_atual"),
  data_aquisicao: (value) => v.date(value, "data_aquisicao"),
  descricao: (value) => {
    if (value === null || value === "") {
      return null;
    }
    return v.text(value, "descricao", 5000);
  },
};

function parse(body, partial = false) {
  v.object(body, Object.keys(validators), partial);

  const result = partial ? {} : { descricao: null };
  const obrigatorios = [
    "nome",
    "tipo",
    "valor_aquisicao",
    "valor_atual",
    "data_aquisicao",
  ];

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
    result.tipo = v.text(query.tipo, "tipo");
  }

  if (query.busca !== undefined) {
    result.busca = v.text(query.busca, "busca");
  }

  return result;
}

module.exports = { parse, filters };
