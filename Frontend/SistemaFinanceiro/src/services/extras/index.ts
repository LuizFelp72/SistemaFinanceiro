/** Recursos que o backend ainda não possui (etapa 7 do plano). */
import type { Notificacao, Orcamento, OrcamentoDados, PerfilDados, Preferencias, Usuario } from "../api/types";
import { criarRecurso } from "../mock/crud";
import { alterar, ErroApi, ler } from "../mock/db";
import type { Banco, OrcamentoGravado } from "../mock/seed";
import { centavos, decimal, formatarPercentual, HOJE, mesAno } from "../../utils/formato";
import { somarDias } from "../../utils/datas";

/** Percentual a partir do qual um orçamento é considerado perto do limite. */
export const ALERTA_ORCAMENTO = 90;

function projetarOrcamento(orcamento: OrcamentoGravado, banco: Banco): Orcamento {
  const gasto = banco.transactions
    .filter((t) => t.tipo === "despesa" && t.status === "concluida"
      && t.categoria_id === orcamento.categoria_id && t.data.startsWith(orcamento.mes))
    .reduce((total, t) => total + centavos(t.valor), 0);
  return { ...orcamento, valor_gasto: decimal(gasto) };
}

export const orcamentos = criarRecurso<"budgets", Orcamento, OrcamentoDados>({
  colecao: "budgets",
  naoEncontrado: "Orçamento não encontrado.",
  projetar: projetarOrcamento,
  ordenar: () => 0,
  filtrar: (o, f) => !f.mes || o.mes === f.mes,
  validar(dados, banco, anterior) {
    const categoria = banco.categories.find((c) => c.id === dados.categoria_id);
    if (!categoria || categoria.tipo !== "despesa") throw new ErroApi(400, "Escolha uma categoria de despesa.");
    if (centavos(dados.valor_limite) <= 0) throw new ErroApi(400, "O limite deve ser maior que zero.");
    if (banco.budgets.some((o) => o.id !== anterior?.id && o.categoria_id === dados.categoria_id && o.mes === dados.mes)) {
      throw new ErroApi(409, "Já existe um orçamento desta categoria neste mês.");
    }
  },
});

export const perfil = {
  async buscar(): Promise<Usuario> {
    return ler().usuario;
  },
  async atualizar(dados: PerfilDados): Promise<Usuario> {
    return alterar((banco) => {
      const usuario = { ...banco.usuario, ...dados };
      if (!usuario.nome.trim()) throw new ErroApi(400, "Informe o nome.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email)) throw new ErroApi(400, "E-mail inválido.");
      banco.usuario = usuario;
      return usuario;
    });
  },
  async alterarSenha(atual: string, nova: string): Promise<void> {
    alterar((banco) => {
      if (banco.senha !== atual) throw new ErroApi(401, "Senha atual incorreta.");
      if (nova.length < 6) throw new ErroApi(400, "A nova senha deve ter ao menos 6 caracteres.");
      banco.senha = nova;
    });
  },
};

export const preferencias = {
  async buscar(): Promise<Preferencias> {
    return ler().preferencias;
  },
  async atualizar(dados: Partial<Preferencias>): Promise<Preferencias> {
    return alterar((banco) => Object.assign(banco.preferencias, dados));
  },
};

export async function listarNotificacoes(): Promise<Notificacao[]> {
  const banco = ler();
  const avisos: Notificacao[] = [];
  if (banco.preferencias.notificar_orcamentos) {
    for (const gravado of banco.budgets.filter((o) => o.mes === HOJE.slice(0, 7))) {
      const orcamento = projetarOrcamento(gravado, banco);
      const uso = (centavos(orcamento.valor_gasto) / centavos(orcamento.valor_limite)) * 100;
      if (uso < ALERTA_ORCAMENTO) continue;
      const nome = banco.categories.find((c) => c.id === orcamento.categoria_id)?.nome ?? "Categoria";
      avisos.push({ id: orcamento.id, titulo: "Orçamento perto do limite", mensagem: `${nome} atingiu ${formatarPercentual(uso, 0)}.` });
    }
  }
  if (banco.preferencias.notificar_metas) {
    const limite = somarDias(HOJE, 100);
    for (const meta of banco.goals.filter((m) => m.status === "ativa" && m.data_limite <= limite)) {
      avisos.push({ id: meta.id, titulo: "Meta perto do prazo", mensagem: `${meta.nome} vence em ${mesAno(meta.data_limite)}.` });
    }
  }
  return avisos;
}
