import { useState } from "react";
import { Box, Button, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import FinanceData from "../../components/FinanceData";
import { Metrics, PageHeader } from "../../components/FinancePage";
import Chart from "../../components/Chart";
import { presentTransactions, type Ledger } from "../../services/finance";
import { formatarMoeda } from "../../utils/financeiro";

export default function Relatorios() { return <FinanceData resources="accounts categories transactions">{db=><Report db={db}/>}</FinanceData>; }
function Report({db}:{db:Ledger}) {
  const transactions=presentTransactions(db).filter(t=>t.status==="concluída" && t.tipo!=="transferencia");
  const years=Array.from(new Set([String(new Date().getFullYear()),...transactions.map(t=>t.data.slice(0,4))])).sort().reverse();
  const currencies=Array.from(new Set(["BRL",...db.accounts.map(a=>a.moeda)]));
  const [year,setYear]=useState(years[0]);
  const [currency,setCurrency]=useState("BRL");
  const filtered=transactions.filter(t=>t.moeda===currency && t.data.startsWith(year+"-"));
  const months=Array.from({length:12},(_,i)=>({name:new Date(2000,i,1).toLocaleDateString("pt-BR",{month:"short"}),income:0,expense:0}));
  for(const t of filtered){const m=months[Number(t.data.slice(5,7))-1];m[t.tipo==="receita"?"income":"expense"]+=Math.round(t.valor*100);}
  const income=months.reduce((s,m)=>s+m.income,0), expense=months.reduce((s,m)=>s+m.expense,0);
  const money=(c:number)=>formatarMoeda(c/100,currency);
  function csv(){
    const lines=[["Mês","Receitas","Despesas","Saldo","Moeda"],...months.map(m=>[m.name,...[m.income,m.expense,m.income-m.expense].map(n=>(n/100).toFixed(2).replace(".",",")),currency])];
    const url=URL.createObjectURL(new Blob(["\uFEFF"+lines.map(l=>l.join(";")).join("\r\n")],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download=`relatorio-${year}-${currency}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <Stack spacing={3} className="financial-report"><PageHeader title="Relatórios" subtitle="Resultado anual por moeda e mês">
    <Stack direction="row" spacing={1} className="no-print"><Button variant="outlined" onClick={()=>window.print()}>Imprimir / PDF</Button><Button variant="contained" onClick={csv}>Exportar CSV</Button></Stack></PageHeader>
    <Stack direction="row" spacing={2}><TextField select label="Ano" size="small" value={year} onChange={e=>setYear(e.target.value)}>{years.map(y=><MenuItem key={y} value={y}>{y}</MenuItem>)}</TextField>
    <TextField select size="small" label="Moeda" value={currency} onChange={e=>setCurrency(e.target.value)}>{currencies.map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Stack>
    <Metrics items={[["Receitas",money(income)],["Despesas",money(expense)],["Saldo líquido",money(income-expense)],["Taxa de poupança",income ? ((income-expense)*100/income).toLocaleString("pt-BR",{maximumFractionDigits:1})+"%" : "—"]]}/>
    <Paper sx={{p:2.5}}><Typography component="h2" variant="h6">Evolução mensal</Typography><Chart empty={!filtered.length} label={`Receitas e despesas em ${currency} de ${year}`} option={{
      tooltip:{trigger:"axis",renderMode:"richText"},grid:{left:54,right:12,top:18,bottom:28},xAxis:{type:"category",data:months.map(m=>m.name)},yAxis:{type:"value"},
      series:[{name:"Receitas",type:"line",data:months.map(m=>m.income/100),itemStyle:{color:"#168257"}},{name:"Despesas",type:"line",data:months.map(m=>m.expense/100),itemStyle:{color:"#bd384c"}}]
    }}/></Paper>
    <Box component={Paper} sx={{p:2}}><TableContainer><Table size="small" aria-label="Resumo mensal"><TableHead><TableRow>{["Mês","Receitas","Despesas","Saldo"].map(t=><TableCell key={t}>{t}</TableCell>)}</TableRow></TableHead><TableBody>{months.map(m=><TableRow key={m.name}><TableCell>{m.name}</TableCell>{[m.income,m.expense,m.income-m.expense].map((n,i)=><TableCell key={i}>{money(n)}</TableCell>)}</TableRow>)}</TableBody></Table></TableContainer></Box>
  </Stack>;
}
