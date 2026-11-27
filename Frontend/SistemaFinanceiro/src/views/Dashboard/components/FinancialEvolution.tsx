import { useState } from "react";
import { Box, Typography } from "@mui/material";
import Chart from "../../../components/Chart";
import { opcaoLinha } from "../../../components/Chart/opcoes";
import { Abas } from "../../../components/Controles";
import { Cartao, TituloCartao } from "../../../components/Pagina.styles";
import { cores } from "../../../theme/theme";
import type { Periodo } from "../../../utils/calculos";
import { limitesDoMes, quantidadeDias, somarDias, somarMeses } from "../../../utils/datas";
import { formatarCentavos, nomeMes } from "../../../utils/formato";

type Agrupamento = "diario" | "semanal" | "mensal";

/** Datas em que o patrimônio é medido em cada visão. */
function marcos({ inicio, fim }: Periodo, agrupamento: Agrupamento) {
  const dias = quantidadeDias(inicio, fim);
  if (agrupamento === "diario") return Array.from({ length: dias }, (_, i) => somarDias(inicio, i));
  if (agrupamento === "semanal") {
    // Pontos de sete em sete dias, contados a partir do fim do período.
    const datas: string[] = [];
    for (let data = fim; data >= inicio; data = somarDias(data, -7)) datas.unshift(data);
    return datas;
  }
  if (dias <= 62) {
    // Cinco marcos igualmente espaçados, como no desenho (01, 08, 15, 22 e 31).
    const passo = Math.floor((dias - 1) / 4);
    return [...new Set([0, 1, 2, 3].map((i) => somarDias(inicio, i * passo)).concat(fim))];
  }
  const datas: string[] = [];
  for (let mes = inicio.slice(0, 7); mes <= fim.slice(0, 7); mes = somarMeses(mes, 1)) {
    const ultimo = limitesDoMes(mes).fim;
    datas.push(ultimo < fim ? ultimo : fim);
  }
  return datas;
}

export default function FinancialEvolution({ periodo, patrimonio }: {
  periodo: Periodo; patrimonio: (data: string) => number;
}) {
  const [agrupamento, setAgrupamento] = useState<Agrupamento>("mensal");
  const datas = marcos(periodo, agrupamento);
  const valores = datas.map((data) => patrimonio(data) / 100);

  return (
    <Cartao>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mt: "-3px", mb: 1.5 }}>
        <TituloCartao>Evolução financeira</TituloCartao>
        <Abas
          rotulo="Agrupamento da evolução financeira"
          valor={agrupamento}
          onChange={setAgrupamento}
          opcoes={[{ valor: "diario", rotulo: "Diário" }, { valor: "semanal", rotulo: "Semanal" }, { valor: "mensal", rotulo: "Mensal" }]}
        />
      </Box>
      <Chart
        height={190}
        label={`Evolução do patrimônio líquido. Valor final: ${formatarCentavos(patrimonio(periodo.fim))}.`}
        option={opcaoLinha(datas.map((data) => `${data.slice(8)} ${nomeMes(data)}`), valores, "Patrimônio líquido", { area: true })}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
        <Box sx={{ width: 13, height: 2, bgcolor: cores.primaria }} />
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Patrimônio líquido</Typography>
      </Box>
    </Cartao>
  );
}
