import { api } from "../../services/api";

export const tipos = { corrente: "Conta corrente", poupanca: "Poupança", carteira: "Carteira", investimento: "Investimento", outro: "Outra conta" };
export interface Conta {
  id: string; nome: string; tipo: keyof typeof tipos; moeda: string;
  saldo_inicial: string; saldo_atual: string; ativo: boolean;
}
interface Page<T> { data: T[]; total: number }
export async function listarContas(signal: AbortSignal) {
  const contas: Conta[] = [];
  for (let page = 1; ; page++) {
    const result = await api<Page<Conta>>(`/accounts?limit=100&page=${page}`, { signal });
    contas.push(...result.data);
    if (!result.data.length || contas.length >= result.total) return contas;
  }
}
export function centavos(decimal: string) {
  const [whole, fraction = ""] = decimal.replace("-", "").split(".");
  return BigInt(whole + fraction.padEnd(2, "0")) * (decimal.startsWith("-") ? -1n : 1n);
}
export function dinheiro(valor: bigint, moeda: string) {
  const magnitude = valor < 0n ? -valor : valor;
  const formatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda, minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .formatToParts(magnitude / 100n).map(part => part.type === "fraction" ? String(magnitude % 100n).padStart(2, "0") : part.value).join("");
  return valor < 0n ? "-" + formatted : formatted;
}
