import { Box } from "@mui/material";
import Chart from "../../../components/Chart";
import { opcaoRosca, type Fatia } from "../../../components/Chart/opcoes";
import { Cartao, TituloCartao } from "../../../components/Pagina.styles";
import type { Categoria } from "../../../services/api/types";
import { cores } from "../../../theme/theme";
import { formatarCentavos, formatarPercentual } from "../../../utils/formato";
import { Ponto } from "../styles";

/** Cinco maiores categorias; as demais são somadas em "Outros". */
function agrupar(totais: { categoriaId: string; valor: number }[], categorias: Categoria[]): Fatia[] {
  const fatias = totais.map(({ categoriaId, valor }) => {
    const categoria = categorias.find((c) => c.id === categoriaId);
    return { name: categoria?.nome ?? "Outros", value: valor / 100, cor: categoria?.cor ?? cores.cinza };
  });
  const principais = fatias.filter((f) => f.name !== "Outros").slice(0, 5);
  const resto = fatias.filter((f) => !principais.includes(f)).reduce((soma, f) => soma + f.value, 0);
  return resto > 0 ? [...principais, { name: "Outros", value: resto, cor: cores.cinza }] : principais;
}

export default function CategoryDistribution({ totais, categorias }: {
  totais: { categoriaId: string; valor: number }[]; categorias: Categoria[];
}) {
  const fatias = agrupar(totais, categorias);
  const total = fatias.reduce((soma, f) => soma + f.value, 0);

  return (
    <Cartao>
      <TituloCartao>Distribuição por categoria</TituloCartao>
      <Box sx={{ my: 1.75 }}>
        <Chart
          height={124}
          empty={total === 0}
          label={`Despesas por categoria: ${fatias.map((f) => `${f.name}, ${formatarCentavos(f.value * 100)}`).join("; ")}.`}
          option={opcaoRosca(fatias, ["65%", "100%"])}
        />
      </Box>
      {fatias.map((fatia) => (
        <Box key={fatia.name} sx={{ display: "flex", alignItems: "center", gap: 1, py: "2px", fontSize: 14 }}>
          <Ponto style={{ backgroundColor: fatia.cor }} />
          <Box component="span" sx={{ flex: 1 }}>{fatia.name}</Box>
          <Box component="span" sx={{ color: "text.secondary" }}>{formatarPercentual((fatia.value / total) * 100)}</Box>
        </Box>
      ))}
    </Cartao>
  );
}
