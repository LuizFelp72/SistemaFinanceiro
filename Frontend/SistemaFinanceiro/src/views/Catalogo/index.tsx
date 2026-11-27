import { useState } from "react";
import { Box, Button, Chip, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import FinanceData from "../../components/FinanceData";
import FinanceEditor, { type EditAction } from "../../components/FinanceEditor";
import { Metrics, PageHeader } from "../../components/FinancePage";
import { label, type Ledger, type Row } from "../../services/finance";
import { formatarData, formatarMoeda } from "../../utils/financeiro";
type Catalog = "categories" | "goals" | "payment-methods";
const pages = {
  categories:["Categorias","Organize suas receitas e despesas","Nova categoria"],
  goals:["Metas","Acompanhe seus objetivos financeiros","Nova meta"],
  "payment-methods":["Métodos de pagamento","Gerencie as formas de pagamento dos lançamentos","Novo método"],
};
export default function Catalogo({resource}:{resource:Catalog}) {
  return <FinanceData key={resource} resources={resource === "categories" ? "categories transactions" : resource}>{(db,reload)=><CatalogPage resource={resource} db={db} reload={reload}/>}</FinanceData>;
}
function CatalogPage({resource,db,reload}:{resource:Catalog;db:Ledger;reload():void}) {
  const [query,setQuery]=useState("");
  const [action,setAction]=useState<EditAction|null>(null);
  const [title,subtitle,cta]=pages[resource];
  const rows=db[resource];
  const counts=new Map<string,number>();
  for(const t of db.transactions) counts.set(t.categoria_id,(counts.get(t.categoria_id)??0)+1);
  const filtered=rows.filter(r=>(r.nome+" "+label(r.tipo||r.status)).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const goal=resource==="goals";
  const metrics:[string,string|number][] = goal ? [
    ["Total de metas",rows.length],["Em andamento",rows.filter(r=>r.status==="ativa").length],
    ["Valor das metas",formatarMoeda(rows.reduce((n,r)=>n+Number(r.valor_objetivo),0))],["Acumulado",formatarMoeda(rows.reduce((n,r)=>n+Number(r.valor_atual),0))],
  ] : resource==="categories" ? [["Categorias",rows.length],["De despesa",rows.filter(r=>r.tipo==="despesa").length],["De receita",rows.filter(r=>r.tipo==="receita").length]] :
    [["Métodos",rows.length],["Ativos",rows.filter(r=>r.ativo==="true").length]];
  const actions=(row:Row)=><Box sx={{display:"flex",gap:1}}><Button size="small" aria-label={`Editar ${row.nome}`} onClick={()=>setAction({mode:"edit",row})}>Editar</Button><Button size="small" color="error" aria-label={`Excluir ${row.nome}`} onClick={()=>setAction({mode:"delete",row})}>Excluir</Button></Box>;
  return <Stack spacing={3}>
    <PageHeader title={title} subtitle={subtitle}><Button variant="contained" onClick={()=>setAction({mode:"create"})}>{cta}</Button></PageHeader>
    <Metrics items={metrics}/>
    <Paper sx={{p:2.5}}><TextField size="small" label={`Buscar em ${title.toLowerCase()}`} value={query} onChange={e=>setQuery(e.target.value)} sx={{mb:2}}/>
      {!filtered.length ? <Typography sx={{py:3}} color="text.secondary">{rows.length ? "Nenhum resultado para a busca." : "Nenhum registro cadastrado."}</Typography> : goal ?
        <Box sx={{display:"grid",gridTemplateColumns:{xs:"1fr",lg:"1fr 1fr"},gap:2}}>{filtered.map(r=>{
          const progress=Number(r.valor_atual)/Number(r.valor_objetivo)*100;
          return <Box key={r.id} sx={{border:1,borderColor:"divider",borderRadius:2,p:2}}><Typography component="h2" variant="h6">{r.nome}</Typography><Chip size="small" label={label(r.status)}/>
            <Typography sx={{mt:2}}>{formatarMoeda(Number(r.valor_atual))} de {formatarMoeda(Number(r.valor_objetivo))}</Typography>
            <LinearProgress aria-label={r.nome} variant="determinate" value={Math.min(progress,100)} sx={{my:1,borderRadius:1,height:6}}/>
            <Typography variant="caption">{Math.round(progress)}% · Prazo {formatarData(r.data_limite)}</Typography>{actions(r)}</Box>;
        })}</Box> : <TableContainer><Table aria-label={title}><TableHead><TableRow>{["Nome","Tipo",resource==="categories"?"Lançamentos":"Situação","Ações"].map(h=><TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{filtered.map(r=><TableRow key={r.id}><TableCell>{r.nome}</TableCell><TableCell>{label(r.tipo)}</TableCell><TableCell>{resource==="categories" ? counts.get(r.id)??0 : r.ativo==="true"?"Ativo":"Inativo"}</TableCell><TableCell>{actions(r)}</TableCell></TableRow>)}</TableBody></Table></TableContainer>}
    </Paper>
    {action && <FinanceEditor resource={resource} db={db} action={action} close={()=>setAction(null)} saved={() => { setAction(null); reload(); }}/>}
  </Stack>;
}
