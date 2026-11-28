import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { api } from "../../services/api";
import { centavos, dinheiro } from "../Contas/accounts";
import FinanceData from "../../components/FinanceData";
import { Metrics, PageHeader } from "../../components/FinancePage";
import { useToast } from "../../components/toast";
import { type Ledger } from "../../services/finance";

import { dataISO } from "../Dashboard/dashboard.utils";
type Limit = { id:string; month:string; category:string; amount:string; currency:string; spent:string };
export default function Orcamentos(){
  return <FinanceData resources="budgets accounts categories">{(db,reload)=><Budget db={db} reload={reload}/>}</FinanceData>;
}
function Budget({db,reload}:{db:Ledger;reload():void}){
  const notify=useToast();
  const [month,setMonth]=useState(dataISO(new Date()).slice(0,7));
  const [currency,setCurrency]=useState("BRL");
  const [busy,setBusy]=useState(false);
  const limits:Limit[]=db.budgets.map(b=>({id:b.id,month:b.mes,category:b.categoria_id,amount:b.valor_limite,currency:b.moeda,spent:b.valor_gasto}));
  const [editing,setEditing]=useState<Limit|null>(null);
  const [deleting,setDeleting]=useState<Limit|null>(null);
  const [error,setError]=useState("");
  const categories=db.categories.filter(c=>c.tipo==="despesa");
  const shown=limits.filter(l=>l.month===month && l.currency===currency);
  const planned=shown.reduce((s,l)=>s+centavos(l.amount),0n);
  const spent=shown.reduce((s,l)=>s+centavos(l.spent),0n);
  async function persist(method:string, limit:Limit){
    if(busy)return;
    setBusy(true);setError("");
    try {
      await api("/budgets"+(method==="POST"?"":"/"+limit.id),{method,body:method==="DELETE"?undefined:JSON.stringify({mes:limit.month,categoria_id:limit.category,moeda:limit.currency,valor_limite:limit.amount})});
      notify(method==="DELETE"?"Orçamento excluído com sucesso.":method==="PATCH"?"Orçamento atualizado com sucesso.":"Orçamento criado com sucesso.");
      setEditing(null);setDeleting(null);reload();
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível salvar.");}
    finally{setBusy(false);}
  }
  function save(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(!editing)return;
    const form=new FormData(e.currentTarget);
    persist(limits.some(l=>l.id===editing.id)?"PATCH":"POST",{...editing,category:String(form.get("categoria")),amount:String(form.get("valor")).replace(",",".")});
  }
  return <Stack spacing={3}><PageHeader title="Orçamentos" subtitle="Controle seus gastos por categoria"><Button variant="contained" disabled={!month || !categories.length} onClick={()=>{setError("");setEditing({id:crypto.randomUUID(),month,category:"",amount:"",currency,spent:"0"});}}>Novo orçamento</Button></PageHeader>
    {!categories.length && <Alert severity="info" action={<Button component={Link} to="/categorias" color="inherit" size="small">Criar categoria</Button>}>Para cadastrar um orçamento, crie primeiro pelo menos uma categoria do tipo Despesa.</Alert>}
    <Typography variant="body2" color="text.secondary">Os gastos consideram despesas concluídas na moeda selecionada.</Typography>
    <Stack direction="row" spacing={2}>
      <TextField type="month" size="small" label="Mês" value={month} onChange={e=>setMonth(e.target.value)} slotProps={{inputLabel:{shrink:true}}} />
      <TextField label="Moeda" select size="small" value={currency} onChange={e=>setCurrency(e.target.value)}>{Array.from(new Set(["BRL","USD","EUR",...db.accounts.map(a=>a.moeda),...limits.map(l=>l.currency)])).map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField>
    </Stack>
    <Metrics items={[[ "Total orçado",dinheiro(planned,currency)],["Gasto nas categorias orçadas",dinheiro(spent,currency)],["Disponível",dinheiro(planned-spent,currency)],["No limite",shown.filter(l=>centavos(l.spent)>=centavos(l.amount)).length]]}/>
    {!shown.length && <Paper sx={{p:3}}><Typography component="h2" variant="h6">Nenhum orçamento neste mês</Typography><Typography color="text.secondary" sx={{mb:categories.length?0:2}}>{categories.length?"Defina um limite para acompanhar uma categoria.":"Cadastre uma categoria de despesa para criar seu primeiro orçamento."}</Typography>{!categories.length && <Button component={Link} to="/categorias" variant="outlined">Ir para Categorias</Button>}</Paper>}
    <Box sx={{display:"grid",gap:2,gridTemplateColumns:{xs:"1fr",md:"1fr 1fr"}}}>{shown.map(l=>{
      const used=centavos(l.spent), ratio=Number(used*10000n/centavos(l.amount))/10000;
      return <Paper key={l.id} sx={{p:2.5}}><Typography component="h2" variant="h6">{categories.find(c=>c.id===l.category)?.nome??"Categoria removida"}</Typography>
        <Typography>{dinheiro(used,currency)} de {dinheiro(centavos(l.amount),currency)}</Typography>
        <LinearProgress aria-label="Percentual do orçamento utilizado" color={ratio>=1?"error":"primary"} variant="determinate" value={Math.min(100,ratio*100)} sx={{my:1.5}}/>
        <Typography variant="caption">{Math.round(ratio*100)}% utilizado</Typography>
        <Stack direction="row"><Button onClick={()=>{setError("");setEditing(l);}}>Editar</Button><Button color="error" onClick={()=>{setError("");setDeleting(l);}}>Excluir</Button></Stack>
      </Paper>;})}</Box>
    {editing && <Dialog open fullWidth maxWidth="xs" onClose={busy?undefined:()=>setEditing(null)} aria-labelledby="budget-title"><form onSubmit={save}><DialogTitle id="budget-title">Limite mensal</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
      {error && <Alert severity="error">{error}</Alert>}<TextField select name="categoria" required label="Categoria" defaultValue={editing.category}>{categories.map(c=><MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}</TextField>
      <TextField required label={`Limite em ${currency}`} name="valor" defaultValue={editing.amount} slotProps={{htmlInput:{inputMode:"decimal",pattern:"[0-9]{1,13}([.,][0-9]{1,2})?"}}}/></Stack></DialogContent>
      <DialogActions><Button onClick={()=>setEditing(null)}>Cancelar</Button><Button type="submit" disabled={busy} variant="contained">Salvar orçamento</Button></DialogActions></form></Dialog>}
    {deleting && <Dialog open onClose={()=>setDeleting(null)} aria-labelledby="budget-delete"><DialogTitle id="budget-delete">Excluir este limite mensal?</DialogTitle>{error && <Alert severity="error">{error}</Alert>}<DialogActions><Button onClick={()=>setDeleting(null)}>Cancelar</Button><Button color="error" disabled={busy} onClick={()=>persist("DELETE",deleting)}>Excluir</Button></DialogActions></Dialog>}
  </Stack>;
}
