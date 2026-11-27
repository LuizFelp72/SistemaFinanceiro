import { useState, type FormEvent } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../../auth/session";
import FinanceData from "../../components/FinanceData";
import { Metrics, PageHeader } from "../../components/FinancePage";
import { type Ledger } from "../../services/finance";
import { formatarMoeda } from "../../utils/financeiro";
import { dataISO } from "../Dashboard/dashboard.utils";
type Limit = { id:string; month:string; category:string; amount:string };
export default function Orcamentos(){
  const {user}=useAuth();
  return <FinanceData resources="accounts transactions categories">{db=><Budget db={db} storageKey={`nuvra.budget-drafts.${user!.id}`}/>}</FinanceData>;
}
function Budget({db,storageKey}:{db:Ledger;storageKey:string}){
  const [month,setMonth]=useState(dataISO(new Date()).slice(0,7));
  const [limits,setLimits]=useState<Limit[]>(()=>{
    try { const parsed:unknown=JSON.parse(localStorage.getItem(storageKey)||"[]"); return Array.isArray(parsed)?parsed.filter(x=>x && typeof x.id==="string" && typeof x.amount==="string" && Number.isFinite(Number(x.amount)) && Number(x.amount)>0 && typeof x.month==="string" && typeof x.category==="string"):[]; } catch {return [];}
  });
  const [editing,setEditing]=useState<Limit|null>(null);
  const [deleting,setDeleting]=useState<Limit|null>(null);
  const [error,setError]=useState("");
  const categories=db.categories.filter(c=>c.tipo==="despesa");
  const brl=new Set(db.accounts.filter(a=>a.moeda==="BRL").map(a=>a.id));
  const actuals=new Map<string,number>();
  for(const t of db.transactions) if(t.tipo==="despesa" && t.status==="concluida" && brl.has(t.conta_id) && t.data.startsWith(month+"-")) actuals.set(t.categoria_id,(actuals.get(t.categoria_id)??0)+Math.round(Number(t.valor)*100));
  const shown=limits.filter(l=>l.month===month);
  const planned=shown.reduce((s,l)=>s+Math.round(Number(l.amount)*100),0);
  const spent=shown.reduce((s,l)=>s+(actuals.get(l.category)??0),0);
  function persist(next:Limit[]){
    try {localStorage.setItem(storageKey,JSON.stringify(next));setLimits(next);setEditing(null);setDeleting(null);setError("");}
    catch {setError("Não foi possível salvar neste navegador.");}
  }
  function save(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if(!editing)return;
    const form=new FormData(e.currentTarget);
    const category=String(form.get("categoria")),amount=String(form.get("valor")).replace(",",".");
    if(Number(amount)<=0){setError("Informe um limite maior que zero.");return;}
    if(limits.some(l=>l.month===month && l.category===category && l.id!==editing.id)){setError("Já existe um limite para essa categoria neste mês.");return;}
    persist([...limits.filter(l=>l.id!==editing.id),{...editing,category,amount}]);
  }
  return <Stack spacing={3}><PageHeader title="Orçamentos" subtitle="Controle seus gastos por categoria"><Button variant="contained" disabled={!month || !categories.length} onClick={()=>{setError("");setEditing({id:crypto.randomUUID(),month,category:"",amount:""});}}>Novo orçamento</Button></PageHeader>
    <Typography variant="body2" color="text.secondary">Os limites são rascunhos deste navegador. Os gastos vêm das transações concluídas em reais.</Typography>
    <TextField type="month" size="small" label="Mês" value={month} onChange={e=>setMonth(e.target.value)} slotProps={{inputLabel:{shrink:true}}} sx={{alignSelf:"start"}}/>
    <Metrics items={[[ "Total orçado",formatarMoeda(planned/100)],["Gasto nas categorias orçadas",formatarMoeda(spent/100)],["Disponível",formatarMoeda((planned-spent)/100)],["No limite",shown.filter(l=>(actuals.get(l.category)??0)>=Math.round(Number(l.amount)*100)).length]]}/>
    {!shown.length && <Paper sx={{p:3}}><Typography component="h2" variant="h6">Nenhum orçamento neste mês</Typography><Typography color="text.secondary">{categories.length?"Defina um limite para acompanhar uma categoria.":"Cadastre uma categoria de despesa para criar seu primeiro orçamento."}</Typography></Paper>}
    <Box sx={{display:"grid",gap:2,gridTemplateColumns:{xs:"1fr",md:"1fr 1fr"}}}>{shown.map(l=>{
      const used=(actuals.get(l.category)??0)/100, ratio=used/Number(l.amount);
      return <Paper key={l.id} sx={{p:2.5}}><Typography component="h2" variant="h6">{categories.find(c=>c.id===l.category)?.nome??"Categoria removida"}</Typography>
        <Typography>{formatarMoeda(used)} de {formatarMoeda(Number(l.amount))}</Typography>
        <LinearProgress aria-label="Percentual do orçamento utilizado" color={ratio>=1?"error":"primary"} variant="determinate" value={Math.min(100,ratio*100)} sx={{my:1.5}}/>
        <Typography variant="caption">{Math.round(ratio*100)}% utilizado</Typography>
        <Stack direction="row"><Button onClick={()=>{setError("");setEditing(l);}}>Editar</Button><Button color="error" onClick={()=>{setError("");setDeleting(l);}}>Excluir</Button></Stack>
      </Paper>;})}</Box>
    {editing && <Dialog open fullWidth maxWidth="xs" onClose={()=>setEditing(null)} aria-labelledby="budget-title"><form onSubmit={save}><DialogTitle id="budget-title">Limite mensal</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
      {error && <Alert severity="error">{error}</Alert>}<TextField select name="categoria" required label="Categoria" defaultValue={editing.category}>{categories.map(c=><MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}</TextField>
      <TextField required label="Limite em reais" name="valor" defaultValue={editing.amount} slotProps={{htmlInput:{inputMode:"decimal",pattern:"[0-9]{1,13}([.,][0-9]{1,2})?"}}}/></Stack></DialogContent>
      <DialogActions><Button onClick={()=>setEditing(null)}>Cancelar</Button><Button type="submit" variant="contained">Salvar rascunho</Button></DialogActions></form></Dialog>}
    {deleting && <Dialog open onClose={()=>setDeleting(null)} aria-labelledby="budget-delete"><DialogTitle id="budget-delete">Excluir este limite mensal?</DialogTitle>{error && <Alert severity="error">{error}</Alert>}<DialogActions><Button onClick={()=>setDeleting(null)}>Cancelar</Button><Button color="error" onClick={()=>persist(limits.filter(l=>l.id!==deleting.id))}>Excluir</Button></DialogActions></Dialog>}
  </Stack>;
}
