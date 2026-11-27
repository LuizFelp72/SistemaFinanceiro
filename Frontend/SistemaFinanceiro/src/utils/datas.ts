export function dataLocal(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

export function dataISO(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

/** Soma (ou subtrai) meses a um "AAAA-MM". */
export function somarMeses(mes: string, quantidade: number) {
  const [ano, numero] = mes.split("-").map(Number);
  return dataISO(new Date(ano, numero - 1 + quantidade, 1)).slice(0, 7);
}

export function somarDias(data: string, quantidade: number) {
  const dia = dataLocal(data);
  dia.setDate(dia.getDate() + quantidade);
  return dataISO(dia);
}

export function limitesDoMes(mes: string) {
  const [ano, numeroMes] = mes.split("-").map(Number);
  return { inicio: `${mes}-01`, fim: dataISO(new Date(ano, numeroMes, 0)) };
}

export function quantidadeDias(inicio: string, fim: string) {
  const utc = (data: string) => {
    const [ano, mes, dia] = data.split("-").map(Number);
    return Date.UTC(ano, mes - 1, dia);
  };
  return Math.max(1, Math.round((utc(fim) - utc(inicio)) / 86400000) + 1);
}

/** Lista os últimos `quantidade` meses terminando em `mesFinal`. */
export const ultimosMeses = (mesFinal: string, quantidade: number) =>
  Array.from({ length: quantidade }, (_, i) => somarMeses(mesFinal, i - quantidade + 1));
