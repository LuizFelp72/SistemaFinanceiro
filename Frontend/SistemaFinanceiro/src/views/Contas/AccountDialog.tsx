import { useState, type FormEvent } from "react";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, TextField } from "@mui/material";
import { api } from "../../services/api";
import { tipos, type Conta } from "./accounts";

export type Action = { mode: "new" } | { mode: "edit" | "delete"; conta: Conta };
interface Props { action: Action; close(): void; saved(message: string): void }
export default function AccountDialog({ action, close, saved }: Props) {
  const conta = action.mode === "new" ? undefined : action.conta;
  const removing = action.mode === "delete";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const body = removing ? undefined : JSON.stringify({
      nome: String(form.get("nome")).trim(), tipo: form.get("tipo"),
      saldo_inicial: String(form.get("saldo")).replace(",", "."),
      moeda: String(form.get("moeda")).toUpperCase(), ativo: form.has("ativo"),
    });
    setBusy(true); setError("");
    try {
      await api("/accounts" + (conta ? "/" + conta.id : ""), { method: removing ? "DELETE" : conta ? "PATCH" : "POST", body });
      saved(removing ? "Conta excluída." : conta ? "Alterações salvas." : "Conta criada.");
    } catch (err) { setError(err instanceof Error ? err.message : "Falha ao salvar."); setBusy(false); }
  }
  return <Dialog open onClose={busy ? undefined : close} fullWidth maxWidth="xs" aria-labelledby="account-dialog-title">
    <form onSubmit={submit}>
      <DialogTitle id="account-dialog-title">{removing ? "Excluir conta?" : conta ? "Editar conta" : "Nova conta"}</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {removing ? <p>Confirma a exclusão de <strong>{conta?.nome}</strong>? Contas com movimentações podem ser desativadas na edição.</p> : <>
          <TextField autoFocus name="nome" label="Nome da conta" required defaultValue={conta?.nome} slotProps={{ htmlInput: { maxLength: 255 } }} />
          <TextField select name="tipo" label="Tipo" defaultValue={conta?.tipo ?? "corrente"}>{Object.entries(tipos).map(([id, label]) => <MenuItem key={id} value={id}>{label}</MenuItem>)}</TextField>
          <TextField name="saldo" required label="Saldo inicial" defaultValue={conta?.saldo_inicial ?? "0,00"} helperText="Use até duas casas decimais." slotProps={{ htmlInput: { inputMode: "decimal", pattern: "-?[0-9]{1,13}([.,][0-9]{1,2})?" } }} />
          <TextField name="moeda" required label="Moeda" defaultValue={conta?.moeda ?? "BRL"} helperText="Código de três letras, como BRL." slotProps={{ htmlInput: { maxLength: 3, pattern: "[a-zA-Z]{3}" } }} />
          <FormControlLabel control={<Checkbox name="ativo" defaultChecked={conta?.ativo ?? true} />} label="Conta ativa" />
        </>}
      </Stack></DialogContent>
      <DialogActions><Button autoFocus={removing} disabled={busy} onClick={close}>Cancelar</Button><Button type="submit" disabled={busy} variant="contained" color={removing ? "error" : "primary"}>{busy ? "Aguarde…" : removing ? "Excluir" : "Salvar"}</Button></DialogActions>
    </form>
  </Dialog>;
}
