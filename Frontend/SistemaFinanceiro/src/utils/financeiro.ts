export const CORES_CATEGORIA: Record<string, { bg: string; cor: string }> = {
  Salário: { bg: "#E6F7EF", cor: "#21A366" },
  Alimentação: { bg: "#FDEBEC", cor: "#E5535E" },
  Trabalho: { bg: "#E8F1FE", cor: "#2F80ED" },
  Compras: { bg: "#F0E9FD", cor: "#8B5CF6" },
  Saúde: { bg: "#FDE8F3", cor: "#EC4899" },
  Transporte: { bg: "#FEF3E2", cor: "#F2994A" },
  Entretenimento: { bg: "#FDE8F3", cor: "#D6409F" },
  Moradia: { bg: "#E8F1FE", cor: "#2F80ED" },
  Outros: { bg: "#F1F2F4", cor: "#667085" },
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const formatarMoeda = (valor: number) => moeda.format(valor);

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export const capitalizar = (texto: string) =>
  texto.charAt(0).toUpperCase() + texto.slice(1);
