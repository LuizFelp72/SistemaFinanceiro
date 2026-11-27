/** Elementos de exibição de transações usados em mais de uma tela. */
import { Box } from "@mui/material";
import { Selo } from "./Controles";
import type { Categoria, Transacao } from "../services/api/types";
import { cores } from "../theme/theme";
import { formatarMoeda } from "../utils/formato";
import { TIPOS } from "./Transacao.constants";

export function Tipo({ tipo }: { tipo: Transacao["tipo"] }) {
  return <Box component="span" sx={{ color: TIPOS[tipo].cor, fontWeight: 600 }}>{TIPOS[tipo].rotulo}</Box>;
}

export function Valor({ transacao }: { transacao: Transacao }) {
  const { cor, sinal } = TIPOS[transacao.tipo];
  return <Box component="span" sx={{ color: cor, fontWeight: 600 }}>{sinal}{formatarMoeda(transacao.valor)}</Box>;
}

export function ChipCategoria({ categoria }: { categoria?: Categoria }) {
  if (!categoria) return <Box component="span" sx={{ color: "text.secondary" }}>—</Box>;
  return <Selo cor={categoria.cor ?? cores.cinza}>{categoria.nome}</Selo>;
}
