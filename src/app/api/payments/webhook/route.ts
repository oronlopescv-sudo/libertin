import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, isValidTier } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

async function activateSubscription(userId: string, tier: string, stripeSessionId: string) {
  if (!isValidTier(tier)) throw new Error(`Tier invalide: ${tier}`)
  const plan = PLANS[tier]

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error(`Utilisateur introuvable: ${userId}`)

  // Si abonnement encore actif, prolonger à partir de la date de fin
  const now = new Date()
  const startFrom =
    user.subscriptionEnd && user.subscriptionEnd > now ? user.subscriptionEnd : now
  const endDate = new Date(startFrom)
  endDate.setMonth(endDate.getMonth() + plan.durationMonths)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionStart: now,
        subscriptionEnd: endDate,
      },
    }),
    prisma.subscription.create({
      data: {
        userId,
        tier,
        priceEuro: plan.priceEuro,
        stripeSessionId,
        startDate: now,
        endDate,
        status: 'active',
      },
    }),
  ])
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature ?? '',
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    )
  } catch (err) {
    console.error('[WEBHOOK] Signature invalide', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, tier } = session.metadata ?? {}

    if (!userId || !tier) {
      console.error('[WEBHOOK] Metadata manquante', session.id)
      return NextResponse.json({ error: 'Metadata manquante' }, { status: 400 })
    }

    // Retry avec backoff exponentiel
    let retries = 3
    while (retries > 0) {
      try {
        await activateSubscription(userId, tier, session.id)
        console.log(`[WEBHOOK] Abonnement ${tier} activé pour ${userId}`)
        break
      } catch (e) {
        retries--
        if (retries === 0) {
          console.error('[WEBHOOK] Échec définitif activation abonnement', e)
          return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
        }
        await delay(1000 * (4 - retries))
      }
    }
  }

  return NextResponse.json({ received: true })
}
