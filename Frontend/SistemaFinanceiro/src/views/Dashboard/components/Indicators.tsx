import { Box, Typography } from "@mui/material";
import { Tendencia } from "../../../components/Pagina";
import { Cartao, TituloCartao } from "../../../components/Pagina.styles";
import { cores } from "../../../theme/theme";
import { variacao, type resumir } from "../../../utils/calculos";
import { formatarCentavos, formatarMoeda, formatarPercentual } from "../../../utils/formato";

type Resumo = ReturnType<typeof resumir> & { dias: number };

const taxaPoupanca = ({ receitas, saldo }: Resumo) => (receitas > 0 ? (saldo / receitas) * 100 : null);

export default function Indicators({ atual, anterior }: { atual: Resumo; anterior: Resumo }) {
  const taxa = taxaPoupanca(atual);
  const taxaAnterior = taxaPoupanca(anterior);
  const pontos = taxa !== null && taxaAnterior !== null ? taxa - taxaAnterior : null;
  const gasto = variacao(atual.despesas / atual.dias, anterior.despesas / anterior.dias);
  const receita = variacao(atual.receitas / atual.dias, anterior.receitas / anterior.dias);
  const tendencia = (valor: number | null, texto: (valor: number) => string) =>
    valor === null ? null : <Tendencia valor={valor}>{texto(valor)}</Tendencia>;

  const indicadores = [
    {
      rotulo: "Taxa de poupança",
      valor: taxa === null ? "—" : formatarPercentual(taxa),
      lado: tendencia(pontos, (v) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} p.p.`),
    },
    { rotulo: "Gastos médios diários", valor: formatarCentavos(atual.despesas / atual.dias), lado: tendencia(gasto, formatarPercentual) },
    {
      rotulo: "Maior despesa",
      valor: atual.maiorDespesa?.descricao ?? "—",
      lado: atual.maiorDespesa
        ? <Box component="span" sx={{ color: cores.texto }}>{formatarMoeda(atual.maiorDespesa.valor)}</Box>
        : null,
    },
    { rotulo: "Receita média diária", valor: formatarCentavos(atual.receitas / atual.dias), lado: tendencia(receita, formatarPercentual) },
  ];

  return (
    <Cartao>
      <TituloCartao>Indicadores</TituloCartao>
      <Box sx={{ mt: 1.5 }}>
        {indicadores.map((item) => (
          <Box key={item.rotulo} sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: "13px", borderBottom: `1px solid ${cores.bordaSuave}`, "&:last-of-type": { borderBottom: 0, pb: 0 } }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.4 }}>{item.rotulo}</Typography>
              <Typography noWrap sx={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{item.valor}</Typography>
            </Box>
            <Typography component="div" sx={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{item.lado}</Typography>
          </Box>
        ))}
      </Box>
    </Cartao>
  );
}
