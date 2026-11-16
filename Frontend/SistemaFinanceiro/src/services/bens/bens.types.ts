export type CategoriaBem = "Imóveis" | "Veículos" | "Investimentos" | "Outros";

export interface Bem {
  id: string;
  nome: string;
  categoria: CategoriaBem;
  valorAtual: number;
  variacao: number;
  dataAquisicao: string;
}
