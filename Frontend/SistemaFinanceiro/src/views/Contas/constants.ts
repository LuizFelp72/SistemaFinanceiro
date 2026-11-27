import type { TipoConta } from "../../services/api/types";

export const TIPOS_CONTA: Record<TipoConta, string> = {
  corrente: "Conta Corrente",
  poupanca: "Conta Poupança",
  investimento: "Conta Investimento",
  cartao_credito: "Cartão de Crédito",
  carteira: "Carteira",
  outro: "Outra conta",
};

/** Rótulo curto para o eixo do gráfico: "Conta Principal" vira "Principal". */
export function nomeCurtoConta(nome: string) {
  const curto = nome.replace(/^(Conta|Cartão de)\s+/i, "");
  return curto.length > 10 ? `${curto.slice(0, 6)}.` : curto;
}
