import { Box, Divider, Typography } from "@mui/material";
import type { Transacao } from "../../../services/transacoes/transacoes.types";
import { formatarMoeda } from "../../../utils/financeiro";
import { CardHeading, DashboardCard } from "../styles";

interface IndicatorsProps {
  receitas: number;
  despesas: number;
  dias: number;
  maiorDespesa?: Transacao;
}

export default function Indicators({ receitas, despesas, dias, maiorDespesa }: IndicatorsProps) {
  const taxaPoupanca = receitas > 0 ? (receitas - despesas) / receitas * 100 : null;
  const indicadores = [
    {
      label: "Taxa de poupança",
      value: taxaPoupanca === null ? "—" : `${taxaPoupanca.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`,
      detail: "das receitas do período",
      color: taxaPoupanca !== null && taxaPoupanca >= 0 ? "#21A366" : "text.primary",
    },
    { label: "Gastos médios diários", value: formatarMoeda(despesas / dias), detail: `${dias} dias no período` },
    { label: "Maior despesa", value: maiorDespesa ? formatarMoeda(maiorDespesa.valor) : "—", detail: maiorDespesa?.descricao ?? "Nenhuma despesa no período" },
    { label: "Receita média diária", value: formatarMoeda(receitas / dias), detail: "no período selecionado" },
  ];

  return (
    <DashboardCard>
      <CardHeading>
        <Typography component="h2">Indicadores</Typography>
      </CardHeading>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "1fr" }, columnGap: 3 }}>
        {indicadores.map((indicador, index) => (
          <Box key={indicador.label} sx={{ minWidth: 0 }}>
            {index > 0 && <Divider sx={{ borderColor: "#F2F4F7", display: { xs: "block", sm: index > 1 ? "block" : "none", xl: "block" } }} />}
            <Box sx={{ py: 1.2 }}>
              <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.6 }}>
                {indicador.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: indicador.color ?? "text.primary" }}>
                  {indicador.value}
                </Typography>
                <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
                  {indicador.detail}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </DashboardCard>
  );
}
