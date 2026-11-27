const v = require("../../shared/validation");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function email(value) {
  const normalized = v.text(value, "email").toLowerCase();
  if (!EMAIL.test(normalized)) v.invalid("email deve ser um endereço válido.");
  return normalized;
}

// bcrypt considera apenas os 72 primeiros bytes; por isso o limite é em bytes.
function newPassword(value) {
  if (typeof value !== "string" || value.length < 8 || Buffer.byteLength(value) > 72) {
    v.invalid("senha deve conter de 8 a 72 caracteres.");
  }
  return value;
}

function register(body) {
  v.object(body, ["nome", "email", "senha"], false);
  for (const field of ["nome", "email", "senha"]) if (!(field in body)) v.invalid(`${field} é obrigatório.`);
  return { nome: v.text(body.nome, "nome"), email: email(body.email), senha: newPassword(body.senha) };
}

function login(body) {
  v.object(body, ["email", "senha"], false);
  for (const field of ["email", "senha"]) if (!(field in body)) v.invalid(`${field} é obrigatório.`);
  if (typeof body.senha !== "string" || !body.senha || Buffer.byteLength(body.senha) > 72) v.invalid("senha inválida.");
  return { email: email(body.email), senha: body.senha };
}

function profile(body) {
  v.object(body, ["nome","email"], true);
  const result = {};
  if ("nome" in body) result.nome = v.text(body.nome,"nome");
  if ("email" in body) result.email = email(body.email);
  return result;
}
function password(body) {
  v.object(body, ["senha_atual","nova_senha"], false);
  if (typeof body.senha_atual !== "string" || !body.senha_atual || Buffer.byteLength(body.senha_atual) > 72) v.invalid("Informe sua senha atual.");
  return { senha_atual: body.senha_atual, nova_senha: newPassword(body.nova_senha) };
}
function forgot(body) { v.object(body, ["email"], false); return { email: email(body.email) }; }
function reset(body) {
  v.object(body, ["token","nova_senha"], false);
  if (typeof body.token !== "string" || !/^[a-f0-9]{64}$/.test(body.token)) v.invalid("Link inválido.");
  return { token: body.token, nova_senha: newPassword(body.nova_senha) };
}
module.exports = { register, login, profile, password, forgot, reset };
