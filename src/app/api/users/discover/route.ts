import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, hasFullAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // RÈGLE CRITIQUE : seuls les membres Premium voient les autres profils
  if (!hasFullAccess(session.user.gender, session.user.subscriptionEnd)) {
    return NextResponse.json(
      { error: 'Abonnement Premium requis pour découvrir les profils', premiumRequired: true },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const gender = searchParams.get('gender') // homme | femme | couple
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const perPage = 12

  const where: Record<string, unknown> = {
    id: { not: session.user.id },
    isActive: true,
    isBanned: false,
  }
  if (gender && ['homme', 'femme', 'couple'].includes(gender)) {
    where.gender = gender
  }

  const [profiles, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        gender: true,
        sexualOrientation: true,
        location: true,
        bio: true,
        isVerified: true,
        dateOfBirth: true,
        photos: {
          where: { isCover: true },
          select: { url: true },
          take: 1,
        },
        createdAt: true,
      },
      orderBy: { lastLoginAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ])

  const result = profiles.map((p) => ({
    id: p.id,
    username: p.username,
    gender: p.gender,
    orientation: p.sexualOrientation,
    location: p.location,
    bio: p.bio,
    isVerified: p.isVerified,
    age: Math.floor((Date.now() - p.dateOfBirth.getTime()) / (365.25 * 24 * 3600 * 1000)),
    coverPhoto: p.photos[0]?.url ?? null,
  }))

  return NextResponse.json({
    profiles: result,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  })
}
