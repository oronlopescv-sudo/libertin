import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Endpoint de diagnóstico.
 * Abre /api/health no browser para ver o que falta configurar.
 * Nunca expõe valores de segredos — apenas se estão definidos ou não.
 */
export async function GET() {
  const required = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET']
  const optional = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLIC_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SENDGRID_API_KEY',
    'ADMIN_EMAIL',
  ]

  const isPlaceholder = (v: string) =>
    v.includes('REPLACE_WITH') || v.includes('your-secret') || v === ''

  const env: Record<string, string> = {}
  const problems: string[] = []

  for (const key of required) {
    const value = process.env[key]
    if (!value) {
      env[key] = 'EM FALTA'
      problems.push(`${key} não está definida`)
    } else if (isPlaceholder(value)) {
      env[key] = 'VALOR PLACEHOLDER'
      problems.push(`${key} ainda tem um valor de exemplo`)
    } else {
      env[key] = 'definida'
    }
  }

  for (const key of optional) {
    env[key] = process.env[key] ? 'definida' : 'vazia (opcional)'
  }

  // NEXTAUTH_SECRET tem de ter comprimento suficiente
  const secret = process.env.NEXTAUTH_SECRET
  if (secret && secret.length < 32) {
    problems.push('NEXTAUTH_SECRET tem menos de 32 caracteres')
  }

  // Testa ligação à base de dados
  let database = 'não testada'
  try {
    await prisma.$queryRaw`SELECT 1`
    const users = await prisma.user.count()
    database = `ligada (${users} utilizadores)`
  } catch (e) {
    database = 'ERRO DE LIGAÇÃO'
    problems.push(
      'Não foi possível ligar à base de dados: ' +
        (e instanceof Error ? e.message.split('\n')[0] : 'erro desconhecido')
    )
  }

  return NextResponse.json(
    {
      status: problems.length === 0 ? 'ok' : 'configuração incompleta',
      nodeEnv: process.env.NODE_ENV ?? 'não definido',
      database,
      env,
      problems,
    },
    { status: problems.length === 0 ? 200 : 503 }
  )
}
