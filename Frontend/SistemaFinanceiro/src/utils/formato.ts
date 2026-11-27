/** Data de referência dos dados de demonstração (o "hoje" enquanto não há API). */
export const HOJE = "2025-05-31";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Converte o decimal da API ("10.50") ou um número para centavos inteiros. */
export const centavos = (valor: string | number | null | undefined) => Math.round(Number(valor ?? 0) * 100);
export const decimal = (emCentavos: number) => (emCentavos / 100).toFixed(2);

/** Formata um valor em reais (string decimal da API ou número). */
export const formatarMoeda = (valor: string | number) => moeda.format(Number(valor)).replace(/\u00a0/g, " ");
export const formatarCentavos = (valor: number) => formatarMoeda(valor / 100);

export const formatarPercentual = (valor: number, casas = 1) =>
  `${valor.toLocaleString("pt-BR", { maximumFractionDigits: casas })}%`;

export const formatarEixo = (valor: number) =>
  `R$ ${(valor / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
export const nomeMes = (data: string) => MESES[Number(data.slice(5, 7)) - 1];
export const mesAno = (data: string) => `${nomeMes(data)}/${data.slice(0, 4)}`;

/**
 * Interpreta valores digitados ("R$ 1.234,56", "1234.56", "-10") e devolve o decimal
 * no formato da API, ou null se for inválido.
 */
export function lerMoeda(texto: string): string | null {
  let limpo = texto.replace(/R\$|\s/g, "");
  if (limpo.includes(",")) limpo = limpo.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(limpo)) limpo = limpo.replace(/\./g, "");
  if (!/^-?\d{1,13}(\.\d{1,2})?$/.test(limpo)) return null;
  return Number(limpo).toFixed(2);
}

/** Prepara um decimal da API para edição ("1234.50" vira "1234,50"). */
export const moedaParaCampo = (valor: string | null | undefined) => (valor ? valor.replace(".", ",") : "");
