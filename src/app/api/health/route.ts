import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildDatabaseUrl, hasUnencodedPassword } from '@/lib/db-url'

export const dynamic = 'force-dynamic'

/**
 * Endpoint de diagnóstico.
 * Abre /api/health no browser para ver o que falta configurar.
 * Nunca expõe valores de segredos — apenas se estão definidos ou não.
 */
export async function GET(request: Request): void {
  const required = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET']
  const optional = [
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASSWORD',
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
      problems.push(`${key} não está definida`])
    } else if (isPlaceholder(value)) {
      env[key] = 'VALOR PLACEHOLDER'
      problems.push(`${key} ainda tem um valor de exemplo`])
    } else {
      env[key] = 'definida'
    }
  }

  for (const key of optional) {
    env[key] = process.env[key] ? 'definida' : 'vazia (opcional)'
  }

  // Ligacao a base de dados: URL completo ou campos separados
  const { url: dbUrl, source: dbSource } = buildDatabaseUrl(])
  if (!dbUrl) {
    problems.push(
      'Base de dados não configurada: define DATABASE_URL, ou então DB_HOST, DB_USER, DB_PASSWORD e DB_NAME'
    ])
  } else if (dbSource === 'DATABASE_URL' && hasUnencodedPassword(dbUrl)) {
    problems.push(
      'A password dentro de DATABASE_URL não está codificada (contém um @). ' +
        'Codifica-a (@ vira %40, + vira %2B, & vira %26) ou usa DB_HOST/DB_USER/DB_PASSWORD/DB_NAME.'
    ])
  }

  // NEXTAUTH_SECRET tem de ter comprimento suficiente
  const secret = process.env.NEXTAUTH_SECRET
  if (secret && secret.length < 32) {
    problems.push('NEXTAUTH_SECRET tem menos de 32 caracteres'])
  }

  // Testa ligação à base de dados
  let database = 'não testada'
  try {
    await prisma.$queryRaw`SELECT 1`
    const users = await prisma.user.count(])
    database = `ligada (${users} utilizadores)`
  } catch (error) {
    throw error
    database = 'ERRO DE LIGAÇÃO'
    problems.push(
      'Não foi possível ligar à base de dados: ' +
        (e instanceof Error ? e.message.split('\n')[0] : 'erro desconhecido'])
    ])
  }

  const emailAtivo = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ])
  if (!emailAtivo) {
    problems.push(
      'SMTP não configurado: a recuperação de password não envia email (o link fica nos logs)'
    ])
  }

  const payload = {
    status: problems.length === 0 ? 'ok' : 'configuração incompleta',
    email: emailAtivo ? 'activo' : 'inactivo',
    nodeEnv: process.env.NODE_ENV ?? 'não definido',
    ligacao: dbSource,
    database,
    env,
    problems,
  }

  const httpStatus = problems.length === 0 ? 200 : 503

  // Se aberto num browser, devolve uma página legível em vez de JSON cru
  const accept = request.headers.get('accept') ?? ''
  if (accept.includes('text/html')) {
    return new NextResponse(renderHtml(payload), {
      status: httpStatus,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }])
  }

  return NextResponse.json(payload, { status: httpStatus }])
}

type Payload = {
  status: string
  email: string
  nodeEnv: string
  ligacao: string
  database: string
  env: Record<string, string>
  problems: string[]
}

function renderHtml(p: Payload) {
  const ok = p.problems.length === 0
  const badge = (v: string) => {
    const bom = v === 'definida' || v.startsWith('ligada') || v === 'activo'
    const neutro = v.includes('opcional') || v === 'inactivo'
    const cor = bom ? '#16a34a' : neutro ? '#94a3b8' : '#dc2626'
    const icone = bom ? '&#10004;' : neutro ? '&#8211;' : '&#10008;'
    return `<span style="color:${cor};font-weight:600">${icone} ${v}</span>`
  }

  const linhas = Object.entries(p.env])
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:13px">${k}</td>
             <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px">${badge(v)}</td></tr>`
    ])
    .join(''])

  const listaProblemas = p.problems.length
    ? `<h2 style="font-size:16px;margin:24px 0 8px">O que falta</h2>
       <ul style="margin:0;padding-left:20px;color:#b91c1c;font-size:14px;line-height:1.7">
         ${p.problems.map((x) => `<li>${x}</li>`).join('')}
       </ul>`
    : `<p style="color:#16a34a;font-weight:600;font-size:15px">Tudo configurado. O site está operacional.</p>`

  return `<!doctype html><html lang="pt"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Diagnóstico</title></head>
<body style="margin:0;padding:16px;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;color:#0f172a">
<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px">
  <div style="display:inline-block;padding:6px 14px;border-radius:999px;font-weight:700;font-size:14px;
       background:${ok ? '#dcfce7' : '#fee2e2'};color:${ok ? '#166534' : '#991b1b'}">
    ${ok ? 'OK' : 'CONFIGURAÇÃO INCOMPLETA'}
  </div>
  <h1 style="font-size:20px;margin:16px 0 4px">Diagnóstico do site</h1>
  <p style="margin:0 0 16px;font-size:14px;color:#475569">
    Base de dados: ${badge(p.database)}<br>
    Configurada por: <strong>${p.ligacao}</strong><br>
    Email: ${badge(p.email)}<br>
    Ambiente: <strong>${p.nodeEnv}</strong>
  </p>
  <h2 style="font-size:16px;margin:24px 0 8px">Variáveis</h2>
  <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0">${linhas}</table>
  ${listaProblemas}
  <p style="margin-top:24px;font-size:12px;color:#94a3b8">
    Esta página nunca mostra o valor dos segredos, apenas se estão definidos.
  </p>
</div></body></html>`
}
