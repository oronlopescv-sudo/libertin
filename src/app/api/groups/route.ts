import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, hasFullAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/groups — lister les groupes (les miens + publics)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const [myGroups, publicGroups] = await Promise.all([
    prisma.group.findMany({
      where: {
        members: { some: { userId: session.user.id } },
      },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.group.findMany({
      where: {
        isPrivate: false,
        category: { not: 'prive' },
        members: { none: { userId: session.user.id } },
      },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  return NextResponse.json({ myGroups, publicGroups })
}

// POST /api/groups — créer un groupe (Premium uniquement)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (!hasFullAccess(session.user.gender, session.user.subscriptionEnd)) {
    return NextResponse.json(
      { error: 'Abonnement Premium requis pour créer un groupe', premiumRequired: true },
      { status: 403 }
    )
  }

  const { name, description, category, isPrivate } = await request.json()

  if (!name || name.trim().length < 3 || name.length > 60) {
    return NextResponse.json(
      { error: 'Le nom du groupe doit contenir entre 3 et 60 caractères' },
      { status: 400 }
    )
  }

  const validCategories = ['casual', 'aventure', 'discretion']
  const cat = validCategories.includes(category) ? category : 'casual'

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.slice(0, 500) ?? null,
      category: cat,
      isPrivate: Boolean(isPrivate),
      creatorId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: 'admin',
        },
      },
    },
  })

  return NextResponse.json({ group }, { status: 201 })
}
