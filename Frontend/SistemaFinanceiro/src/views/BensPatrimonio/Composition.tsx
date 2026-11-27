import { Box, Typography } from "@mui/material";
import Chart from "../../components/Chart";
import { opcaoRosca } from "../../components/Chart/opcoes";
import { Cartao } from "../../components/Pagina.styles";
import type { Bem } from "../../services/api/types";
import { centavos, formatarCentavos, formatarPercentual } from "../../utils/formato";
import { categoriaDe, CATEGORIAS } from "./constants";

export default function Composition({ bens }: { bens: Bem[] }) {
  const fatias = CATEGORIAS.map((categoria) => ({
    name: categoria.nome,
    cor: categoria.cor,
    value: bens.filter((bem) => categoriaDe(bem) === categoria.nome)
      .reduce((total, bem) => total + centavos(bem.valor_atual), 0) / 100,
  }));
  const total = fatias.reduce((soma, item) => soma + item.value, 0);

  return (
    <Cartao>
      <Typography component="h2" sx={{ fontSize: 15, color: "text.secondary" }}>Composição patrimonial</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
        <Chart
          height={70}
          width={70}
          empty={total === 0}
          label={`Composição patrimonial: ${fatias.map((f) => `${f.name}, ${formatarCentavos(f.value * 100)}`).join("; ")}.`}
          option={opcaoRosca(fatias, ["55%", "100%"])}
        />
        <Box>
          {fatias.map((item) => (
            <Box key={item.name} sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 13, lineHeight: "23.5px" }}>
              <Box sx={{ bgcolor: item.cor, width: 8, height: 8, borderRadius: "50%" }} />
              {item.name}
              <Box component="span" sx={{ color: "text.secondary" }}>{formatarPercentual(total ? (item.value / total) * 100 : 0)}</Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Cartao>
  );
}
