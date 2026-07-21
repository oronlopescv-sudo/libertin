import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic: nunca executar no build (sem BD disponível)
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [total, hommes] = await Promise.all([
      prisma.user.count({ where: { isActive: true, isBanned: false } }),
      prisma.user.count({ where: { isActive: true, isBanned: false, gender: 'homme' } }),
    ])

    // Valeurs par défaut avant d'avoir une vraie base (évite d'afficher 0)
    if (total < 50) {
      return NextResponse.json({
        total,
        femmesCouplesPct: 76.0,
        hommesPct: 24.0,
        seeded: true,
      })
    }

    const hommesPct = Math.round((hommes / total) * 1000) / 10
    const femmesCouplesPct = Math.round((100 - hommesPct) * 10) / 10

    return NextResponse.json({ total, femmesCouplesPct, hommesPct, seeded: false })
  } catch {
    // BD indisponível: devolve valores default em vez de crashar
    return NextResponse.json({
      total: 12847,
      femmesCouplesPct: 76.0,
      hommesPct: 24.0,
      seeded: true,
    })
  }
}
