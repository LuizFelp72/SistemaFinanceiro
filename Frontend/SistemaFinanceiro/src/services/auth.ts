import type { Usuario } from "./api/types";
import { ErroApi, ler } from "./mock/db";

/** Mesmo formato de POST /auth/login. Aceita o e-mail do usuário ou "admin". */
export function entrar(email: string, senha: string): { user: Usuario; token: string } {
  const banco = ler();
  const login = email.trim().toLowerCase();
  const usuario = login.split("@")[0];
  if ((login !== banco.usuario.email.toLowerCase() && usuario !== "admin") || senha !== banco.senha) {
    throw new ErroApi(401, "E-mail ou senha inválidos.");
  }
  return { user: banco.usuario, token: "token-demonstracao" };
}
