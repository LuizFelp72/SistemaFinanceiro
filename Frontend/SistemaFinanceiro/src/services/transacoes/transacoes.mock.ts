import type { Transacao } from "./transacoes.types";

export const transacoesMock: Transacao[] = [
  { id: "1", data: "2025-05-31", descricao: "Salário", categoria: "Salário", tipo: "receita", valor: 7850.0, status: "concluída", conta: "Conta Principal" },
  { id: "2", data: "2025-05-30", descricao: "Supermercado", categoria: "Alimentação", tipo: "despesa", valor: 326.75, status: "concluída", conta: "Conta Principal" },
  { id: "3", data: "2025-05-29", descricao: "Freelancer Projeto X", categoria: "Trabalho", tipo: "receita", valor: 1250.0, status: "concluída", conta: "Conta Principal" },
  { id: "4", data: "2025-05-28", descricao: "Amazon", categoria: "Compras", tipo: "despesa", valor: 189.9, status: "concluída", conta: "Cartão de Crédito" },
  { id: "5", data: "2025-05-27", descricao: "Academia", categoria: "Saúde", tipo: "despesa", valor: 129.9, status: "concluída", conta: "Conta Principal" },
  { id: "6", data: "2025-05-26", descricao: "Uber", categoria: "Transporte", tipo: "despesa", valor: 25.4, status: "pendente", conta: "Cartão de Crédito" },
  { id: "7", data: "2025-05-25", descricao: "Venda Notebook", categoria: "Outros", tipo: "receita", valor: 2100.0, status: "concluída", conta: "Conta Principal" },
  { id: "8", data: "2025-05-24", descricao: "Netflix", categoria: "Entretenimento", tipo: "despesa", valor: 55.9, status: "concluída", conta: "Cartão de Crédito" },
];