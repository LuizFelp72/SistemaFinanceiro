export type TipoTransacao = "receita" | "despesa";
export type StatusTransacao = "concluída" | "pendente";

export interface Transacao {
  id: string;
  data: string; // "2025-05-31"
  descricao: string;
  categoria: string;
  tipo: TipoTransacao;
  valor: number;
  status: StatusTransacao;
  conta: string;
}