import { centavos, dinheiro } from "../Contas/accounts";
import { baixarCsv } from "../../utils/csv";
import { useState } from "react";
import { Box, Button, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import FinanceData from "../../components/FinanceData";
import { Metrics, PageHeader } from "../../components/FinancePage";
import Chart from "../../components/Chart";
import { presentTransactions, type Ledger } from "../../services/finance";


export default function Relatorios() { return <FinanceData resources="accounts categories transactions">{db=><Report db={db}/>}</FinanceData>; }
function Report({db}:{db:Ledger}) {
  const transactions=presentTransactions(db).filter(t=>t.status==="concluída" && t.tipo!=="transferencia");
  const years=Array.from(new Set([String(new Date().getFullYear()),...transactions.map(t=>t.data.slice(0,4))])).sort().reverse();
  const currencies=Array.from(new Set(["BRL",...db.accounts.map(a=>a.moeda)]));
  const [year,setYear]=useState(years[0]);
  const [currency,setCurrency]=useState("BRL");
  const filtered=transactions.filter(t=>t.moeda===currency && t.data.startsWith(year+"-"));
  const months=Array.from({length:12},(_,i)=>({name:new Date(2000,i,1).toLocaleDateString("pt-BR",{month:"short"}),income:0n,expense:0n}));
  for(const t of filtered){const m=months[Number(t.data.slice(5,7))-1];m[t.tipo==="receita"?"income":"expense"]+=centavos(db.transactions.find(row=>row.id===t.id)!.valor);}
  const income=months.reduce((s,m)=>s+m.income,0n), expense=months.reduce((s,m)=>s+m.expense,0n);
  const money=(c:bigint)=>dinheiro(c,currency);
  function csv(){
    const lines=[["Mês","Receitas","Despesas","Saldo","Moeda"],...months.map(m=>[m.name,...[m.income,m.expense,m.income-m.expense].map(n=>((n<0n?"-":"")+(n<0n?-n:n)/100n+","+String((n<0n?-n:n)%100n).padStart(2,"0"))),currency])];
    baixarCsv(`relatorio-${year}-${currency}.csv`,lines);
  }
  return <Stack spacing={3} className="financial-report"><PageHeader title="Relatórios" subtitle="Resultado anual por moeda e mês">
    <Stack direction="row" spacing={1} className="no-print"><Button variant="outlined" onClick={()=>window.print()}>Imprimir / PDF</Button><Button variant="contained" onClick={csv}>Exportar CSV</Button></Stack></PageHeader>
    <Stack direction="row" spacing={2}><TextField select label="Ano" size="small" value={year} onChange={e=>setYear(e.target.value)}>{years.map(y=><MenuItem key={y} value={y}>{y}</MenuItem>)}</TextField>
    <TextField select size="small" label="Moeda" value={currency} onChange={e=>setCurrency(e.target.value)}>{currencies.map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Stack>
    <Metrics items={[["Receitas",money(income)],["Despesas",money(expense)],["Saldo líquido",money(income-expense)],["Taxa de poupança",income ? (Number((income-expense)*10000n/income)/100).toLocaleString("pt-BR",{maximumFractionDigits:1})+"%" : "—"]]}/>
    <Paper sx={{p:2.5}}><Typography component="h2" variant="h6">Evolução mensal</Typography><Chart empty={!filtered.length} label={`Receitas e despesas em ${currency} de ${year}`} option={{
      tooltip:{trigger:"axis",renderMode:"richText"},grid:{left:54,right:12,top:18,bottom:28},xAxis:{type:"category",data:months.map(m=>m.name)},yAxis:{type:"value"},
      series:[{name:"Receitas",type:"line",data:months.map(m=>Number(m.income)/100),itemStyle:{color:"#168257"}},{name:"Despesas",type:"line",data:months.map(m=>Number(m.expense)/100),itemStyle:{color:"#bd384c"}}]
    }}/></Paper>
    <Box component={Paper} sx={{p:2}}><TableContainer><Table size="small" aria-label="Resumo mensal"><TableHead><TableRow>{["Mês","Receitas","Despesas","Saldo"].map(t=><TableCell key={t}>{t}</TableCell>)}</TableRow></TableHead><TableBody>{months.map(m=><TableRow key={m.name}><TableCell>{m.name}</TableCell>{[m.income,m.expense,m.income-m.expense].map((n,i)=><TableCell key={i}>{money(n)}</TableCell>)}</TableRow>)}</TableBody></Table></TableContainer></Box>
  </Stack>;
}
