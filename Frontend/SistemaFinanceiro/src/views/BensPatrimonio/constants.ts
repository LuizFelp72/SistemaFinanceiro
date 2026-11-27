import type { Bem, StatusBem } from "../../services/api/types";
import { cores } from "../../theme/theme";

export const CATEGORIAS = [
  { nome: "Imóveis", cor: cores.azul },
  { nome: "Investimentos", cor: cores.verde },
  { nome: "Veículos", cor: cores.ambar },
  { nome: "Outros", cor: cores.cinza },
];

/** `tipo` é texto livre na API; o que não for conhecido entra em "Outros". */
export const categoriaDe = (bem: Bem) =>
  CATEGORIAS.find((c) => c.nome.toLowerCase() === bem.tipo.toLowerCase())?.nome ?? "Outros";

export const STATUS: Record<StatusBem, string> = { ativo: "Ativo", vendido: "Vendido", inativo: "Inativo" };
