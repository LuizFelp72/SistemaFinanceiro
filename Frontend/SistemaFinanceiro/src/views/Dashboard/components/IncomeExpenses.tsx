import { Box, Typography } from "@mui/material";
import { formatarMoeda } from "../../../utils/financeiro";
import { CardHeading, DashboardCard, LegendRow } from "../styles";
import Chart from "../../../components/Chart";

export default function IncomeExpenses({ receitas, despesas }: { receitas: number; despesas: number }) {
  const total = receitas + despesas;

  return (
    <DashboardCard>
      <CardHeading>
        <Typography component="h2">Receitas vs Despesas</Typography>
      </CardHeading>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(140px, 1fr) minmax(105px, .85fr)" }, alignItems: "center", gap: 1.5 }}>
        <Box sx={{ position: "relative", minWidth: 0 }}>
          <Chart
            height={218}
            empty={total === 0}
            label={`Receitas de ${formatarMoeda(receitas)} e despesas de ${formatarMoeda(despesas)}.`}
            option={{
              tooltip: { trigger: "item", renderMode: "richText", valueFormatter: (value) => formatarMoeda(Number(value)) },
              series: [{
                name: "Movimentações",
                type: "pie",
                radius: ["67%", "82%"],
                label: { show: false },
                labelLine: { show: false },
                itemStyle: { borderColor: "#fff", borderWidth: 2 },
                data: [
                  { name: "Receitas", value: receitas, itemStyle: { color: "#38B986" } },
                  { name: "Despesas", value: despesas, itemStyle: { color: "#F35C67" } },
                ],
              }],
            }}
          />
          {total > 0 && (
            <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, letterSpacing: "-.3px" }}>
                {formatarMoeda(receitas - despesas)}
              </Typography>
              <Typography sx={{ fontSize: 10, color: "text.secondary", mt: 0.5 }}>
                Saldo no período
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 1 }}>
          {[
            { label: "Receitas", value: receitas, color: "#38B986" },
            { label: "Despesas", value: despesas, color: "#F35C67" },
          ].map((item) => (
            <Box key={item.label}>
              <LegendRow>
                <Box className="legend-dot" sx={{ bgcolor: item.color }} />
                {item.label}
              </LegendRow>
              <Typography sx={{ fontSize: 14, fontWeight: 600, mt: 0.75, ml: 1.9 }}>
                {formatarMoeda(item.value)}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.25, ml: 1.9 }}>
                {total ? (item.value / total * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "0"}% do total
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </DashboardCard>
  );
}
