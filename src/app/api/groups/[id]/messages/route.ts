import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, hasFullAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkMembership(userId: string, groupId: string) {
  return prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId } },
    include: { group: { select: { name: true } } },
  })
}

// GET — historique des messages (membres uniquement)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const membership = await checkMembership(session.user.id, params.id)
  if (!membership) {
    return NextResponse.json({ error: 'Vous ne faites pas partie de ce groupe' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const after = searchParams.get('after') // ISO date pour polling incrémental

  const messages = await prisma.message.findMany({
    where: {
      groupId: params.id,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    include: {
      user: { select: { id: true, username: true, gender: true, isVerified: true } },
    },
    orderBy: { createdAt: after ? 'asc' : 'desc' },
    take: 50,
  })

  return NextResponse.json({
    groupName: membership.group.name,
    messages: after ? messages : messages.reverse(),
  })
}

// POST — envoyer un message (Premium uniquement)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // RÈGLE CRITIQUE : seuls les Premium peuvent envoyer des messages
  if (!hasFullAccess(session.user.gender, session.user.subscriptionEnd)) {
    return NextResponse.json(
      { error: 'Abonnement Premium requis pour envoyer des messages', premiumRequired: true },
      { status: 403 }
    )
  }

  const membership = await checkMembership(session.user.id, params.id)
  if (!membership) {
    return NextResponse.json({ error: 'Vous ne faites pas partie de ce groupe' }, { status: 403 })
  }

  const { content } = await request.json()
  const text = String(content ?? '').trim()

  if (!text || text.length > 2000) {
    return NextResponse.json(
      { error: 'Le message doit contenir entre 1 et 2000 caractères' },
      { status: 400 }
    )
  }

  const message = await prisma.message.create({
    data: {
      content: text,
      userId: session.user.id,
      groupId: params.id,
    },
    include: {
      user: { select: { id: true, username: true, gender: true, isVerified: true } },
    },
  })

  // Mettre à jour l'activité du groupe
  await prisma.group.update({
    where: { id: params.id },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json({ message }, { status: 201 })
}
