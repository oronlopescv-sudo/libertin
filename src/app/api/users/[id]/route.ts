import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, hasFullAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (!hasFullAccess(session.user.gender, session.user.subscriptionEnd)) {
    return NextResponse.json(
      { error: 'Abonnement Premium requis', premiumRequired: true },
      { status: 403 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      username: true,
      gender: true,
      sexualOrientation: true,
      location: true,
      bio: true,
      interests: true,
      isVerified: true,
      isActive: true,
      isBanned: true,
      dateOfBirth: true,
      lastLoginAt: true,
      photos: { select: { url: true, isCover: true }, orderBy: { order: 'asc' } },
    },
  })

  if (!user || !user.isActive || user.isBanned) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  return NextResponse.json({
    profile: {
      id: user.id,
      username: user.username,
      gender: user.gender,
      orientation: user.sexualOrientation,
      location: user.location,
      bio: user.bio,
      interests: user.interests,
      isVerified: user.isVerified,
      age: Math.floor((Date.now() - user.dateOfBirth.getTime()) / (365.25 * 24 * 3600 * 1000)),
      lastSeen: user.lastLoginAt,
      photos: user.photos,
    },
  })
}
