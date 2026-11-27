import type { ReactNode } from "react";
import { Alert, Box, Button, TextField, type TextFieldProps } from "@mui/material";
import { Cartao, TituloCartao } from "../../components/Pagina.styles";

/** Campo com o rótulo acima, como no desenho. */
export function CampoPerfil({ rotulo, error, helperText, ...props }: TextFieldProps & { rotulo: string }) {
  const id = `campo-${props.name}`;
  return (
    <Box>
      <Box component="label" htmlFor={id} sx={{ display: "block", fontSize: 15, color: "text.secondary", mb: "4px" }}>{rotulo}</Box>
      <TextField {...props} id={id} fullWidth error={error} helperText={helperText}
        sx={{ "& .MuiOutlinedInput-root": { minHeight: 42 }, "& .MuiOutlinedInput-input": { py: "9px", px: "15px" } }} />
    </Box>
  );
}

/** Cartão com formulário, mensagem de erro e botão de salvar. */
export function CartaoFormulario({ titulo, erro, enviando, onSubmit, botao = "Salvar alterações", children }: {
  titulo: string; erro?: string; enviando?: boolean; botao?: string;
  onSubmit: React.FormEventHandler; children: ReactNode;
}) {
  return (
    <Cartao sx={{ p: "25px" }}>
      <form onSubmit={onSubmit} noValidate>
        <TituloCartao style={{ marginBottom: 16 }}>{titulo}</TituloCartao>
        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
        {children}
        <Button type="submit" variant="contained" disabled={enviando} sx={{ mt: "20px" }}>{botao}</Button>
      </form>
    </Cartao>
  );
}

export const GradeCampos = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: "20px" }}>{children}</Box>
);
