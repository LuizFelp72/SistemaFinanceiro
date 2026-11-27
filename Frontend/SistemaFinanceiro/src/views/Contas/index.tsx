import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, IconButton, LinearProgress, Paper, Snackbar, Stack, Typography } from "@mui/material";
import { Extrato, Transferir } from "./Movimentos";
import Add from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutlineOutlined";
import AccountDialog, { type Action } from "./AccountDialog";
import { centavos, dinheiro, listarContas, tipos, type Conta } from "./accounts";

const grid = { display: "grid", gap: 2, gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2,minmax(0,1fr))", lg: "repeat(3,minmax(0,1fr))" } };
function Summary({ contas }: { contas: Conta[] }) {
  const totals = new Map<string, bigint>();
  const highest = new Map<string, Conta>();
  for (const conta of contas) {
    const balance = centavos(conta.saldo_atual);
    totals.set(conta.moeda, (totals.get(conta.moeda) ?? 0n) + balance);
    const previous = highest.get(conta.moeda);
    if (!previous || balance > centavos(previous.saldo_atual)) highest.set(conta.moeda, conta);
  }
  const active = contas.filter(c => c.ativo).length;
  const cards = [
    { title: "Saldo total", lines: Array.from(totals, ([currency, sum]) => dinheiro(sum, currency)) },
    { title: "Contas ativas", lines: [String(active)], hint: `${contas.length - active} ${contas.length - active === 1 ? "inativa" : "inativas"}` },
    { title: "Maior saldo", lines: Array.from(highest.values(), c => dinheiro(centavos(c.saldo_atual), c.moeda) + " · " + c.nome) },
  ];
  return <Box sx={grid}>{cards.map(card => <Paper key={card.title} sx={{ p: 2.5, overflowWrap: "anywhere" }}>
    <Typography variant="body2" color="text.secondary">{card.title}</Typography>
    {card.lines.map(line => <Typography key={line} variant="h6" component="p">{line}</Typography>)}
    {card.hint && <Typography variant="caption">{card.hint}</Typography>}
  </Paper>)}</Box>;
}
export default function Contas() {
  const [contas, setContas] = useState<Conta[] | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [movimento, setMovimento] = useState<{ mode: "extrato" | "transferir"; conta: Conta } | null>(null);
  function destinos(origem: Conta) {
    return (contas ?? []).filter(c => c.ativo && c.id !== origem.id && c.moeda === origem.moeda);
  }
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    listarContas(controller.signal).then(result => { if (!controller.signal.aborted) setContas(result); })
      .catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [version]);
  function reload() { setError(""); setContas(null); setVersion(v => v + 1); }
  function saved(message: string) { setAction(null); setMovimento(null); setNotice(message); reload(); }
  return <Stack spacing={3}>
    <Stack component="header" direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { xs: "start", sm: "center" }, gap: 1.5 }}>
      <Box><Typography component="h1" variant="h5">Contas</Typography><Typography variant="body2" color="text.secondary">Gerencie suas contas financeiras</Typography></Box>
      <Button aria-label="Nova conta" variant="contained" startIcon={<Add />} onClick={() => setAction({ mode: "new" })}>Nova conta</Button>
    </Stack>
    {error ? <Alert severity="error" action={<Button onClick={reload}>Tentar novamente</Button>}>{error}</Alert> :
      contas === null ? <LinearProgress aria-label="Carregando contas" /> : !contas.length ?
      <Paper sx={{ p: 4 }}><Typography component="h2" variant="h6">Nenhuma conta cadastrada</Typography><Typography color="text.secondary">Cadastre sua primeira conta para acompanhar o saldo.</Typography></Paper> :
      <><Summary contas={contas} /><Box sx={grid}>{contas.map(conta => <Paper key={conta.id} component="article" sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <Avatar aria-hidden="true" variant="rounded" sx={{ bgcolor: "primary.dark" }}>{conta.nome.slice(0,1).toUpperCase()}</Avatar>
          <Typography component="h2" variant="subtitle1" sx={{ flex: 1, fontWeight: 600, overflowWrap: "anywhere" }}>{conta.nome}</Typography>
          <IconButton aria-label={`Editar ${conta.nome}`} onClick={() => setAction({ mode: "edit", conta })}><EditOutlined fontSize="small" /></IconButton>
          <IconButton aria-label={`Excluir ${conta.nome}`} onClick={() => setAction({ mode: "delete", conta })}><DeleteOutline fontSize="small" /></IconButton>
        </Stack>
        <Stack direction="row" sx={{ mt: 3, alignItems: "center", justifyContent: "space-between" }}><Typography color="text.secondary" variant="body2">{tipos[conta.tipo]}</Typography>{!conta.ativo && <Chip size="small" label="Inativa" />}</Stack>
        <Typography variant="h5" component="p" sx={{ mt: 0.5, overflowWrap: "anywhere", fontVariantNumeric: "tabular-nums", color: centavos(conta.saldo_atual) < 0n ? "error.dark" : "text.primary" }}>{dinheiro(centavos(conta.saldo_atual), conta.moeda)}</Typography>
        <Stack direction="row" spacing={1} sx={{ borderTop: 1, borderColor: "divider", mt: 2, pt: 2, flexWrap: "wrap", rowGap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setMovimento({ mode: "extrato", conta })}>Extrato</Button>
          <Button size="small" disabled={!conta.ativo || !destinos(conta).length} onClick={() => setMovimento({ mode: "transferir", conta })}>Transferir</Button>
        </Stack>
      </Paper>)}</Box></>}
    {movimento?.mode === "extrato" && <Extrato conta={movimento.conta} close={() => setMovimento(null)} />}
    {movimento?.mode === "transferir" && <Transferir origem={movimento.conta} destinos={destinos(movimento.conta)} close={() => setMovimento(null)} saved={saved} />}
    {action && <AccountDialog action={action} close={() => setAction(null)} saved={saved} />}
    <Snackbar open={!!notice} message={notice} autoHideDuration={3500} onClose={() => setNotice("")} />
  </Stack>;
}
