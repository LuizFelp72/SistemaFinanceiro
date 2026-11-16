import { bensMock } from "./bens.mock";
import type { Bem } from "./bens.types";

/**
 * Por enquanto retorna o mock direto (seguindo o padrão de transacoes.service.ts).
 * Quando a integração com a API (/api/v1/assets) for ativada no frontend,
 * basta substituir pelo fetch/axios.
 */
export function listarBens(): Bem[] {
  return [...bensMock];
}
