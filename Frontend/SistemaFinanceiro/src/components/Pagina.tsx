import type { ReactNode } from "react";
import { Alert, Box, Button, CircularProgress, Typography, styled } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import { cores } from "../theme/theme";
import { Cartao } from "./Pagina.styles";

const Cabecalho = styled("header")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 16,
  minHeight: 96,
  padding: "18px 31px",
  backgroundColor: cores.branco,
  [theme.breakpoints.down("sm")]: { padding: "16px" },
}));

const Corpo = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 22,
  padding: 31,
  minWidth: 0,
  [theme.breakpoints.down("sm")]: { padding: 16, gap: 16 },
}));

interface PaginaProps {
  titulo: string;
  subtitulo: string;
  acoes?: ReactNode;
  children?: ReactNode;
}

export function Pagina({ titulo, subtitulo, acoes, children }: PaginaProps) {
  return (
    <>
      <Cabecalho>
        <Box>
          <Typography component="h1" sx={{ fontSize: 25, fontWeight: 600, lineHeight: 1.25 }}>{titulo}</Typography>
          <Typography sx={{ fontSize: 15, color: "text.secondary" }}>{subtitulo}</Typography>
        </Box>
        {acoes && <Box className="nao-imprimir" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>{acoes}</Box>}
      </Cabecalho>
      <Corpo>{children}</Corpo>
    </>
  );
}

/** Mostra carregamento ou erro até que os dados estejam disponíveis. */
export function Carregando({ titulo, subtitulo, erro, repetir }: {
  titulo: string; subtitulo: string; erro?: string; repetir: () => void;
}) {
  return (
    <Pagina titulo={titulo} subtitulo={subtitulo}>
      {erro ? (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={repetir}>Tentar novamente</Button>}>{erro}</Alert>
      ) : (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}><CircularProgress aria-label="Carregando" /></Box>
      )}
    </Pagina>
  );
}

/** Texto verde ou vermelho com seta de tendência. */
export function Tendencia({ valor, children, inverter = false }: {
  valor: number; children: ReactNode; inverter?: boolean;
}) {
  const positivo = inverter ? valor <= 0 : valor >= 0;
  const Icone = (inverter ? !positivo : positivo) ? TrendingUpRoundedIcon : TrendingDownRoundedIcon;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: positivo ? cores.verde : cores.vermelho }}>
      <Icone sx={{ fontSize: 16 }} />
      {children}
    </Box>
  );
}

interface ResumoProps {
  titulo: string;
  valor: ReactNode;
  detalhe?: ReactNode;
  icone?: { Icone: SvgIconComponent; cor: string; fundo: string };
}

export function CartaoResumo({ titulo, valor, detalhe, icone }: ResumoProps) {
  return (
    <Cartao sx={{ position: "relative", minHeight: icone ? 136 : 112 }}>
      <Typography component="h2" sx={{ fontSize: 15, color: "text.secondary", pr: icone ? 6 : 0 }}>{titulo}</Typography>
      {icone && (
        <Box sx={{ position: "absolute", top: 18, right: 18, width: 36, height: 36, borderRadius: "12px", display: "grid", placeItems: "center", color: icone.cor, bgcolor: icone.fundo }}>
          <icone.Icone sx={{ fontSize: 19 }} />
        </Box>
      )}
      <Typography sx={{ fontSize: 23, fontWeight: 600, mt: icone ? "22px" : "5px", fontVariantNumeric: "tabular-nums" }}>{valor}</Typography>
      {detalhe && <Typography component="div" sx={{ fontSize: 14, color: "text.secondary", mt: "4px" }}>{detalhe}</Typography>}
    </Cartao>
  );
}
