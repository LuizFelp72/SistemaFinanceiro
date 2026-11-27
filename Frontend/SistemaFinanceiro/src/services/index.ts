/**
 * Ponto único de acesso aos dados. Hoje usa o mock (localStorage) e replica as regras
 * do backend; na integração, só os arquivos de `services/` mudam.
 */
import type {
  Bem, BemDados, Categoria, CategoriaDados, Conta, ContaDados, Meta, MetaDados,
  MetodoPagamento, MetodoPagamentoDados, Transacao, TransacaoDados,
} from "./api/types";
import { contem, criarRecurso } from "./mock/crud";
import { ErroApi, ler } from "./mock/db";
import type { Banco, ContaGravada } from "./mock/seed";
import { centavos, decimal, HOJE } from "../utils/formato";

const porNome = (a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome, "pt-BR");

function exigir(condicao: unknown, mensagem: string, status = 400): asserts condicao {
  if (!condicao) throw new ErroApi(status, mensagem);
}

const movimentada = (banco: Banco, contaId: string) =>
  banco.transactions.some((t) => t.conta_id === contaId || t.conta_destino_id === contaId);

function projetarConta(conta: ContaGravada, banco: Banco): Conta {
  const saldo = banco.transactions
    .filter((t) => t.status === "concluida" && (t.conta_id === conta.id || t.conta_destino_id === conta.id))
    .reduce(
      (total, t) => total + (t.tipo === "receita" || t.conta_destino_id === conta.id ? 1 : -1) * centavos(t.valor),
      centavos(conta.saldo_inicial),
    );
  return {
    ...conta,
    saldo_atual: decimal(saldo),
    limite_disponivel: conta.limite === null ? null : decimal(centavos(conta.limite) + Math.min(saldo, 0)),
  };
}

export const contas = criarRecurso<"accounts", Conta, ContaDados>({
  colecao: "accounts",
  naoEncontrado: "Conta não encontrada.",
  projetar: projetarConta,
  ordenar: () => 0, // mantém a ordem de cadastro, como no desenho
  validar(dados, _banco, anterior) {
    exigir(dados.nome.trim(), "Informe o nome da conta.");
    exigir(dados.tipo === "cartao_credito" || dados.limite === null, "Somente cartões possuem limite.");
    if (anterior && anterior.moeda !== dados.moeda) {
      exigir(!movimentada(_banco, anterior.id), "Não é possível alterar a moeda de uma conta com movimentações.", 409);
    }
  },
  aoRemover(conta, banco) {
    exigir(!movimentada(banco, conta.id), "Conta com movimentações não pode ser excluída. Desative-a.", 409);
  },
});

export const transacoes = criarRecurso<"transactions", Transacao, TransacaoDados>({
  colecao: "transactions",
  naoEncontrado: "Transação não encontrada.",
  ordenar: (a, b) => b.data.localeCompare(a.data), // empate mantém a ordem de lançamento
  filtrar: (t, f) =>
    (!f.tipo || t.tipo === f.tipo)
    && (!f.status || t.status === f.status)
    && (!f.conta_id || t.conta_id === f.conta_id || t.conta_destino_id === f.conta_id)
    && (!f.categoria_id || t.categoria_id === f.categoria_id)
    && (!f.metodo_pagamento_id || t.metodo_pagamento_id === f.metodo_pagamento_id) // etapa 7
    && (!f.data_inicio || t.data >= f.data_inicio)
    && (!f.data_fim || t.data <= f.data_fim)
    && contem(t.descricao, f.busca),
  validar(dados, banco) {
    exigir(dados.descricao.trim(), "Informe a descrição.");
    exigir(centavos(dados.valor) > 0, "O valor deve ser maior que zero.");
    if (dados.tipo === "transferencia") {
      exigir(dados.conta_destino_id && dados.conta_destino_id !== dados.conta_id, "Transferência exige uma conta de destino diferente da origem.");
      exigir(!dados.categoria_id, "Transferências não possuem categoria.");
    } else {
      exigir(!dados.conta_destino_id, "Somente transferências possuem conta de destino.");
    }
    const envolvidas = [dados.conta_id, dados.conta_destino_id].filter(Boolean).map((id) => banco.accounts.find((c) => c.id === id));
    exigir(envolvidas.every(Boolean), "Conta não encontrada.", 404);
    exigir(envolvidas.every((c) => c!.ativo), "Não é possível movimentar uma conta inativa.", 409);
    exigir(new Set(envolvidas.map((c) => c!.moeda)).size === 1, "Transferências exigem contas com a mesma moeda.");
    if (dados.categoria_id) {
      const categoria = banco.categories.find((c) => c.id === dados.categoria_id);
      exigir(categoria, "Categoria não encontrada.", 404);
      exigir(categoria.tipo === dados.tipo, "Categoria incompatível com o tipo da transação.");
    }
  },
});

