import { Formulario, type Campo, type ValoresFormulario } from "./Dialogos";
import { transacoes } from "../services";
import type { Categoria, Conta, MetodoPagamento, Transacao, TransacaoDados } from "../services/api/types";
import { HOJE, moedaParaCampo } from "../utils/formato";

interface Props {
  /** Transação em edição; ausente para um novo lançamento. */
  transacao?: Transacao;
  /** Valores iniciais de um novo lançamento (ex.: transferência a partir de uma conta). */
  padrao?: Partial<TransacaoDados>;
  contas: Conta[];
  categorias: Categoria[];
  metodos: MetodoPagamento[];
  onFechar: () => void;
}

export default function FormularioTransacao({ transacao, padrao, contas, categorias, metodos, onFechar }: Props) {
  const base = transacao ?? padrao ?? {};
  const ativas = contas
    .filter((c) => c.ativo || c.id === base.conta_id)
    .map((c) => ({ valor: c.id, rotulo: c.nome }));
  const transferencia = (v: ValoresFormulario) => v.tipo === "transferencia";
  const comum = (v: ValoresFormulario) => !transferencia(v);

  const campos: Campo[] = [
    {
      nome: "tipo", rotulo: "Tipo", tipo: "selecao", obrigatorio: true, meia: true,
      opcoes: [{ valor: "despesa", rotulo: "Despesa" }, { valor: "receita", rotulo: "Receita" }, { valor: "transferencia", rotulo: "Transferência" }],
    },
    { nome: "data", rotulo: "Data", tipo: "data", obrigatorio: true, meia: true },
    { nome: "descricao", rotulo: "Descrição", obrigatorio: true },
    { nome: "valor", rotulo: "Valor (R$)", tipo: "moeda", obrigatorio: true, meia: true },
    {
      nome: "status", rotulo: "Status", tipo: "selecao", obrigatorio: true, meia: true,
      opcoes: [{ valor: "concluida", rotulo: "Concluída" }, { valor: "pendente", rotulo: "Pendente" }],
    },
    { nome: "conta_id", rotulo: "Conta", tipo: "selecao", obrigatorio: true, meia: true, opcoes: ativas },
    { nome: "conta_destino_id", rotulo: "Conta de destino", tipo: "selecao", obrigatorio: true, meia: true, opcoes: ativas, visivel: transferencia },
    {
      nome: "categoria_id", rotulo: "Categoria", tipo: "selecao", meia: true, visivel: comum,
      opcoes: (v) => categorias.filter((c) => c.tipo === v.tipo).map((c) => ({ valor: c.id, rotulo: c.nome })),
    },
    {
      nome: "metodo_pagamento_id", rotulo: "Método de pagamento", tipo: "selecao",
      opcoes: [{ valor: "", rotulo: "Não informado" }, ...metodos.filter((m) => m.ativo).map((m) => ({ valor: m.id, rotulo: m.nome }))],
    },
    { nome: "observacao", rotulo: "Observação", tipo: "longo" },
  ];

  const salvar = async (v: ValoresFormulario) => {
    const tipo = String(v.tipo) as Transacao["tipo"];
    // Categoria escolhida antes de trocar o tipo não vale mais.
    const categoria = categorias.find((c) => c.id === v.categoria_id && c.tipo === tipo);
    const dados: TransacaoDados = {
      tipo,
      data: String(v.data),
      descricao: String(v.descricao).trim(),
      valor: String(v.valor),
      status: String(v.status) as Transacao["status"],
      conta_id: String(v.conta_id),
      conta_destino_id: tipo === "transferencia" ? String(v.conta_destino_id) : null,
      categoria_id: categoria?.id ?? null,
      metodo_pagamento_id: String(v.metodo_pagamento_id) || null,
      observacao: String(v.observacao).trim() || null,
    };
    await (transacao ? transacoes.atualizar(transacao.id, dados) : transacoes.criar(dados));
  };

  return (
    <Formulario
      titulo={transacao ? "Editar transação" : padrao?.tipo === "transferencia" ? "Transferir" : "Nova transação"}
      campos={campos}
      inicial={{
        tipo: base.tipo ?? "despesa",
        data: base.data ?? HOJE,
        descricao: base.descricao ?? "",
        valor: moedaParaCampo(base.valor),
        status: base.status ?? "concluida",
        conta_id: base.conta_id ?? "",
        conta_destino_id: base.conta_destino_id ?? "",
        categoria_id: base.categoria_id ?? "",
        metodo_pagamento_id: base.metodo_pagamento_id ?? "",
        observacao: base.observacao ?? "",
      }}
      onSalvar={salvar}
      onFechar={onFechar}
    />
  );
}
