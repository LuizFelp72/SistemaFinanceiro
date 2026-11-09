const { AppError } = require("./errors");

function invalid(message) { throw new AppError(400, message); }
function uuid(value, field = "id") {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    invalid(`${field} deve ser um UUID válido.`);
  }
  return value.toLowerCase();
}
function text(value, field, max = 255) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) invalid(`${field} deve conter de 1 a ${max} caracteres.`);
  return value.trim();
}
function choice(value, field, values) {
  if (!values.includes(value)) invalid(`${field} deve ser um de: ${values.join(", ")}.`);
  return value;
}
function boolean(value, field) {
  if (typeof value !== "boolean") invalid(`${field} deve ser booleano.`);
  return value;
}
function money(value, field, positive = false) {
  if (!["string", "number"].includes(typeof value) || !/^-?\d{1,13}(\.\d{1,2})?$/.test(String(value))) {
    invalid(`${field} deve ser um decimal com até 13 dígitos inteiros e 2 casas decimais.`);
  }
  const [integer, decimals = ""] = String(value).split(".");
  const cents = BigInt(integer.replace("-", "")) * 100n + BigInt(decimals.padEnd(2, "0"));
  if (positive && (String(value).startsWith("-") || cents === 0n)) invalid(`${field} deve ser maior que zero.`);
  return `${String(value).startsWith("-") && cents !== 0n ? "-" : ""}${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}
function date(value, field) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000") ||
      !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) invalid(`${field} deve ser uma data válida no formato AAAA-MM-DD.`);
  return value;
}
function object(value, fields, partial) {
  if (!value || Array.isArray(value) || typeof value !== "object") invalid("Envie um objeto JSON.");
  if (!Object.keys(value).length && partial) invalid("Informe ao menos um campo para atualizar.");
  if (Object.keys(value).some(key => !fields.includes(key))) invalid("A requisição contém campos desconhecidos ou protegidos.");
}
function pagination(query, allowed = []) {
  if (Object.keys(query).some(key => !["page", "limit", ...allowed].includes(key))) invalid("Filtro desconhecido.");
  const result = {};
  for (const [field, fallback, max] of [["page", 1, 1000000], ["limit", 20, 100]]) {
    const value = query[field] ?? String(fallback);
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value) || Number(value) > max) invalid(`${field} deve estar entre 1 e ${max}.`);
    result[field] = Number(value);
  }
  return result;
}
module.exports = { invalid, uuid, text, choice, boolean, money, date, object, pagination };
