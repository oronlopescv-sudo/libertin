import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, hasFullAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (!hasFullAccess(session.user.gender, session.user.subscriptionEnd)) {
    return NextResponse.json(
      { error: 'Abonnement Premium requis pour rejoindre un groupe', premiumRequired: true },
      { status: 403 }
    )
  }

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: { _count: { select: { members: true } } },
  })

  if (!group) {
    return NextResponse.json({ error: 'Groupe introuvable' }, { status: 404 })
  }

  if (group.isPrivate) {
    return NextResponse.json(
      { error: 'Ce groupe est privé — invitation requise' },
      { status: 403 }
    )
  }

  if (group._count.members >= group.maxMembers) {
    return NextResponse.json({ error: 'Ce groupe est complet' }, { status: 409 })
  }

  const existing = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId: group.id } },
  })
  if (existing) {
    return NextResponse.json({ message: 'Déjà membre' })
  }

  await prisma.groupMembership.create({
    data: { userId: session.user.id, groupId: group.id },
  })

  return NextResponse.json({ message: 'Vous avez rejoint le groupe' }, { status: 201 })
}
