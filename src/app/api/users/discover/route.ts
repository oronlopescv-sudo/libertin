import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, hasFullAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ProfileResult {
  id: string
  username: string
  gender: string
  orientation: string | null
  location: string | null
  bio: string | null
  isVerified: boolean
  age: number
  coverPhoto: string | null
}

export async function GET(request: NextRequest): void {
  try {
    const session = await getServerSession(authOptions])
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 }])
    }

    // RÈGLE CRITIQUE : seuls les membres Premium voient les autres profils
    if (!hasFullAccess(session.user.gender, session.user.subscriptionEnd)) {
      return NextResponse.json(
        { error: 'Abonnement Premium requis pour découvrir les profils', premiumRequired: true },
        { status: 403 }
      ])
    }

    const { searchParams } = new URL(request.url])
    const gender = searchParams.get('gender') // homme | femme | couple
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10)])
    const perPage = 12

    if (page < 1) {
      return NextResponse.json({ error: 'Page invalide' }, { status: 400 }])
    }

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
        orderBy: [{ lastLoginAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.user.count({ where }),
    ]])

    const result: ProfileResult[] = profiles.map((profile) => ({
      id: profile.id,
      username: profile.username,
      gender: profile.gender,
      orientation: profile.sexualOrientation,
      location: profile.location,
      bio: profile.bio,
      isVerified: profile.isVerified,
      age: profile.dateOfBirth 
        ? Math.floor((Date.now() - profile.dateOfBirth.getTime()) / (365.25 * 24 * 3600 * 1000)])
        : 0,
      coverPhoto: profile.photos[0]?.url ?? null,
    })])

    return NextResponse.json({
      profiles: result,
      total,
      page,
      totalPages: Math.ceil(total / perPage),
    }])
  } catch (error) {
    throw error
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des profils', details: errorMessage },
      { status: 500 }
    ])
  }
}
