import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import { useAuth } from "../../auth/session";
import LoginForm from "./components/LoginForm";
import LoginIllustration from "./components/LoginIllustration";
import { Container, LeftPanel, FormWrapper } from "./styles";

export default function Login() {
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  async function submit(data: { email: string; password: string; nome?: string }) {
    setBusy(true);
    setError("");
    try {
      await signIn(data.email, data.password, creating ? data.nome?.trim() : undefined);
      navigate("/dashboard", { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : "Falha ao entrar."); }
    finally { setBusy(false); }
  }
  return <Container><LeftPanel><FormWrapper>
    <Typography component="h1" variant="h4" gutterBottom>{creating ? "Crie sua conta" : "Faça seu login"}</Typography>
    <LoginForm key={String(creating)} creating={creating} onSubmit={submit} error={error} />
    <Button component={Link} to="/recuperar-senha">Esqueci minha senha</Button>
    <Button disabled={busy} onClick={() => { setCreating(!creating); setError(""); }}>{creating ? "Voltar ao login" : "Criar cadastro"}</Button>
  </FormWrapper></LeftPanel><LoginIllustration /></Container>;
}
