/** "Thiago Vieira" vira "Thiago V.". */
export function nomeCurto(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes.at(-1)![0]}.` : partes[0];
}
