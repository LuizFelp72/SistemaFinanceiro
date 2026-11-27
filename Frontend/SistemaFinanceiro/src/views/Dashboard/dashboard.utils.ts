import { centavos } from "../Contas/accounts";
import type { Transacao } from "../../services/transacoes/transacoes.types";

export type Agrupamento = "diario" | "semanal" | "mensal";

export interface PontoEvolucao {
  data: string;
  saldo: number;
}

export function resumirTransacoes(transacoes: Transacao[]) {
  let receitas = 0n;
  let despesas = 0n;
  let maiorDespesa: Transacao | undefined;
  const categorias = new Map<string, bigint>();

  for (const transacao of transacoes) {
    const valor = centavos((transacao as Transacao & {valorDecimal?:string}).valorDecimal ?? String(transacao.valor));
    if (transacao.tipo === "receita") {
      receitas += valor;
    } else {
      despesas += valor;
      categorias.set(transacao.categoria, (categorias.get(transacao.categoria) ?? 0n) + valor);
      if (!maiorDespesa || transacao.valor > maiorDespesa.valor) {
        maiorDespesa = transacao;
      }
    }
  }

  return {
    receitas: Number(receitas)/100,
    despesas: Number(despesas)/100,
    saldo: Number(receitas - despesas)/100,
    receitasCentavos: receitas, despesasCentavos: despesas, saldoCentavos: receitas-despesas,
    maiorDespesa,
    categorias: [...categorias].map(([name, value]) => ({ name, value: Number(value)/100 }))
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
  saldoInicial: bigint,
): PontoEvolucao[] {
  const movimentos = new Map<string, bigint>();
  for (const transacao of transacoes) {
    const valor = centavos((transacao as Transacao & {valorDecimal?:string}).valorDecimal ?? String(transacao.valor));
    const movimento = transacao.tipo === "receita" ? valor : -valor;
    movimentos.set(transacao.data, (movimentos.get(transacao.data) ?? 0n) + movimento);
  }

  const pontos: PontoEvolucao[] = [];
  const dia = dataLocal(inicio);
  let saldo = saldoInicial;
  while (dataISO(dia) <= fim) {
    const data = dataISO(dia);
    saldo += movimentos.get(data) ?? 0n;
    pontos.push({ data, saldo: Number(saldo) / 100 });
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
