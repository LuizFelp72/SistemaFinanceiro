import { useState } from "react";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { Carregando, CartaoResumo, Pagina, Tendencia } from "../../components/Pagina";
import { GradeResumo } from "../../components/Pagina.styles";
import { Filtro } from "../../components/Controles";
import { SeletorPeriodo } from "../../components/Periodo";
import { useDados } from "../../hooks/useDados";
import { bens, categorias, contas, historicoBens, transacoes } from "../../services";
import { cores } from "../../theme/theme";
import { concluidas, noPeriodo, patrimonioEm, resumir, saldoEm, variacao, type Periodo } from "../../utils/calculos";
import { limitesDoMes, quantidadeDias, somarDias, somarMeses } from "../../utils/datas";
import { formatarCentavos, formatarPercentual, HOJE } from "../../utils/formato";
import CategoryDistribution from "./components/CategoryDistribution";
import FinancialEvolution from "./components/FinancialEvolution";
import IncomeExpenses from "./components/IncomeExpenses";
import Indicators from "./components/Indicators";
import Notifications from "./components/Notifications";
import RecentTransactions from "./components/RecentTransactions";
import { ChartGrid, DetailGrid } from "./styles";

const MES = HOJE.slice(0, 7);
const ATALHOS: Record<string, { rotulo: string; periodo: Periodo }> = {
  mes: { rotulo: "Este mês", periodo: limitesDoMes(MES) },
  anterior: { rotulo: "Mês passado", periodo: limitesDoMes(somarMeses(MES, -1)) },
  trimestre: { rotulo: "Últimos 3 meses", periodo: { inicio: `${somarMeses(MES, -2)}-01`, fim: limitesDoMes(MES).fim } },
  ano: { rotulo: "Este ano", periodo: { inicio: `${MES.slice(0, 4)}-01-01`, fim: HOJE } },
};

/** Período de comparação: o mês anterior para meses fechados, senão o mesmo número de dias antes. */
function periodoAnterior({ inicio, fim }: Periodo): Periodo {
  const mes = limitesDoMes(inicio.slice(0, 7));
  if (inicio === mes.inicio && fim === mes.fim) return limitesDoMes(somarMeses(inicio.slice(0, 7), -1));
  return { inicio: somarDias(inicio, -quantidadeDias(inicio, fim)), fim: somarDias(inicio, -1) };
}

const TITULO = "Dashboard";
const SUBTITULO = "Visão geral da sua vida financeira";

export default function Dashboard() {
  const [periodo, setPeriodo] = useState<Periodo>(ATALHOS.mes.periodo);
  const { dados, erro, recarregar } = useDados(() => Promise.all([
    transacoes.listarTodos(), contas.listarTodos(), categorias.listarTodos(), bens.listarTodos(), historicoBens(),
  ]));

  if (!dados) return <Carregando titulo={TITULO} subtitulo={SUBTITULO} erro={erro} repetir={recarregar} />;
  const [lancamentos, listaContas, listaCategorias, listaBens, avaliacoes] = dados;

  const anterior = periodoAnterior(periodo);
  const resumo = resumir(concluidas(noPeriodo(lancamentos, periodo)));
  const resumoAnterior = resumir(concluidas(noPeriodo(lancamentos, anterior)));
  const vespera = somarDias(periodo.inicio, -1);
  const saldo = saldoEm(listaContas, lancamentos, periodo.fim);
  const patrimonio = (data: string) => patrimonioEm(listaContas, lancamentos, listaBens, avaliacoes, data);
  const patrimonioFinal = patrimonio(periodo.fim);

  const comparacao = (valor: number | null) => valor === null
    ? "Sem base de comparação"
    : <Tendencia valor={valor}>{formatarPercentual(valor)} vs. mês anterior</Tendencia>;

  const atalho = Object.keys(ATALHOS).find((chave) =>
    ATALHOS[chave].periodo.inicio === periodo.inicio && ATALHOS[chave].periodo.fim === periodo.fim) ?? "personalizado";

  const cartoes = [
    { titulo: "Saldo total", valor: saldo, delta: variacao(saldo, saldoEm(listaContas, lancamentos, vespera)), icone: { Icone: SyncRoundedIcon, cor: cores.azul, fundo: cores.primariaSuave } },
    { titulo: "Receitas", valor: resumo.receitas, delta: variacao(resumo.receitas, resumoAnterior.receitas), icone: { Icone: TrendingUpRoundedIcon, cor: cores.verde, fundo: cores.verdeSuave } },
    { titulo: "Despesas", valor: resumo.despesas, delta: variacao(resumo.despesas, resumoAnterior.despesas), icone: { Icone: TrendingDownRoundedIcon, cor: cores.vermelho, fundo: cores.vermelhoSuave } },
    { titulo: "Patrimônio líquido", valor: patrimonioFinal, delta: variacao(patrimonioFinal, patrimonio(vespera)), icone: { Icone: HomeOutlinedIcon, cor: cores.roxo, fundo: cores.roxoSuave } },
  ];

  return (
    <Pagina
      titulo={TITULO}
      subtitulo={SUBTITULO}
      acoes={<>
        <Filtro
          rotulo="Atalho de período"
          valor={atalho}
          onChange={(chave) => { if (ATALHOS[chave]) setPeriodo(ATALHOS[chave].periodo); }}
          opcoes={[
            ...Object.entries(ATALHOS).map(([valor, item]) => ({ valor, rotulo: item.rotulo })),
            ...(atalho === "personalizado" ? [{ valor: "personalizado", rotulo: "Personalizado" }] : []),
          ]}
        />
        <SeletorPeriodo valor={periodo} onChange={setPeriodo} seta />
        <Notifications />
      </>}
    >
      <GradeResumo>
        {cartoes.map((cartao) => (
          <CartaoResumo key={cartao.titulo} titulo={cartao.titulo} valor={formatarCentavos(cartao.valor)} detalhe={comparacao(cartao.delta)} icone={cartao.icone} />
        ))}
      </GradeResumo>

      <ChartGrid>
        <FinancialEvolution periodo={periodo} patrimonio={patrimonio} />
        <IncomeExpenses receitas={resumo.receitas} despesas={resumo.despesas} />
        <Indicators
          atual={{ ...resumo, dias: quantidadeDias(periodo.inicio, periodo.fim) }}
          anterior={{ ...resumoAnterior, dias: quantidadeDias(anterior.inicio, anterior.fim) }}
        />
      </ChartGrid>

      <DetailGrid>
        <RecentTransactions transacoes={noPeriodo(lancamentos, periodo)} contas={listaContas} categorias={listaCategorias} />
        <CategoryDistribution totais={resumo.porCategoria} categorias={listaCategorias} />
      </DetailGrid>
    </Pagina>
  );
}
