import type {
  AvaliacaoBem, Bem, Categoria, Conta, Meta, MetodoPagamento, Orcamento, Preferencias, Transacao, Usuario,
} from "../api/types";
import { centavos, decimal } from "../../utils/formato";

export type ContaGravada = Omit<Conta, "saldo_atual" | "limite_disponivel">;
export type OrcamentoGravado = Omit<Orcamento, "valor_gasto">;

export interface Banco {
  usuario: Usuario;
  senha: string;
  preferencias: Preferencias;
  accounts: ContaGravada[];
  transactions: Transacao[];
  categories: Categoria[];
  paymentMethods: MetodoPagamento[];
  assets: Bem[];
  valuations: AvaliacaoBem[];
  goals: Meta[];
  budgets: OrcamentoGravado[];
}

export function criarSeed(): Banco {
  const categoria = (id: string, nome: string, tipo: Categoria["tipo"], cor: string, icone: string): Categoria =>
    ({ id, nome, tipo, cor, icone, ativo: true });

  const categories = [
    categoria("cat-alimentacao", "Alimentação", "despesa", "#22C55E", "🍔"),
    categoria("cat-moradia", "Moradia", "despesa", "#1E40AF", "🏠"),
    categoria("cat-transporte", "Transporte", "despesa", "#F59E0B", "🚗"),
    categoria("cat-saude", "Saúde", "despesa", "#EC4899", "💊"),
    categoria("cat-lazer", "Lazer", "despesa", "#8B5CF6", "🎮"),
    categoria("cat-entretenimento", "Entretenimento", "despesa", "#6366F1", "📺"),
    categoria("cat-compras", "Compras", "despesa", "#F97316", "🛍️"),
    categoria("cat-salario", "Salário", "receita", "#F59E0B", "💼"),
    categoria("cat-freelancer", "Freelancer", "receita", "#3B82F6", "💻"),
    categoria("cat-investimentos", "Investimentos", "receita", "#10B981", "📈"),
    categoria("cat-outros", "Outros", "despesa", "#94A3B8", "📦"),
  ];

  const transactions: Transacao[] = [];
  const lancar = (
    data: string, descricao: string, valor: number, tipo: Transacao["tipo"], categoriaId: string,
    contaId = "acc-principal", status: Transacao["status"] = "concluida",
  ) => {
    transactions.push({
      id: `tx-${transactions.length + 1}`, data, descricao, valor: decimal(valor), tipo, status,
      conta_id: contaId, conta_destino_id: null, categoria_id: categoriaId,
      metodo_pagamento_id: contaId === "acc-cartao" ? "pm-credito" : "pm-pix", observacao: null,
    });
  };

  // Maio/2025: os oito lançamentos mais recentes são os desenhados no wireframe.
  lancar("2025-05-31", "Salário", 785000, "receita", "cat-salario");
  lancar("2025-05-30", "Supermercado", 32675, "despesa", "cat-alimentacao");
  lancar("2025-05-29", "Freelancer Projeto X", 125000, "receita", "cat-freelancer");
  lancar("2025-05-28", "Amazon", 18990, "despesa", "cat-compras", "acc-cartao");
  lancar("2025-05-27", "Academia", 12980, "despesa", "cat-saude");
  lancar("2025-05-26", "Uber", 2540, "despesa", "cat-transporte", "acc-cartao", "pendente");
  lancar("2025-05-25", "Venda Notebook", 210000, "receita", "cat-investimentos");
  lancar("2025-05-24", "Netflix", 5590, "despesa", "cat-entretenimento");
  lancar("2025-05-12", "Freelancer Projeto Y", 125000, "receita", "cat-freelancer");
  lancar("2025-05-06", "Freelancer Consultoria", 125000, "receita", "cat-freelancer");
  lancar("2025-05-05", "Aluguel", 245000, "despesa", "cat-moradia");

  // Divide um total em lançamentos menores, sem perder centavos.
  const distribuir = (quantidade: number, total: number, descricoes: string[], categoriaId: string, contaId?: string) => {
    const parte = Math.floor(total / quantidade);
    for (let i = 0; i < quantidade; i++) {
      const valor = i === quantidade - 1 ? total - parte * (quantidade - 1) : parte;
      const dia = String(23 - (i % 22)).padStart(2, "0");
      lancar(`2025-05-${dia}`, descricoes[i % descricoes.length], valor, "despesa", categoriaId, contaId);
    }
  };
  distribuir(23, 65325, ["Padaria", "Restaurante", "Feira", "Lanche", "Mercado"], "cat-alimentacao");
  distribuir(18, 62000, ["Uber", "Combustível", "Metrô", "Estacionamento"], "cat-transporte");
  distribuir(9, 41500, ["Cinema", "Bar", "Show", "Jogos"], "cat-lazer");
  distribuir(7, 8500, ["Papelaria", "Tarifa bancária", "Presente"], "cat-outros");

  // Transferências entre contas (neutras nos totais de receitas e despesas).
  const transferir = (data: string, descricao: string, valor: number, origem: string, destino: string) => {
    transactions.push({
      id: `tx-${transactions.length + 1}`, data, descricao, valor: decimal(valor), tipo: "transferencia",
      status: "concluida", conta_id: origem, conta_destino_id: destino, categoria_id: null,
      metodo_pagamento_id: "pm-pix", observacao: null,
    });
  };
  transferir("2025-05-10", "Resgate da poupança", 150000, "acc-poupanca", "acc-principal");
  transferir("2025-05-09", "Resgate de investimento", 200000, "acc-invest", "acc-principal");

  // Histórico mensal usado nas comparações e nos gráficos.
  const historico: [string, number, number][] = [
    ["2024-01", 960000, 790000], ["2024-02", 940000, 770000], ["2024-03", 1080000, 860000],
    ["2024-04", 1000000, 800000], ["2024-05", 1095700, 845700],
    ["2025-01", 1020000, 960000], ["2025-02", 980000, 930000],
    ["2025-03", 1200000, 1040000], ["2025-04", 1130000, 972440],
  ];
  for (const [mes, receitas, despesas] of historico) {
    lancar(`${mes}-28`, "Salário", 785000, "receita", "cat-salario");
    lancar(`${mes}-15`, "Projeto freelance", receitas - 785000, "receita", "cat-freelancer");
    const resto = despesas - 245000;
    lancar(`${mes}-05`, "Aluguel", 245000, "despesa", "cat-moradia");
    lancar(`${mes}-08`, "Supermercado", Math.round(resto * 0.35), "despesa", "cat-alimentacao");
    lancar(`${mes}-12`, "Combustível", Math.round(resto * 0.2), "despesa", "cat-transporte");
    lancar(`${mes}-18`, "Compras do mês", Math.round(resto * 0.25), "despesa", "cat-compras");
    lancar(`${mes}-22`, "Lazer", resto - Math.round(resto * 0.35) - Math.round(resto * 0.2) - Math.round(resto * 0.25), "despesa", "cat-lazer");
  }

  // O saldo inicial é ajustado para que o saldo atual bata com o wireframe.
  const conta = (
    id: string, nome: string, instituicao: string, tipo: Conta["tipo"], saldoAtual: number,
    ativo = true, limite: string | null = null,
  ): ContaGravada => {
    const movimentos = transactions
      .filter((t) => (t.conta_id === id || t.conta_destino_id === id) && t.status === "concluida")
      .reduce((total, t) => total + (t.tipo === "receita" || t.conta_destino_id === id ? 1 : -1) * centavos(t.valor), 0);
    return { id, nome, instituicao, tipo, saldo_inicial: decimal(saldoAtual - movimentos), moeda: "BRL", ativo, limite };
  };

  const bem = (id: string, nome: string, tipo: string, atual: number, percentual: number, data: string): Bem => ({
    id, nome, tipo, valor_atual: decimal(atual),
    valor_aquisicao: decimal(Math.round(atual / (1 + percentual / 100))),
    data_aquisicao: data, descricao: null, status: "ativo",
  });
  const assets = [
    bem("as-1", "Apartamento Centro", "Imóveis", 45000000, 12.4, "2020-03-10"),
    bem("as-2", "Casa de Praia", "Imóveis", 28000000, 8.7, "2019-01-15"),
    bem("as-3", "BMW 320i", "Veículos", 12000000, -3.2, "2021-06-20"),
    bem("as-4", "Honda Civic", "Veículos", 8500000, -1.4, "2022-11-05"),
    bem("as-5", "CDB Banco X", "Investimentos", 320000, 6.1, "2023-06-12"),
    bem("as-6", "Ações (Carteira)", "Investimentos", 222612, 3.7, "2024-02-01"),
    bem("as-7", "Coleção de Relógios", "Outros", 4500000, 0, "2018-07-03"),
  ];

  // Fatores em relação ao valor atual, de dezembro/2024 a maio/2025.
  const fatores = (tipo: string) =>
    tipo === "Investimentos" ? [0.96, 0.975, 0.99, 1.01, 1.0384, 1] : [0.88, 0.9, 0.915, 0.93, 0.96, 1];
  const datas = ["2024-12-31", "2025-01-31", "2025-02-28", "2025-03-31", "2025-04-30", "2025-05-31"];
  const valuations = assets.flatMap((item) => datas.map((data, i) => ({
    id: `${item.id}-${data}`, asset_id: item.id, data,
    valor: decimal(Math.round(centavos(item.valor_atual) * fatores(item.tipo)[i])),
  })));

  const meta = (
    id: string, nome: string, categoriaMeta: string, atual: number, objetivo: number,
    limite: string, cor: string, icone: string, status: Meta["status"] = "ativa",
  ): Meta => ({
    id, nome, categoria: categoriaMeta, valor_atual: decimal(atual), valor_objetivo: decimal(objetivo),
    data_inicio: "2025-01-01", data_limite: limite, status, cor, icone,
  });

  const orcamento = (categoriaId: string, valor: number): OrcamentoGravado =>
    ({ id: `bg-${categoriaId}`, categoria_id: categoriaId, mes: "2025-05", valor_limite: decimal(valor) });

  return {
    usuario: {
      id: "user-1", nome: "Thiago Vieira", email: "thiago@email.com", created_at: "2024-01-01T12:00:00Z",
      telefone: "(11) 99999-8888", cpf: "***.***.***-**", data_nascimento: "1990-03-15",
      renda_mensal: "9100.00", objetivo_principal: "Reserva de emergência", perfil_investidor: "Moderado", foto: null,
    },
    senha: "123456",
    preferencias: {
      notificar_orcamentos: true, notificar_metas: true, tema: "claro", moeda: "BRL", regiao: "pt-BR", meta_poupanca: 30,
    },
    accounts: [
      conta("acc-principal", "Conta Principal", "Nubank", "corrente", 1245030),
      conta("acc-poupanca", "Poupança", "Itaú", "poupanca", 820000),
      conta("acc-cartao", "Cartão de Crédito", "XP Investimentos", "cartao_credito", -134075, true, "10000.00"),
      conta("acc-invest", "Investimentos", "BTG Pactual", "investimento", 2458000),
      conta("acc-secundaria", "Conta Secundária", "Bradesco", "corrente", 34018, false),
    ],
    transactions,
    categories,
    paymentMethods: [
      { id: "pm-pix", nome: "Pix", tipo: "pix", ativo: true },
      { id: "pm-credito", nome: "Cartão de crédito", tipo: "credito", ativo: true },
      { id: "pm-debito", nome: "Cartão de débito", tipo: "debito", ativo: true },
      { id: "pm-dinheiro", nome: "Dinheiro", tipo: "dinheiro", ativo: true },
      { id: "pm-boleto", nome: "Boleto", tipo: "boleto", ativo: true },
    ],
    assets,
    valuations,
    goals: [
      meta("gl-1", "Reserva de Emergência", "Segurança", 1845000, 3000000, "2025-12-31", "#3B82F6", "🛡️"),
      meta("gl-2", "Viagem para Europa", "Lazer", 620000, 1500000, "2026-06-30", "#8B5CF6", "✈️"),
      meta("gl-3", "Entrada Apartamento", "Imóveis", 4400000, 8000000, "2027-01-31", "#22C55E", "🏠"),
      meta("gl-4", "Carro novo", "Veículos", 1200000, 5000000, "2026-03-31", "#F59E0B", "🚗"),
      meta("gl-5", "Investimento inicial", "Investimentos", 1000000, 1000000, "2025-04-30", "#22C55E", "📈", "concluida"),
      meta("gl-6", "Curso de especialização", "Educação", 350000, 800000, "2025-08-31", "#EC4899", "📚"),
    ],
    budgets: [
      orcamento("cat-alimentacao", 150000), orcamento("cat-moradia", 250000),
      orcamento("cat-transporte", 80000), orcamento("cat-saude", 60000),
      orcamento("cat-lazer", 50000), orcamento("cat-entretenimento", 20000),
      orcamento("cat-compras", 40000), orcamento("cat-outros", 30000),
    ],
  };
}
