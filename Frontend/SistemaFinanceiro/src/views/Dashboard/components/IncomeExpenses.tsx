import { Box, Typography } from "@mui/material";
import Chart from "../../../components/Chart";
import { opcaoRosca } from "../../../components/Chart/opcoes";
import { Cartao, TituloCartao } from "../../../components/Pagina.styles";
import { cores } from "../../../theme/theme";
import { formatarCentavos, formatarPercentual } from "../../../utils/formato";
import { Ponto } from "../styles";

export default function IncomeExpenses({ receitas, despesas }: { receitas: number; despesas: number }) {
  const total = receitas + despesas;
  const itens = [
    { name: "Receitas", value: receitas / 100, cor: cores.verde },
    { name: "Despesas", value: despesas / 100, cor: cores.vermelho },
  ];

  return (
    <Cartao>
      <TituloCartao>Receitas vs Despesas</TituloCartao>
      <Box sx={{ position: "relative", mt: 2, mb: 2, height: 136 }}>
        <Chart
          height={136}
          empty={total === 0}
          label={`Receitas de ${formatarCentavos(receitas)} e despesas de ${formatarCentavos(despesas)}.`}
          option={opcaoRosca(itens, ["70%", "100%"])}
        />
        {total > 0 && (
          <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{formatarCentavos(receitas - despesas)}</Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>Saldo no período</Typography>
          </Box>
        )}
      </Box>
      {itens.map((item) => (
        <Box key={item.name} sx={{ display: "flex", alignItems: "center", gap: 1, py: "2px", fontSize: 14 }}>
          <Ponto style={{ backgroundColor: item.cor }} />
          <Box component="span" sx={{ flex: 1 }}>{item.name}</Box>
          <Box component="span" sx={{ fontWeight: 600 }}>{formatarCentavos(item.value * 100)}</Box>
          <Box component="span" sx={{ color: "text.secondary", minWidth: 44, textAlign: "right" }}>
            {formatarPercentual(total ? (item.value * 10000) / total : 0)}
          </Box>
        </Box>
      ))}
    </Cartao>
  );
}
