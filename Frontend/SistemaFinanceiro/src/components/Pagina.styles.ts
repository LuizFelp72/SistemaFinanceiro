import { Box, Paper, styled } from "@mui/material";

export const Cartao = styled(Paper)(({ theme }) => ({
  minWidth: 0,
  padding: 20,
  borderRadius: 16,
  [theme.breakpoints.down("sm")]: { padding: 16 },
}));

export const TituloCartao = styled("h2")({
  margin: 0,
  fontSize: 17,
  fontWeight: 600,
});

/** Grade de cartões de resumo: 4 colunas, 2 em telas médias e 1 no celular. */
export const GradeResumo = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 22,
  [theme.breakpoints.down("lg")]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 },
  [theme.breakpoints.down("sm")]: { gridTemplateColumns: "minmax(0, 1fr)" },
}));
