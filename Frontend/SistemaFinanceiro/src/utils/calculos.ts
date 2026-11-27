import type { AvaliacaoBem, Bem, Conta, Transacao } from "../services/api/types";
import { centavos } from "./formato";

export interface Periodo {
  inicio: string;
  fim: string;
}

export const noPeriodo = <T extends { data: string }>(itens: T[], { inicio, fim }: Periodo) =>
  itens.filter((item) => item.data >= inicio && item.data <= fim);

export const concluidas = (transacoes: Transacao[]) =>
  transacoes.filter((transacao) => transacao.status === "concluida");

/** Totais em centavos. Transferências são neutras. */
export function resumir(transacoes: Transacao[]) {
  let receitas = 0;
  let despesas = 0;
  let maiorDespesa: Transacao | undefined;
  const porCategoria = new Map<string, number>();

  for (const transacao of transacoes) {
    const valor = centavos(transacao.valor);
    if (transacao.tipo === "receita") receitas += valor;
    if (transacao.tipo !== "despesa") continue;
    despesas += valor;
    const chave = transacao.categoria_id ?? "";
    porCategoria.set(chave, (porCategoria.get(chave) ?? 0) + valor);
    if (!maiorDespesa || valor > centavos(maiorDespesa.valor)) maiorDespesa = transacao;
  }

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
    maiorDespesa,
    porCategoria: [...porCategoria]
      .map(([categoriaId, valor]) => ({ categoriaId, valor }))
      .sort((a, b) => b.valor - a.valor),
  };
}

/** Variação percentual; null quando não há base de comparação. */
export const variacao = (atual: number, anterior: number) =>
  anterior === 0 ? null : ((atual - anterior) / Math.abs(anterior)) * 100;

/** Soma dos saldos de todas as contas, em centavos, ao final do dia informado. */
export function saldoEm(contas: Conta[], transacoes: Transacao[], data: string) {
  const inicial = contas.reduce((total, conta) => total + centavos(conta.saldo_inicial), 0);
  return inicial + resumir(concluidas(transacoes).filter((t) => t.data <= data)).saldo;
}

/** Valor dos bens na data, usando a avaliação mais recente até ela. */
export function bensEm(bens: Bem[], avaliacoes: AvaliacaoBem[], data: string) {
  return bens
    .filter((bem) => bem.status === "ativo" && bem.data_aquisicao <= data)
    .reduce((total, bem) => {
      const historico = avaliacoes
        .filter((item) => item.asset_id === bem.id)
        .sort((a, b) => a.data.localeCompare(b.data));
      const avaliacao = historico.filter((item) => item.data <= data).at(-1) ?? historico[0];
      return total + centavos(avaliacao?.valor ?? bem.valor_atual);
    }, 0);
}

export const patrimonioEm = (
  contas: Conta[], transacoes: Transacao[], bens: Bem[], avaliacoes: AvaliacaoBem[], data: string,
) => saldoEm(contas, transacoes, data) + bensEm(bens, avaliacoes, data);

/** Valorização do bem em relação ao valor de aquisição. */
export const valorizacao = (bem: Bem) => variacao(centavos(bem.valor_atual), centavos(bem.valor_aquisicao)) ?? 0;
