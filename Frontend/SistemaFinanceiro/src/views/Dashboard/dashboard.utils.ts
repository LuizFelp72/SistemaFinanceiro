import type { Transacao } from "../../services/transacoes/transacoes.types";

export type Agrupamento = "diario" | "semanal" | "mensal";

export interface PontoEvolucao {
  data: string;
  saldo: number;
}

export function resumirTransacoes(transacoes: Transacao[]) {
  let receitas = 0;
  let despesas = 0;
  let maiorDespesa: Transacao | undefined;
  const categorias = new Map<string, number>();

  for (const transacao of transacoes) {
    if (transacao.tipo === "receita") {
      receitas += transacao.valor;
    } else {
      despesas += transacao.valor;
      categorias.set(transacao.categoria, (categorias.get(transacao.categoria) ?? 0) + transacao.valor);
      if (!maiorDespesa || transacao.valor > maiorDespesa.valor) {
        maiorDespesa = transacao;
      }
    }
  }

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
    maiorDespesa,
    categorias: [...categorias].map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
  };
}

export function dataLocal(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

export function dataISO(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

export function limitesDoMes(mes: string) {
  const [ano, numeroMes] = mes.split("-").map(Number);
  return {
    inicio: `${mes}-01`,
    fim: dataISO(new Date(ano, numeroMes, 0)),
  };
}

export function quantidadeDias(inicio: string, fim: string) {
  const dias = (data: string) => {
    const [ano, mes, dia] = data.split("-").map(Number);
    return Date.UTC(ano, mes - 1, dia);
  };
  return Math.max(1, Math.round((dias(fim) - dias(inicio)) / 86400000) + 1);
}

export function montarEvolucao(
  transacoes: Transacao[],
  inicio: string,
  fim: string,
  saldoInicial: number,
): PontoEvolucao[] {
  const movimentos = new Map<string, number>();
  for (const transacao of transacoes) {
    const movimento = transacao.tipo === "receita" ? transacao.valor : -transacao.valor;
    movimentos.set(transacao.data, (movimentos.get(transacao.data) ?? 0) + movimento);
  }

  const pontos: PontoEvolucao[] = [];
  const dia = dataLocal(inicio);
  let saldo = saldoInicial;
  while (dataISO(dia) <= fim) {
    const data = dataISO(dia);
    saldo += movimentos.get(data) ?? 0;
    pontos.push({ data, saldo: Math.round(saldo * 100) / 100 });
    dia.setDate(dia.getDate() + 1);
  }
  return pontos;
}

export function agruparEvolucao(pontos: PontoEvolucao[], agrupamento: Agrupamento) {
  if (agrupamento === "diario") return pontos;
  const grupos = new Map<string | number, PontoEvolucao>();
  pontos.forEach((ponto, index) => {
    const chave = agrupamento === "mensal" ? ponto.data.slice(0, 7) : Math.floor(index / 7);
    grupos.set(chave, ponto);
  });
  return [...grupos.values()];
}
