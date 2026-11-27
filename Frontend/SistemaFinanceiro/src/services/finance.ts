import { api } from "./api";

export type Resource = "accounts" | "assets" | "categories" | "goals" | "payment-methods" | "transactions" | "budgets";
export type Row = Record<string, string>;
export type Ledger = Record<Resource, Row[]>;
export const emptyLedger = (): Ledger => ({ accounts: [], assets: [], categories: [], goals: [], "payment-methods": [], transactions: [], budgets: [] });

export async function loadResource(resource: Resource, signal: AbortSignal) {
  const rows: Row[] = [];
  for (let page = 1; ; page++) {
    const batch = await api<{ data: Record<string, unknown>[]; total: number }>(`/${resource}?limit=100&page=${page}`, { signal });
    for (const row of batch.data) rows.push(Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "")])));
    if (!batch.data.length || rows.length >= batch.total) return rows;
  }
}
export const label = (value: string) => ({ transferencia: "Transferência", concluida: "Concluída", credito: "Crédito", debito: "Débito", pix: "Pix" }[value] ?? (value.charAt(0).toUpperCase() + value.slice(1)));
export function presentTransactions(db: Ledger) {
  const accounts = new Map(db.accounts.map(a => [a.id, a]));
  const categories = new Map(db.categories.map(c => [c.id, c.nome]));
  return db.transactions.map(t => ({
    valorDecimal: t.valor, id: t.id, descricao: t.descricao, data: t.data, valor: Number(t.valor),
    tipo: t.tipo as "receita" | "despesa" | "transferencia", status: t.status === "pendente" ? "pendente" as const : "concluída" as const,
    conta: accounts.get(t.conta_id)?.nome ?? "Conta indisponível", moeda: accounts.get(t.conta_id)?.moeda ?? "BRL",
    categoria: categories.get(t.categoria_id) ?? "Sem categoria", destino: accounts.get(t.conta_destino_id)?.nome,
  }));
}
