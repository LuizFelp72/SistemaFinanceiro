import { Button, styled } from "@mui/material";
import { cores } from "../theme/theme";

export const BotaoContorno = styled(Button)({
  color: cores.texto,
  borderColor: cores.borda,
  backgroundColor: cores.branco,
  fontWeight: 400,
  "&:hover": { borderColor: "#CBD5E1", backgroundColor: cores.fundoTabela },
});
