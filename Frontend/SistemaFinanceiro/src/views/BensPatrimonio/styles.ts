import { Box, Paper, styled } from "@mui/material";

export const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2.5),
  maxWidth: 1800,
  margin: "0 auto",
  minWidth: 0,
}));

export const Summary = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr)) minmax(270px, 1.25fr)",
  gap: theme.spacing(2),
  [theme.breakpoints.down("xl")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "minmax(0, 1fr)",
  },
}));

export const Card = styled(Paper)(({ theme }) => ({
  border: "1px solid #EAECF0",
  borderRadius: 12,
  padding: theme.spacing(2.5),
  minWidth: 0,
  boxShadow: "0 2px 6px rgba(16, 24, 40, .015)",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));
