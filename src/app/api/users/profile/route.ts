import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      gender: true,
      sexualOrientation: true,
      location: true,
      bio: true,
      interests: true,
      isVerified: true,
      subscriptionTier: true,
      subscriptionEnd: true,
      dateOfBirth: true,
      photos: { select: { id: true, url: true, isCover: true }, orderBy: { order: 'asc' } },
      createdAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  return NextResponse.json({ user })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  const data: Record<string, unknown> = {}

  if (typeof body.username === 'string') {
    const username = body.username.trim()
    if (username.length < 3 || username.length > 24) {
      return NextResponse.json(
        { error: "Le pseudo doit contenir entre 3 et 24 caractères" },
        { status: 400 }
      )
    }
    const taken = await prisma.user.findFirst({
      where: { username, id: { not: session.user.id } },
    })
    if (taken) {
      return NextResponse.json({ error: 'Ce pseudo est déjà pris' }, { status: 409 })
    }
    data.username = username
  }

  if (typeof body.bio === 'string') {
    data.bio = body.bio.slice(0, 500)
  }
  if (typeof body.location === 'string') {
    data.location = body.location.slice(0, 100)
  }
  if (Array.isArray(body.interests)) {
    data.interests = body.interests.filter((i: unknown) => typeof i === 'string').slice(0, 10)
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, username: true, bio: true, location: true, interests: true },
  })

  return NextResponse.json({ user })
}
