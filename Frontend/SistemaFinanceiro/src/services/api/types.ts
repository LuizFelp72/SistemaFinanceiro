/**
 * Contratos no formato da API (snake_case, dinheiro como string decimal).
 * Campos marcados com "etapa 7" ainda não existem no backend e são simulados no mock.
 */
export interface Lista<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type TipoConta =
  | "corrente"
  | "poupanca"
  | "carteira"
  | "investimento"
  | "outro"
  | "cartao_credito"; // etapa 7

export interface Conta {
  id: string;
  nome: string;
  tipo: TipoConta;
  saldo_inicial: string;
  moeda: string;
  ativo: boolean;
  saldo_atual: string;
  instituicao: string | null; // etapa 7
  limite: string | null; // etapa 7
  limite_disponivel: string | null; // etapa 7 (calculado)
}
export type ContaDados = Omit<Conta, "id" | "saldo_atual" | "limite_disponivel">;

export type TipoTransacao = "receita" | "despesa" | "transferencia";
export type StatusTransacao = "concluida" | "pendente";

export interface Transacao {
  id: string;
  descricao: string;
  valor: string;
  tipo: TipoTransacao;
  data: string; // AAAA-MM-DD
  status: StatusTransacao;
  conta_id: string;
  conta_destino_id: string | null;
  categoria_id: string | null;
  metodo_pagamento_id: string | null;
  observacao: string | null;
}
export type TransacaoDados = Omit<Transacao, "id">;

export type TipoCategoria = "receita" | "despesa";

export interface Categoria {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  cor: string | null;
  icone: string | null;
  ativo: boolean; // etapa 7
}
export type CategoriaDados = Omit<Categoria, "id">;

export type TipoMetodo = "pix" | "dinheiro" | "credito" | "debito" | "boleto" | "outro";

export interface MetodoPagamento {
  id: string;
  nome: string;
  tipo: TipoMetodo;
  ativo: boolean;
}
export type MetodoPagamentoDados = Omit<MetodoPagamento, "id">;

export type StatusBem = "ativo" | "vendido" | "inativo";

export interface Bem {
  id: string;
  nome: string;
  tipo: string;
  valor_aquisicao: string;
  valor_atual: string;
  data_aquisicao: string;
  descricao: string | null;
  status: StatusBem; // etapa 7
}
export type BemDados = Omit<Bem, "id">;

/** etapa 7: histórico de valor dos bens */
export interface AvaliacaoBem {
  id: string;
  asset_id: string;
  data: string;
  valor: string;
}

export type StatusMeta = "ativa" | "concluida" | "cancelada";

export interface Meta {
  id: string;
  nome: string;
  valor_objetivo: string;
  valor_atual: string;
  data_inicio: string;
  data_limite: string;
  status: StatusMeta;
  categoria: string | null; // etapa 7
  cor: string | null; // etapa 7
  icone: string | null; // etapa 7
}
export type MetaDados = Omit<Meta, "id">;

/** etapa 7 */
export interface Orcamento {
  id: string;
  categoria_id: string;
  mes: string; // AAAA-MM
  valor_limite: string;
  valor_gasto: string; // calculado: despesas concluídas no mês
}
export type OrcamentoDados = Omit<Orcamento, "id" | "valor_gasto">;

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  created_at: string;
  // etapa 7
  telefone: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  renda_mensal: string | null;
  objetivo_principal: string | null;
  perfil_investidor: string | null;
  foto: string | null;
}
export type PerfilDados = Partial<Omit<Usuario, "id" | "created_at">>;

/** etapa 7 */
export interface Preferencias {
  notificar_orcamentos: boolean;
  notificar_metas: boolean;
  tema: "claro" | "sistema";
  moeda: string;
  regiao: string;
  meta_poupanca: number; // percentual
}

/** etapa 7 */
export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
}
