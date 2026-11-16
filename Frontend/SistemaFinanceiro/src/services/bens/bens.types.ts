export type TipoBem =
  | "Imóvel"
  | "Veículo"
  | "Investimento"
  | "Eletrônico"
  | "Outros";

export interface Bem {
  id: string;
  nome: string;
  tipo: TipoBem;
  valor_aquisicao: number;
  valor_atual: number;
  data_aquisicao: string; // "YYYY-MM-DD"
  descricao: string;
}
