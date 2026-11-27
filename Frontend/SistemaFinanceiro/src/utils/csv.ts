/** Escapa um campo de texto, neutralizando fórmulas ao abrir em planilhas. */
function celula(valor: string) {
  const seguro = /^[=+\-@\t\r]/.test(valor) && !/^-?\d+(,\d+)?$/.test(valor) ? `'${valor}` : valor;
  return `"${seguro.replace(/"/g, '""')}"`;
}

/** Baixa um CSV separado por ";" (padrão das planilhas em pt-BR). */
export function baixarCsv(nome: string, linhas: string[][]) {
  const conteudo = linhas.map((linha) => linha.map(celula).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${conteudo}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}
