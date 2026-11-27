import { cores } from "../theme/theme";

export const TIPOS = {
  receita: { rotulo: "Receita", cor: cores.verde, sinal: "" },
  despesa: { rotulo: "Despesa", cor: cores.vermelho, sinal: "-" },
  transferencia: { rotulo: "Transferência", cor: cores.azul, sinal: "" },
} as const;
