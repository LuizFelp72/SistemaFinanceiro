/** Configurações de ECharts compartilhadas entre as telas. */
import type { EChartsOption } from "echarts";
import { cores } from "../../theme/theme";
import { formatarEixo, formatarMoeda } from "../../utils/formato";

const dica = {
  renderMode: "richText" as const,
  valueFormatter: (valor: unknown) => formatarMoeda(Number(valor)),
};

const rotulo = { color: cores.textoFraco, fontSize: 11 };
const grade = { lineStyle: { color: cores.bordaSuave, type: "dashed" as const } };

function eixos(categorias: string[], margemAbaixo: number, semFolga = false) {
  return {
    tooltip: { trigger: "axis" as const, ...dica },
    grid: { left: 4, right: 12, top: 12, bottom: margemAbaixo, containLabel: true },
    xAxis: {
      type: "category" as const,
      data: categorias,
      boundaryGap: !semFolga,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { ...rotulo, hideOverlap: true, margin: 12 },
      splitLine: { show: !semFolga, ...grade },
    },
    yAxis: { type: "value" as const, axisLabel: { ...rotulo, formatter: formatarEixo }, splitLine: grade },
  };
}

export function opcaoLinha(
  categorias: string[], valores: number[], nome: string, { area = false, pontos = false } = {},
): EChartsOption {
  return {
    ...eixos(categorias, 0, area),
    series: [{
      name: nome,
      type: "line",
      smooth: 0.3,
      symbol: "circle",
      symbolSize: 9,
      showSymbol: pontos || valores.length === 1,
      itemStyle: { color: cores.primaria },
      lineStyle: { color: cores.primaria, width: 2.5 },
      areaStyle: area ? {
        color: {
          type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: "rgba(79, 110, 247, .16)" }, { offset: 1, color: "rgba(79, 110, 247, 0)" }],
        },
      } : undefined,
      data: valores,
    }],
  };
}

export interface SerieBarras {
  nome: string;
  cor: string;
  valores: number[];
}

export function opcaoBarras(categorias: string[], series: SerieBarras[], legenda = false): EChartsOption {
  return {
    ...eixos(categorias, legenda ? 40 : 0),
    legend: legenda ? { bottom: 0, itemWidth: 16, itemHeight: 12, textStyle: { fontSize: 13, color: cores.textoSecundario } } : undefined,
    series: series.map((serie) => ({
      name: serie.nome,
      type: "bar" as const,
      barMaxWidth: series.length > 1 ? 80 : 155,
      barCategoryGap: "50%",
      itemStyle: { color: serie.cor, borderRadius: [4, 4, 0, 0] },
      data: serie.valores,
    })),
  };
}

export interface Fatia {
  name: string;
  value: number;
  cor: string;
}

export function opcaoRosca(fatias: Fatia[], raio: [string, string] = ["72%", "100%"]): EChartsOption {
  return {
    tooltip: { trigger: "item", confine: true, ...dica },
    series: [{
      type: "pie",
      radius: raio,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: { borderColor: cores.branco, borderWidth: 1.5 },
      data: fatias.filter((f) => f.value > 0).map(({ name, value, cor }) => ({ name, value, itemStyle: { color: cor } })),
    }],
  };
}
