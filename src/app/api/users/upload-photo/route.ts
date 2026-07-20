import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'

const MAX_SIZE = 5 * 1024 * 1024 // 5 Mo
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
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

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const filename = `${session.user.id.slice(0, 8)}-${randomBytes(8).toString('hex')}.${ext}`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(uploadDir, filename), buffer)

  const url = `/uploads/${filename}`

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
  return NextResponse.json({ message: 'Photo supprimée' })
}
