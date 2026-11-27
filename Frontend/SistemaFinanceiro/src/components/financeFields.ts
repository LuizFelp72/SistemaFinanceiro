import { label, type Ledger, type Row } from "../services/finance";

export type Editable = "goals" | "payment-methods" | "assets" | "categories" | "transactions";
export const singular = { goals: "meta", categories: "categoria", assets: "bem", transactions: "transação", "payment-methods": "método de pagamento" };
export type Field = { key: string; title: string; kind?: "date" | "money" | "select" | "text"; options?: [string,string][]; optional?: boolean; initial?: string };
const text = (key: string, title: string, optional = false): Field => ({ key, title, optional });
const date = (key: string, title: string): Field => ({ key, title, kind: "date" });
const money = (key: string, title: string): Field => ({ key, title, kind: "money" });
const choices = (key: string, title: string, values: string[], initial?: string): Field => ({
  key, title, kind: "select", options: values.map(v => [v, label(v)]), initial: initial ?? values[0],
});
const reference = (key: string, title: string, rows: Row[], optional = false): Field => ({
  key, title, kind: "select", options: rows.map(r => [r.id, r.nome]), optional,
});
export function fields(resource: Editable, db: Ledger, values: Row): Field[] {
  const nome = text("nome", "Nome");
  switch (resource) {
    case "categories": return [nome, choices("tipo", "Tipo", ["despesa","receita"]), text("cor","Cor (opcional)",true), text("icone","Ícone (opcional)",true)];
    case "payment-methods": return [nome, choices("tipo","Tipo",["pix","dinheiro","credito","debito","boleto","outro"]), { key:"ativo", title:"Situação", kind:"select", initial:"true", options:[["true","Ativo"],["false","Inativo"]] }];
    case "goals": return [nome, money("valor_objetivo","Valor da meta"), { ...money("valor_atual","Valor acumulado"), initial:"0" }, date("data_inicio","Data inicial"), date("data_limite","Prazo"), choices("status","Situação",["ativa","concluida","cancelada"])];
    case "assets": return [nome, text("tipo","Tipo de bem"),money("valor_aquisicao","Valor de aquisição"),money("valor_atual","Valor atual"),date("data_aquisicao","Data de aquisição"),text("descricao","Descrição",true)];
    case "transactions": {
      const tipo = values.tipo || "despesa";
      const accounts = db.accounts.filter(a => a.ativo === "true");
      const moeda = accounts.find(a => a.id === values.conta_id)?.moeda;
      return [text("descricao","Descrição"),choices("tipo","Tipo",["despesa","receita","transferencia"]),money("valor","Valor"),date("data","Data"),
        reference("conta_id","Conta de origem",accounts),
        tipo === "transferencia" ? reference("conta_destino_id","Conta de destino",accounts.filter(a => a.id !== values.conta_id && a.moeda === moeda)) :
          reference("categoria_id","Categoria",db.categories.filter(c => c.tipo === tipo),true),
        reference("metodo_pagamento_id","Método de pagamento",db["payment-methods"].filter(m => m.ativo === "true"),true),
        choices("status","Situação",["concluida","pendente"]),text("observacao","Observação",true)];
    }
  }
}