export const categorias = criarRecurso<"categories", Categoria, CategoriaDados>({
  colecao: "categories",
  naoEncontrado: "Categoria não encontrada.",
  ordenar: () => 0,
  validar(dados, banco, anterior) {
    exigir(dados.nome.trim(), "Informe o nome da categoria.");
    if (anterior && anterior.tipo !== dados.tipo) {
      exigir(!banco.transactions.some((t) => t.categoria_id === anterior.id) && !banco.budgets.some((o) => o.categoria_id === anterior.id),
        "Não é possível alterar o tipo de uma categoria em uso.", 409);
    }
  },
  aoRemover(categoria, banco) {
    exigir(!banco.transactions.some((t) => t.categoria_id === categoria.id), "Categoria com transações não pode ser excluída.", 409);
    exigir(!banco.budgets.some((o) => o.categoria_id === categoria.id), "Categoria com orçamento não pode ser excluída.", 409);
  },
});

export const metodosPagamento = criarRecurso<"paymentMethods", MetodoPagamento, MetodoPagamentoDados>({
  colecao: "paymentMethods",
  naoEncontrado: "Método de pagamento não encontrado.",
  ordenar: porNome,
});

export const bens = criarRecurso<"assets", Bem, BemDados>({
  colecao: "assets",
  naoEncontrado: "Bem não encontrado.",
  ordenar: () => 0,
  validar(dados) {
    exigir(dados.nome.trim(), "Informe o nome do bem.");
    exigir(centavos(dados.valor_aquisicao) >= 0 && centavos(dados.valor_atual) >= 0, "Valores não podem ser negativos.");
  },
  // Cada mudança de valor entra no histórico usado na evolução do patrimônio (etapa 7).
  aoGravar(bem, banco, anterior) {
    if (anterior?.valor_atual === bem.valor_atual) return;
    const data = anterior ? HOJE : bem.data_aquisicao;
    banco.valuations = banco.valuations.filter((a) => !(a.asset_id === bem.id && a.data === data));
    banco.valuations.push({ id: crypto.randomUUID(), asset_id: bem.id, data, valor: bem.valor_atual });
  },
  aoRemover(bem, banco) {
    banco.valuations = banco.valuations.filter((a) => a.asset_id !== bem.id);
  },
});

/** etapa 7: GET /assets/history */
export const historicoBens = async () => ler().valuations;

export const metas = criarRecurso<"goals", Meta, MetaDados>({
  colecao: "goals",
  naoEncontrado: "Meta não encontrada.",
  ordenar: () => 0,
  validar(dados) {
    exigir(dados.nome.trim(), "Informe o nome da meta.");
    exigir(centavos(dados.valor_objetivo) > 0, "O valor da meta deve ser maior que zero.");
    exigir(centavos(dados.valor_atual) >= 0, "O valor acumulado não pode ser negativo.");
    exigir(dados.data_inicio <= dados.data_limite, "A data de início deve ser anterior ou igual ao prazo.");
  },
});
