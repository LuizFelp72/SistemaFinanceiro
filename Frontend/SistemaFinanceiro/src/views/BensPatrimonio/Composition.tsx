import { Box, Typography } from "@mui/material";
import Chart from "../../components/Chart";
import type { Bem } from "../../services/bens/bens.types";
import { formatarMoeda } from "../../utils/financeiro";
import { Card } from "./styles";
import { CATEGORIAS } from "./constants";

export default function Composition({ bens }: { bens: Bem[] }) {
  const dados = CATEGORIAS.map((categoria) => ({
    name: categoria.nome,
    value: bens.filter((bem) => bem.categoria === categoria.nome).reduce((total, bem) => total + bem.valorAtual, 0),
    itemStyle: { color: categoria.cor },
  }));
  const total = dados.reduce((soma, item) => soma + item.value, 0);

  return (
    <Card>
      <Typography component="h2" sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>Composição patrimonial</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "minmax(90px, .9fr) minmax(105px, 1fr)", alignItems: "center", gap: 1.5 }}>
        <Chart
          height={126}
          empty={total === 0}
          label={`Composição patrimonial: ${dados.map((item) => `${item.name}, ${formatarMoeda(item.value)}`).join("; ")}.`}
          option={{
            tooltip: { trigger: "item", renderMode: "richText", valueFormatter: (value) => formatarMoeda(Number(value)) },
            series: [{ type: "pie", radius: ["60%", "88%"], label: { show: false }, labelLine: { show: false }, itemStyle: { borderColor: "#fff", borderWidth: 2 }, data: dados.filter((item) => item.value > 0) }],
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {dados.map((item) => (
            <Box key={item.name} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ bgcolor: item.itemStyle.color, width: 6, height: 6, borderRadius: "50%", flexShrink: 0 }} />
              <Typography sx={{ fontSize: 10, flex: 1 }}>{item.name}</Typography>
              <Typography sx={{ fontSize: 10, color: "text.secondary" }}>{(total > 0 ? item.value / total * 100 : 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
