import { useState, type FormEvent } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { api } from "../services/api";
import { type Ledger, type Row } from "../services/finance";
import { fields, singular, type Editable } from "./financeFields";
import { useToast } from "./toast";
export type EditAction = { mode: "create" | "edit" | "delete"; row?: Row };
export default function FinanceEditor({ resource, db, action, close, saved }: { resource: Editable; db: Ledger; action: EditAction; close(): void; saved(): void }) {
  const notify = useToast();
  const [values,setValues] = useState<Row>(() => ({ ...Object.fromEntries(fields(resource,db,{}).map(f => [f.key,f.initial ?? ""])), ...action.row }));
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const removing = action.mode === "delete";
  const inputs = fields(resource,db,values);
  function change(key: string, value: string) {
    setValues(v => ({ ...v, [key]:value, ...(resource === "transactions" && (key === "tipo" || key === "conta_id") ? { conta_destino_id:"", ...(key === "tipo" ? { categoria_id:"" } : {}) } : {}) }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const payload: Record<string, string | null | boolean> = {};
    for (const f of inputs) {
      const value = (values[f.key] ?? "").trim();
      payload[f.key] = f.key === "ativo" ? value === "true" : f.key === "moeda" ? value.toUpperCase() : f.kind === "money" ? value.replace(",",".") : value || null;
    }
    if (resource === "transactions") payload[values.tipo === "transferencia" ? "categoria_id" : "conta_destino_id"] = null;
    setBusy(true); setError("");
    try {
      await api("/" + resource + (action.row ? "/" + action.row.id : ""), {
        method: removing ? "DELETE" : action.row ? "PATCH" : "POST", body: removing ? undefined : JSON.stringify(payload),
      });
      const labelName = singular[resource];
      notify(removing ? `${labelName.charAt(0).toUpperCase() + labelName.slice(1)} excluído(a) com sucesso.` : action.row ? `${labelName.charAt(0).toUpperCase() + labelName.slice(1)} atualizado(a) com sucesso.` : `${labelName.charAt(0).toUpperCase() + labelName.slice(1)} cadastrado(a) com sucesso.`);
      saved();
    } catch (err) { setError(err instanceof Error ? err.message : "Falha ao salvar."); setBusy(false); }
  }
  return <Dialog open fullWidth maxWidth="xs" onClose={busy ? undefined : close} aria-labelledby="resource-title"><form onSubmit={submit}>
    <DialogTitle id="resource-title">{removing ? "Excluir" : action.row ? "Editar" : "Cadastrar"} {singular[resource]}</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt:1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {removing ? <p>Excluir <strong>{action.row?.nome || action.row?.descricao}</strong>?</p> : inputs.map((f,i) =>
        <TextField key={f.key} autoFocus={!i} label={f.title} name={f.key} required={!f.optional} select={f.kind === "select"}
          type={f.kind === "date" ? "date" : "text"} value={values[f.key] ?? ""} onChange={e => change(f.key,e.target.value)}
          helperText={f.kind === "select" && !f.optional && !f.options?.length ? "Cadastre uma opção compatível para continuar." : undefined}
          slotProps={{ inputLabel:{ shrink:true },htmlInput: f.kind === "money" ? { inputMode:"decimal",pattern:"[0-9]{1,13}([.,][0-9]{1,2})?" } : f.key === "data_limite" ? { min:values.data_inicio } : {} }}>
          {f.kind === "select" ? [<MenuItem key="" value="">{f.optional ? "Nenhum" : "Selecione"}</MenuItem>,...(f.options ?? []).map(([key,title]) => <MenuItem key={key} value={key}>{title}</MenuItem>)] : undefined}
        </TextField>)}
    </Stack></DialogContent>
    <DialogActions><Button disabled={busy} onClick={close}>Cancelar</Button><Button type="submit" disabled={busy} color={removing ? "error" : "primary"} variant="contained">{busy ? "Aguarde…" : removing ? "Excluir" : "Salvar"}</Button></DialogActions>
  </form></Dialog>;
}
