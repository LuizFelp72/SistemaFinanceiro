import { Box, styled } from "@mui/material";

export const ChartGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.92fr) minmax(0, 1fr) minmax(0, 1fr)",
  gap: 22,
  [theme.breakpoints.down("xl")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    "& > :first-of-type": { gridColumn: "1 / -1" },
  },
  [theme.breakpoints.down("md")]: { gridTemplateColumns: "minmax(0, 1fr)" },
}));

export const DetailGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.94fr) minmax(0, 1fr)",
  gap: 22,
  [theme.breakpoints.down("lg")]: { gridTemplateColumns: "minmax(0, 1fr)" },
}));

export const Ponto = styled("span")({
  width: 9,
  height: 9,
  flexShrink: 0,
  borderRadius: "50%",
});
