import { criarSeed, type Banco } from "./seed";

const CHAVE = "nuvra.mock.v1";
const ouvintes = new Set<() => void>();
let memoria: Banco | null = null;

/** Erro no mesmo formato das respostas `{ error }` da API. */
export class ErroApi extends Error {
  status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

export function ler(): Banco {
  if (memoria) return memoria;
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) memoria = JSON.parse(salvo) as Banco;
  } catch {
    // Dados corrompidos ou armazenamento indisponível: volta ao exemplo.
  }
  memoria ??= criarSeed();
  return memoria;
}

/** Aplica uma alteração de forma atômica: se `operacao` lançar erro, nada muda. */
export function alterar<T>(operacao: (banco: Banco) => T): T {
  const copia = structuredClone(ler());
  const resultado = operacao(copia);
  try {
    localStorage.setItem(CHAVE, JSON.stringify(copia));
  } catch {
    throw new ErroApi(507, "Não foi possível salvar: armazenamento do navegador cheio ou bloqueado.");
  }
  memoria = copia;
  ouvintes.forEach((avisar) => avisar());
  return resultado;
}

/** Avisa quando os dados mudam, para as telas recarregarem. */
export function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}
