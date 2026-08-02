import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import {
  uploadsDir,
  legacyUploadsDir,
  resolveUploadPath,
  sniffImageType,
} from '@/lib/uploads'

const MAX_SIZE = 5 * 1024 * 1024 // 5 Mo
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTOS = 20
const MAX_VERIFICATION_PENDING = 3

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")) {
    return NextResponse.json({ error: "Invalid content-type" }, { status: 400 })
  }
  try {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const type = String(formData.get('type') ?? 'cover') // cover | gallery | verification

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: 'Format non supporté (JPEG, PNG ou WebP uniquement)' },
      { status: 400 }
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 })
  }

  // O tipo anunciado pelo cliente não é de confiança: confirmamos pelos
  // primeiros bytes do ficheiro.
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = sniffImageType(buffer)
  if (!ext) {
    return NextResponse.json(
      { error: 'Le fichier ne semble pas être une image (JPEG, PNG ou WebP)' },
      { status: 400 }
    )
  }

  const filename = `${session.user.id.slice(0, 8)}-${randomBytes(8).toString('hex')}.${ext}`

  // Quota antes de escrever no disco, para um membro não o encher.
  if (type === 'verification') {
    const pendentes = await prisma.verificationPhoto.count({
      where: { userId: session.user.id, status: 'pending' },
    })
    if (pendentes >= MAX_VERIFICATION_PENDING) {
      return NextResponse.json(
        { error: 'Vous avez déjà des photos de vérification en attente' },
        { status: 429 }
      )
    }
  } else {
    const existentes = await prisma.photo.count({ where: { userId: session.user.id } })
    if (existentes >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos par profil` },
        { status: 400 }
      )
    }
  }

  const uploadDir = uploadsDir()
  await mkdir(uploadDir, { recursive: true })

  await writeFile(path.join(uploadDir, filename), buffer)

  // Servida por /api/uploads: o Next só serve os ficheiros que estavam em
  // public/ quando arrancou, por isso um upload feito com o servidor a
  // correr devolvia 404 até ao reinício.
  const url = `/api/uploads/${filename}`

  if (type === 'verification') {
    await prisma.verificationPhoto.create({
      data: { userId: session.user.id, url, status: 'pending' },
    })
    return NextResponse.json({
      url,
      message: 'Photo de vérification envoyée. Elle sera examinée sous 24h.',
    })
  }

  // Photo de profil : si c'est la première, elle devient la couverture
  const count = await prisma.photo.count({ where: { userId: session.user.id } })
  const photo = await prisma.photo.create({
    data: {
      userId: session.user.id,
      url,
      isCover: type === 'cover' || count === 0,
      order: count,
    },
  })

  // Si nouvelle couverture explicite, retirer l'ancienne
  if (type === 'cover' && count > 0) {
    await prisma.photo.updateMany({
      where: { userId: session.user.id, id: { not: photo.id } },
      data: { isCover: false },
    })
  }

  return NextResponse.json({ url, photoId: photo.id, message: 'Photo ajoutée' })
  } catch (error) {
    console.error('[API] Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { photoId } = await request.json()
  const photo = await prisma.photo.findFirst({
    where: { id: photoId, userId: session.user.id },
  })
  if (!photo) {
    return NextResponse.json({ error: 'Photo introuvable' }, { status: 404 })
  }

  await prisma.photo.delete({ where: { id: photo.id } })

  // Apagar o ficheiro, senão fica lixo no disco para sempre.
  const filename = photo.url.split('/').pop() ?? ''
  for (const base of [uploadsDir(), legacyUploadsDir()]) {
    const full = resolveUploadPath(base, filename)
    if (!full) continue
    try {
      await unlink(full)
      break
    } catch {
      // já não existe nesta pasta
    }
  }

  return NextResponse.json({ message: 'Photo supprimée' })
}
