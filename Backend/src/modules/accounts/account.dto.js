const v = require("../../shared/validation");
const types = ["corrente", "poupanca", "carteira", "investimento", "outro"];
const validators = {
  nome: value => v.text(value, "nome"),
  tipo: value => v.choice(value, "tipo", types),
  saldo_inicial: value => v.money(value, "saldo_inicial"),
  moeda: value => {
    if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value)) v.invalid("moeda deve conter três letras maiúsculas, como BRL.");
    return value;
  },
  ativo: value => v.boolean(value, "ativo"),
};
function parse(body, partial = false) {
  v.object(body, Object.keys(validators), partial);
  const result = partial ? {} : { saldo_inicial: "0.00", moeda: "BRL", ativo: true };
  if (!partial) for (const field of ["nome", "tipo"]) if (!(field in body)) v.invalid(`${field} é obrigatório.`);
  for (const [field, value] of Object.entries(body)) result[field] = validators[field](value);
  return result;
}
function filters(query) {
  const result = v.pagination(query, ["ativo", "tipo"]);
  if (query.ativo !== undefined) {
    v.choice(query.ativo, "ativo", ["true", "false"]);
    result.ativo = query.ativo === "true";
  }
  if (query.tipo !== undefined) result.tipo = v.choice(query.tipo, "tipo", types);
  return result;
}
module.exports = { parse, filters };
