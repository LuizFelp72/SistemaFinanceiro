import { Box, Typography } from "@mui/material";
import { CORES_CATEGORIA, formatarMoeda } from "../../../utils/financeiro";
import { CardHeading, DashboardCard, LegendRow } from "../styles";
import Chart from "../../../components/Chart";

export interface CategoryTotal {
  name: string;
  value: number;
}

export default function CategoryDistribution({ categorias }: { categorias: CategoryTotal[] }) {
  const total = categorias.reduce((soma, categoria) => soma + categoria.value, 0);
  const dados = categorias.map((categoria) => ({
    ...categoria,
    itemStyle: { color: (CORES_CATEGORIA[categoria.name] ?? CORES_CATEGORIA.Outros).cor },
  }));

  return (
    <DashboardCard>
      <CardHeading>
        <Typography component="h2">Distribuição por categoria</Typography>
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Despesas do período</Typography>
      </CardHeading>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(140px, .9fr) minmax(0, 1fr)" }, alignItems: "center", gap: 2 }}>
        <Chart
          height={224}
          empty={total === 0}
          label={`Despesas por categoria: ${categorias.map((item) => `${item.name}, ${formatarMoeda(item.value)}`).join("; ")}.`}
          option={{
            tooltip: { trigger: "item", renderMode: "richText", valueFormatter: (value) => formatarMoeda(Number(value)) },
            series: [{
              type: "pie",
              radius: ["56%", "80%"],
              label: { show: false },
              labelLine: { show: false },
              itemStyle: { borderColor: "#fff", borderWidth: 2 },
              data: dados,
            }],
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          {dados.map((categoria) => (
            <LegendRow key={categoria.name}>
              <Box className="legend-dot" sx={{ bgcolor: categoria.itemStyle.color }} />
              <Typography component="span" sx={{ flex: 1, fontSize: 12 }}>
                {categoria.name}
              </Typography>
              <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {(categoria.value / total * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
              </Typography>
            </LegendRow>
          ))}
        </Box>
      </Box>
    </DashboardCard>
  );
}
