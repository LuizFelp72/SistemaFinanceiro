import { useEffect, useState, type FormEvent } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, List, ListItem, ListItemText, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { api } from "../../services/api";
import { formatarData } from "../../utils/financeiro";
import { centavos, dinheiro, type Conta } from "./accounts";

export function Extrato({ conta, close }: { conta: Conta; close(): void }) {
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ data: { id: string; descricao: string; data: string; valor: string; tipo: string; conta_id: string; status: string }[]; total: number } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    api<NonNullable<typeof result>>(`/transactions?conta_id=${conta.id}&limit=10&page=${page}`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setResult(data); })
      .catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [conta.id, page, retry]);
  function go(next: number) { setResult(null); setError(""); setPage(next); }
  return <Dialog open fullWidth maxWidth="sm" onClose={close} aria-labelledby="statement-title">
    <DialogTitle id="statement-title">Extrato · {conta.nome}</DialogTitle>
    <DialogContent>{error ? <Alert severity="error" action={<Button onClick={() => { setError(""); setRetry(r => r + 1); }}>Tentar novamente</Button>}>{error}</Alert> :
      !result ? <LinearProgress aria-label="Carregando extrato" /> : !result.total ? <Typography>Nenhuma movimentação nesta conta.</Typography> :
      <><List>{result.data.map(m => {
        const debit = m.tipo === "despesa" || (m.tipo === "transferencia" && m.conta_id === conta.id);
        return <ListItem key={m.id} disableGutters divider sx={{ gap: 2, flexWrap: "wrap" }}>
          <ListItemText primary={m.descricao} secondary={formatarData(m.data) + (m.status === "pendente" ? " · Pendente" : "")} />
          <Typography color={debit ? "error.dark" : "success.dark"}>{dinheiro(centavos(m.valor) * (debit ? -1n : 1n), conta.moeda)}</Typography>
        </ListItem>;
      })}</List><Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button disabled={page === 1} onClick={() => go(page - 1)}>Anterior</Button><Button disabled={page * 10 >= result.total} onClick={() => go(page + 1)}>Próxima</Button>
      </Box></>}
    </DialogContent><DialogActions><Button onClick={close}>Fechar</Button></DialogActions>
  </Dialog>;
}
export function Transferir({ origem, destinos, close, saved }: { origem: Conta; destinos: Conta[]; close(): void; saved(message: string): void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      await api("/transactions", { method: "POST", body: JSON.stringify({
        tipo: "transferencia", descricao: fields.get("descricao"), data: fields.get("data"),
        valor: String(fields.get("valor")).replace(",", "."), conta_id: origem.id, conta_destino_id: fields.get("destino"),
      }) });
      saved("Transferência concluída.");
    } catch (err) { setError(err instanceof Error ? err.message : "Falha ao transferir."); setBusy(false); }
  }
  return <Dialog open fullWidth maxWidth="xs" onClose={busy ? undefined : close} aria-labelledby="transfer-title"><form onSubmit={submit}>
    <DialogTitle id="transfer-title">Transferir de {origem.nome}</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField select label="Conta de destino" name="destino" required defaultValue="">{destinos.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}</TextField>
      <TextField label={`Valor em ${origem.moeda}`} name="valor" required slotProps={{ htmlInput: { inputMode: "decimal", pattern: "[0-9]{1,13}([.,][0-9]{1,2})?" } }} />
      <TextField type="date" label="Data" name="data" required slotProps={{ inputLabel: { shrink: true } }} />
      <TextField label="Descrição" name="descricao" required defaultValue="Transferência entre contas" />
    </Stack></DialogContent>
    <DialogActions><Button disabled={busy} onClick={close}>Cancelar</Button><Button type="submit" disabled={busy} variant="contained">{busy ? "Transferindo…" : "Confirmar transferência"}</Button></DialogActions>
  </form></Dialog>;
}
