/**
 * Compressão de imagens no navegador, antes do envio.
 *
 * Porquê: fotos de telemóvel têm 3–12 MB. Isso (a) passa do limite de 5 MB da
 * rota /api/photos/upload e (b) pode ser barrado pelo proxy do hosting antes
 * de chegar ao Next (413 / página HTML de erro). Reduzir a foto no cliente
 * resolve as duas coisas e poupa dados móveis.
 *
 * Só corre no browser (usa canvas). Se algo falhar (formato que o browser não
 * descodifica, canvas indisponível…) devolve o ficheiro original — a validação
 * do servidor continua a dar uma mensagem clara.
 */

type Opcoes = {
  /** Maior lado da imagem final, em píxeis. */
  ladoMax?: number;
  /** Tamanho alvo, em bytes. */
  bytesMax?: number;
};

function paraBlob(canvas: HTMLCanvasElement, qualidade: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', qualidade));
}

async function decodificar(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap respeita a orientação EXIF (fotos de telemóvel).
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        /* cai para <img> */
      }
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('decode'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function comprimirImagem(file: File, opcoes: Opcoes = {}): Promise<File> {
  const ladoMax = opcoes.ladoMax ?? 1600;
  const bytesMax = opcoes.bytesMax ?? 800 * 1024;

  if (typeof document === 'undefined') return file;

  // Já é pequena e num formato aceite pelo servidor: não mexer.
  if (file.size <= bytesMax && /^image\/(jpeg|png|webp)$/.test(file.type)) return file;

  try {
    const origem = await decodificar(file);
    const largura = 'naturalWidth' in origem ? origem.naturalWidth : origem.width;
    const altura = 'naturalHeight' in origem ? origem.naturalHeight : origem.height;
    if (!largura || !altura) return file;

    let escala = Math.min(1, ladoMax / Math.max(largura, altura));
    let blob: Blob | null = null;

    // Reduz a qualidade e, se preciso, as dimensões até caber no alvo.
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(largura * escala));
      canvas.height = Math.max(1, Math.round(altura * escala));
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      // Fundo branco: PNG com transparência não pode virar fundo preto em JPEG.
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(origem as CanvasImageSource, 0, 0, canvas.width, canvas.height);

      for (const q of [0.85, 0.72, 0.6]) {
        blob = await paraBlob(canvas, q);
        if (blob && blob.size <= bytesMax) break;
      }
      if (blob && blob.size <= bytesMax) break;
      escala *= 0.8;
    }

    if ('close' in origem && typeof origem.close === 'function') origem.close();
    if (!blob) return file;

    const nome = (file.name || 'foto').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], nome, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}
