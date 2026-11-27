/** "15/03/1990" vira "1990-03-15"; null se a data não existir ou for futura. */
export function lerData(texto: string): string | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!partes) return null;
  const iso = `${partes[3]}-${partes[2]}-${partes[1]}`;
  const data = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== iso) return null;
  return data <= new Date() ? iso : null;
}

/** Reduz a foto para um quadrado pequeno, que cabe no armazenamento e na API. */
export async function reduzirFoto(arquivo: File, lado = 160): Promise<string> {
  const imagem = await createImageBitmap(arquivo).catch(() => {
    throw new Error("Não foi possível ler a imagem.");
  });
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = lado;
  const corte = Math.min(imagem.width, imagem.height);
  canvas.getContext("2d")!.drawImage(
    imagem, (imagem.width - corte) / 2, (imagem.height - corte) / 2, corte, corte, 0, 0, lado, lado,
  );
  imagem.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
