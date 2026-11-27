import { Box, styled } from "@mui/material";
import { cores } from "../../../../theme/theme";

export const CardContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  margin: "8px 5px 15px",
  padding: "8px 10px",
  borderRadius: 12,
  color: cores.menuTexto,
  textDecoration: "none",
  "&:hover": { backgroundColor: "rgba(255,255,255,.05)" },
  [theme.breakpoints.down("md")]: {
    justifyContent: "center",
    padding: 8,
    "& .usuario-texto, & .usuario-seta": { display: "none" },
  },
}));
