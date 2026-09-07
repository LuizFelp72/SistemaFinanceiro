import { transacoesMock } from "./transacoes.mock";
import type { Transacao } from "./transacoes.types";

/**
 * Por enquanto retorna o mock direto.
 * Quando a API existir, é só trocar o corpo desta função
 * por um fetch/axios (e tornar ela async) — a view não muda.
 */
export function listarTransacoes(): Transacao[] {
  return [...transacoesMock];
}