import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, hasFullAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/conversations — démarrer (ou retrouver) une discussion privée 1-à-1.
 * Implémentée comme un groupe privé de 2 membres, catégorie "prive".
 */
export async function POST(request: NextRequest) {
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

  const { targetId } = await request.json()
  if (typeof targetId !== 'string' || targetId === session.user.id) {
    return NextResponse.json({ error: 'Destinataire invalide' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, username: true, isActive: true, isBanned: true },
  })
  if (!target || !target.isActive || target.isBanned) {
    return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 })
  }

  // Discussion déjà existante entre les deux ?
  const existing = await prisma.group.findFirst({
    where: {
      category: 'prive',
      AND: [
        { members: { some: { userId: session.user.id } } },
        { members: { some: { userId: targetId } } },
      ],
    },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json({ groupId: existing.id, existing: true })
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })

  const group = await prisma.group.create({
    data: {
      name: `💌 ${me?.username ?? 'Membre'} & ${target.username}`,
      category: 'prive',
      isPrivate: true,
      maxMembers: 2,
      creatorId: session.user.id,
      members: {
        create: [
          { userId: session.user.id, role: 'admin' },
          { userId: targetId, role: 'member' },
        ],
      },
    },
    select: { id: true },
  })

  return NextResponse.json({ groupId: group.id, existing: false }, { status: 201 })
}
