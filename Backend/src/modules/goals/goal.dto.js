const v = require("../../shared/validation");

const statusPermitidos = ["ativa", "concluida", "cancelada"];

function validarValorNaoNegativo(value, campo) {
  const formatado = v.money(value, campo);
  if (formatado.startsWith("-")) {
    v.invalid(`${campo} não pode ser negativo.`);
  }
  return formatado;
}

const validators = {
  nome: (value) => v.text(value, "nome"),
  valor_objetivo: (value) => v.money(value, "valor_objetivo", true),
  valor_atual: (value) => validarValorNaoNegativo(value, "valor_atual"),
  data_inicio: (value) => v.date(value, "data_inicio"),
  data_limite: (value) => v.date(value, "data_limite"),
  status: (value) => v.choice(value, "status", statusPermitidos),
};

function parse(body, partial = false) {
  v.object(body, Object.keys(validators), partial);

  const result = partial ? {} : { valor_atual: "0.00", status: "ativa" };
  const obrigatorios = [
    "nome",
    "valor_objetivo",
    "data_inicio",
    "data_limite",
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

  if (result.data_inicio && result.data_limite && result.data_inicio > result.data_limite) {
    v.invalid("data_inicio deve ser anterior ou igual a data_limite.");
  }

  return result;
}

function filters(query) {
  const result = v.pagination(query, ["status", "busca"]);

  if (query.status !== undefined) {
    result.status = v.choice(query.status, "status", statusPermitidos);
  }

  if (query.busca !== undefined) {
    result.busca = v.text(query.busca, "busca");
  }

  return result;
}

module.exports = { parse, filters };
