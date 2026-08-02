import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import {
  uploadsDir,
  legacyUploadsDir,
  resolveUploadPath,
  contentTypeFor,
} from '@/lib/uploads'

export const dynamic = 'force-dynamic'

/**
 * Serve as fotos enviadas pelos membros.
 *
 * O Next.js só serve `public/` a partir da lista construída no arranque, por
 * isso um ficheiro enviado com o servidor já a correr devolvia 404 até ao
 * reinício. Aqui lemos do disco a cada pedido.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const requested = (params.path ?? []).join('/')

  const contentType = contentTypeFor(requested)
  if (!contentType) {
    return NextResponse.json({ error: 'Format non supporté' }, { status: 404 })
  }

  // Pasta atual primeiro; a legada existe só para as fotos antigas.
  for (const base of [uploadsDir(), legacyUploadsDir()]) {
    const full = resolveUploadPath(base, requested)
    if (!full) {
      return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 })
    }

    try {
      const info = await stat(full)
      if (!info.isFile()) continue

      const file = await readFile(full)
      return new NextResponse(new Uint8Array(file), {
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(info.size),
          // O nome do ficheiro é aleatório e nunca reutilizado.
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {
      // não existe nesta pasta: tenta a seguinte
    }
  }

  return NextResponse.json({ error: 'Photo introuvable' }, { status: 404 })
}
