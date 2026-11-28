import { useState, type FormEvent } from "react";
import { Alert, Button, Stack, TextField } from "@mui/material";
import { api, setStoredToken } from "../../services/api";
import { useAuth, type User } from "../../auth/session";

export default function ProfileForm({ password = false }: { password?: boolean }) {
  const { user, updateUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setError(""); setSuccess("");
    if (password && data.nova_senha !== data.confirmacao) { setError("As senhas não coincidem."); return; }
    setBusy(true);
    try {
      if (password) {
        const result = await api<{token:string}>("/auth/password", {method:"POST",body:JSON.stringify({senha_atual:data.senha_atual,nova_senha:data.nova_senha})});
        setStoredToken(result.token);
        form.reset();
      } else {
        const result = await api<User>("/auth/me",{method:"PATCH",body:JSON.stringify(data)});
        updateUser(result);
      }
      setSuccess(password ? "Senha alterada. As outras sessões foram encerradas." : "Perfil atualizado.");
    } catch(e) { setError(e instanceof Error ? e.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }
  return <Stack component="form" onSubmit={submit} spacing={2}>
    {error && <Alert severity="error">{error}</Alert>}
    {success && <Alert severity="success">{success}</Alert>}
    {password ? <>
      <TextField label="Senha atual" name="senha_atual" type="password" autoComplete="current-password" required />
      <TextField label="Nova senha" name="nova_senha" type="password" autoComplete="new-password" required slotProps={{htmlInput:{minLength:8}}}/>
      <TextField label="Confirmar nova senha" name="confirmacao" type="password" autoComplete="new-password" required />
    </> : <>
      <TextField label="Nome completo" name="nome" defaultValue={user?.nome} required />
      <TextField label="E-mail" name="email" type="email" defaultValue={user?.email} required />
    </>}
    <Button type="submit" variant="contained" disabled={busy} sx={{alignSelf:"start"}}>{busy ? "Salvando…" : password ? "Alterar senha" : "Salvar perfil"}</Button>
  </Stack>;
}
