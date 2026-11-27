import type { Lista } from "../api/types";
import { alterar, ErroApi, ler } from "./db";
import type { Banco } from "./seed";

export interface Filtros {
  page?: number;
  limit?: number;
  [filtro: string]: string | number | boolean | undefined;
}

export interface Recurso<T, D> {
  listar: (filtros?: Filtros) => Promise<Lista<T>>;
  /** Percorre todas as páginas (a API limita cada uma a 100 registros). */
  listarTodos: (filtros?: Filtros) => Promise<T[]>;
  buscar: (id: string) => Promise<T>;
  criar: (dados: D) => Promise<T>;
  atualizar: (id: string, dados: Partial<D>) => Promise<T>;
  remover: (id: string) => Promise<void>;
}

type Colecao = "accounts" | "transactions" | "categories" | "paymentMethods" | "assets" | "goals" | "budgets";
type Registro<C extends Colecao> = Banco[C][number];

interface Opcoes<C extends Colecao, T, D> {
  colecao: C;
  naoEncontrado: string;
  /** Acrescenta campos calculados (ex.: saldo_atual). */
  projetar?: (registro: Registro<C>, banco: Banco) => T;
  filtrar?: (item: T, filtros: Filtros) => boolean;
  ordenar: (a: T, b: T) => number;
  /** Regras de negócio, executadas antes de gravar. */
  validar?: (dados: D, banco: Banco, anterior?: Registro<C>) => void;
  aoRemover?: (registro: Registro<C>, banco: Banco) => void;
  aoGravar?: (registro: Registro<C>, banco: Banco, anterior?: Registro<C>) => void;
}

export function criarRecurso<C extends Colecao, T extends { id: string }, D>(opcoes: Opcoes<C, T, D>): Recurso<T, D> {
  const projetar = opcoes.projetar ?? ((registro: Registro<C>) => registro as unknown as T);
  const tabela = (banco: Banco) => banco[opcoes.colecao] as Registro<C>[];

  function localizar(banco: Banco, id: string) {
    const indice = tabela(banco).findIndex((item) => item.id === id);
    if (indice < 0) throw new ErroApi(404, opcoes.naoEncontrado);
    return indice;
  }

  function filtrados(filtros: Filtros) {
    const banco = ler();
    return tabela(banco)
      .map((registro) => projetar(registro, banco))
      .filter((item) => !opcoes.filtrar || opcoes.filtrar(item, filtros))
      .sort(opcoes.ordenar);
  }

  return {
    async listar(filtros = {}) {
      const { page = 1, limit = 20 } = filtros;
      const itens = filtrados(filtros);
      return { data: itens.slice((page - 1) * limit, page * limit), total: itens.length, page, limit };
    },
    async listarTodos(filtros = {}) {
      return filtrados(filtros);
    },
    async buscar(id) {
      const banco = ler();
      return projetar(tabela(banco)[localizar(banco, id)], banco);
    },
    async criar(dados) {
      return alterar((banco) => {
        opcoes.validar?.(dados, banco);
        const registro = { ...dados, id: crypto.randomUUID() } as unknown as Registro<C>;
        tabela(banco).push(registro);
        opcoes.aoGravar?.(registro, banco);
        return projetar(registro, banco);
      });
    },
    async atualizar(id, dados) {
      return alterar((banco) => {
        const indice = localizar(banco, id);
        const anterior = tabela(banco)[indice];
        const registro = { ...anterior, ...dados } as Registro<C>;
        opcoes.validar?.(registro as unknown as D, banco, anterior);
        tabela(banco)[indice] = registro;
        opcoes.aoGravar?.(registro, banco, anterior);
        return projetar(registro, banco);
      });
    },
    async remover(id) {
      alterar((banco) => {
        const indice = localizar(banco, id);
        opcoes.aoRemover?.(tabela(banco)[indice], banco);
        tabela(banco).splice(indice, 1);
      });
    },
  };
}

export const contem = (texto: string, busca: unknown) =>
  !busca || texto.toLocaleLowerCase("pt-BR").includes(String(busca).toLocaleLowerCase("pt-BR").trim());
