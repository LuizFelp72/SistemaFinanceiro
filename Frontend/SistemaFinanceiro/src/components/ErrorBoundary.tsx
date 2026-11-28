import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro inesperado na interface:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}>
        <Paper sx={{ maxWidth: 460, p: 3 }}>
          <Stack spacing={2}>
            <Typography component="h1" variant="h6">
              Algo deu errado
            </Typography>
            <Alert severity="error">
              Ocorreu um erro inesperado ao renderizar esta tela.
            </Alert>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Recarregar página
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }
}
