import { useMemo, useState } from "react";
import { Box, MenuItem, TextField, Typography } from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowCircleDownOutlinedIcon from "@mui/icons-material/ArrowCircleDownOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CottageOutlinedIcon from "@mui/icons-material/CottageOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { saldosDashboardMock } from "../../services/dashboard/dashboard.mock";
import { listarTransacoes } from "../../services/transacoes/transacoes.service";
import { formatarData } from "../../utils/financeiro";
import CategoryDistribution from "./components/CategoryDistribution";
import FinancialEvolution from "./components/FinancialEvolution";
import IncomeExpenses from "./components/IncomeExpenses";
import Indicators from "./components/Indicators";
import RecentTransactions from "./components/RecentTransactions";
import SummaryCard from "./components/SummaryCard";
import { dataISO, dataLocal, limitesDoMes, montarEvolucao, quantidadeDias, resumirTransacoes } from "./dashboard.utils";
import { ChartGrid, DashboardContainer, DetailGrid, SummaryGrid } from "./styles";

export default function Dashboard() {
  const transacoes = useMemo(() => listarTransacoes(), []);
  const meses = [...new Set(transacoes.map((transacao) => transacao.data.slice(0, 7)))].sort().reverse();
  const mesInicial = meses[0] ?? dataISO(new Date()).slice(0, 7);
  const [periodo, setPeriodo] = useState(mesInicial);
  const limites = periodo === "todos"
    ? { inicio: limitesDoMes(meses.at(-1) ?? mesInicial).inicio, fim: limitesDoMes(mesInicial).fim }
    : limitesDoMes(periodo);
  const noPeriodo = transacoes.filter((transacao) => transacao.data >= limites.inicio && transacao.data <= limites.fim);
  const consideradas = transacoes.filter((transacao) => transacao.status === "concluída");
  const movimentos = consideradas.filter((transacao) => transacao.data >= limites.inicio && transacao.data <= limites.fim);
  const resumo = resumirTransacoes(movimentos);
  const anteriores = resumirTransacoes(consideradas.filter((transacao) => transacao.data < limites.inicio));
  const saldoInicial = saldosDashboardMock.saldoInicial + anteriores.saldo;
  const saldoTotal = saldoInicial + resumo.saldo;
  const pontos = montarEvolucao(movimentos, limites.inicio, limites.fim, saldoInicial);
  const descricaoTotais = "Transações concluídas no período";

  return (
    <DashboardContainer>
      <Box component="header" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 0.5 }}>
        <Box>
          <Typography component="h1" variant="h5" sx={{ fontSize: 23, letterSpacing: "-.5px", mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            Visão geral da sua vida financeira · Dados de demonstração
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
          <TextField
            select
            size="small"
            label="Período"
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value)}
            sx={{ minWidth: 175, "& .MuiInputBase-root": { fontSize: 12, bgcolor: "#fff" } }}
          >
            {meses.map((mes) => (
              <MenuItem key={mes} value={mes} sx={{ fontSize: 13, textTransform: "capitalize" }}>
                {dataLocal(`${mes}-01`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </MenuItem>
            ))}
            {meses.length === 0 && <MenuItem value={mesInicial}>Mês atual</MenuItem>}
            <MenuItem value="todos" sx={{ fontSize: 13 }}>Todo o período</MenuItem>
          </TextField>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: 11 }}>
              {formatarData(limites.inicio)} — {formatarData(limites.fim)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <SummaryGrid>
        <SummaryCard
          title="Saldo total"
          value={saldoTotal}
          description="Saldo inicial + movimentações concluídas"
          icon={AccountBalanceWalletOutlinedIcon}
          color="#7057F0"
          background="#F3F0FF"
        />
        <SummaryCard
          title="Receitas"
          value={resumo.receitas}
          description={descricaoTotais}
          icon={ArrowCircleDownOutlinedIcon}
          color="#21A366"
          background="#EDFAF3"
        />
        <SummaryCard
          title="Despesas"
          value={resumo.despesas}
          description={descricaoTotais}
          icon={DeleteOutlineOutlinedIcon}
          color="#E5535E"
          background="#FFF0F1"
        />
        <SummaryCard
          title="Patrimônio líquido"
          value={saldoTotal + saldosDashboardMock.patrimonioForaDasContas}
          description="Saldo total + patrimônio fora das contas"
          icon={CottageOutlinedIcon}
          color="#7057F0"
          background="#F3F0FF"
        />
      </SummaryGrid>

      <ChartGrid>
        <FinancialEvolution pontos={pontos} empty={movimentos.length === 0} />
        <IncomeExpenses receitas={resumo.receitas} despesas={resumo.despesas} />
        <Indicators receitas={resumo.receitas} despesas={resumo.despesas} dias={quantidadeDias(limites.inicio, limites.fim)} maiorDespesa={resumo.maiorDespesa} />
      </ChartGrid>

      <DetailGrid>
        <RecentTransactions transacoes={noPeriodo} />
        <CategoryDistribution categorias={resumo.categorias} />
      </DetailGrid>
    </DashboardContainer>
  );
}
