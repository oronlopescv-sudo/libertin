import path from 'path'

/**
 * Onde ficam guardadas as fotos enviadas pelos membros.
 *
 * Não pode ser `public/`: o Next.js constrói a lista de ficheiros estáticos
 * quando arranca, por isso um ficheiro escrito depois disso devolve 404 até
 * o servidor reiniciar — e o deploy seguinte apaga a pasta, perdendo tudo.
 * As fotos são servidas por /api/uploads/[...path], que lê do disco a cada
 * pedido.
 *
 * Em produção convém apontar UPLOADS_DIR para uma pasta fora do diretório
 * do site, para as fotos sobreviverem aos deploys. Por exemplo:
 *   UPLOADS_DIR=/home/<utilizador>/libertin-uploads
 */
export function uploadsDir(): string {
  const configured = process.env.UPLOADS_DIR?.trim()
  if (configured) return path.resolve(configured)
  return path.join(process.cwd(), 'uploads')
}

/** Pasta legada, usada antes desta correção. Ainda é lida, nunca escrita. */
export function legacyUploadsDir(): string {
  return path.join(process.cwd(), 'public', 'uploads')
}

/**
 * Resolve um nome de ficheiro pedido pelo cliente para um caminho absoluto,
 * garantindo que não escapa da pasta de uploads (`../`, caminhos absolutos,
 * separadores do Windows).
 */
export function resolveUploadPath(baseDir: string, requested: string): string | null {
  if (!requested || requested.includes('\0')) return null

  const normalized = path
    .normalize(requested)
    .replace(/^([/\\])+/, '')

  if (normalized.startsWith('..') || path.isAbsolute(normalized)) return null

  const full = path.resolve(baseDir, normalized)
  const root = path.resolve(baseDir)

  if (full !== root && !full.startsWith(root + path.sep)) return null

  return full
}

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/** Só devolvemos tipos de imagem que aceitamos no upload. */
export function contentTypeFor(filename: string): string | null {
  return CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? null
}

/**
 * Deteta o formato real a partir dos primeiros bytes do ficheiro.
 *
 * O `file.type` que chega no formulário é escolhido pelo cliente e pode ser
 * forjado — sem esta verificação era possível guardar um ficheiro qualquer
 * desde que se anunciasse como imagem.
 *
 * Devolve a extensão a usar, ou null se não for uma imagem aceite.
 */
export function sniffImageType(buffer: Buffer): 'png' | 'jpg' | 'webp' | null {
  if (buffer.length < 12) return null

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e &&
    buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a &&
    buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return 'png'
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg'
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp'
  }

  return null
}
