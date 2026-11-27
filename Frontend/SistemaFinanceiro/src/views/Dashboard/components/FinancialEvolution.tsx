import { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { formatarMoeda } from "../../../utils/financeiro";
import { agruparEvolucao, dataLocal, type Agrupamento, type PontoEvolucao } from "../dashboard.utils";
import { CardHeading, DashboardCard, LegendRow } from "../styles";
import Chart from "../../../components/Chart";

export default function FinancialEvolution({ pontos, empty }: { pontos: PontoEvolucao[]; empty: boolean }) {
  const [agrupamento, setAgrupamento] = useState<Agrupamento>("diario");
  const dados = agruparEvolucao(pontos, agrupamento);

  return (
    <DashboardCard>
      <CardHeading>
        <Typography component="h2">Evolução financeira</Typography>
        <ToggleButtonGroup
          value={agrupamento}
          exclusive
          size="small"
          onChange={(_, value: Agrupamento | null) => { if (value) setAgrupamento(value); }}
          aria-label="Agrupamento da evolução financeira"
          sx={{
            "& .MuiToggleButton-root": { fontSize: 10, textTransform: "none", px: 1.25, py: 0.65, borderColor: "#EAECF0", color: "text.secondary" },
            "& .Mui-selected, & .Mui-selected:hover": { color: "#6C5CE7", bgcolor: "#F4F1FF" },
          }}
        >
          <ToggleButton value="diario">Diário</ToggleButton>
          <ToggleButton value="semanal">Semanal</ToggleButton>
          <ToggleButton value="mensal">Mensal</ToggleButton>
        </ToggleButtonGroup>
      </CardHeading>
      <Chart
        height={206}
        empty={empty}
        label={`Evolução do saldo acumulado, agrupamento ${agrupamento}. Saldo final: ${formatarMoeda(pontos.at(-1)?.saldo ?? 0)}.`}
        option={{
          tooltip: {
            trigger: "axis",
            renderMode: "richText",
            valueFormatter: (value) => formatarMoeda(Number(value)),
          },
          grid: { left: 10, right: 12, top: 14, bottom: 12, containLabel: true },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: dados.map((ponto) => dataLocal(ponto.data).toLocaleDateString("pt-BR", agrupamento === "mensal" ? { month: "short", year: "2-digit" } : { day: "2-digit", month: "short" })),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: "#98A2B3", fontSize: 10, hideOverlap: true, margin: 14 },
          },
          yAxis: {
            type: "value",
            axisLabel: { color: "#98A2B3", fontSize: 10, formatter: (value: number) => Math.abs(value) >= 1000 ? `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : `R$ ${value}` },
            splitLine: { lineStyle: { color: "#F2F4F7", type: "dashed" } },
          },
          series: [{
            name: "Saldo acumulado",
            type: "line",
            smooth: 0.25,
            showSymbol: dados.length === 1,
            symbolSize: 7,
            itemStyle: { color: "#7057F0" },
            lineStyle: { color: "#7057F0", width: 2.5 },
            areaStyle: {
              color: {
                type: "linear", x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: "rgba(112, 87, 240, .24)" }, { offset: 1, color: "rgba(112, 87, 240, .015)" }],
              },
            },
            data: dados.map((ponto) => ponto.saldo),
          }],
        }}
      />
      <LegendRow sx={{ justifyContent: "center", mt: 1.5, fontSize: 11 }}>
        <Box sx={{ width: 12, height: 3, borderRadius: 1, bgcolor: "#7057F0" }} />
        Saldo acumulado
      </LegendRow>
    </DashboardCard>
  );
}
