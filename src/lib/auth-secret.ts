import { createHash } from 'crypto'
import { buildDatabaseUrl } from '@/lib/db-url'

/**
 * O NextAuth recusa-se a arrancar em produção sem um segredo, devolvendo
 * `error=Configuration` — o site fica de pé mas ninguém consegue entrar.
 *
 * O ideal continua a ser definir NEXTAUTH_SECRET no painel. Enquanto isso
 * não acontece, derivamos um segredo estável a partir do URL da base de
 * dados, que já é um valor secreto e próprio desta instalação.
 *
 * Porque é aceitável:
 *   - não fica escrito no repositório, portanto quem lê o código-fonte
 *     não o consegue reproduzir;
 *   - é estável entre reinícios, por isso as sessões sobrevivem a deploys;
 *   - passa por SHA-256, logo tem 256 bits de comprimento.
 *
 * Limitação a conhecer: se a password da base de dados mudar, o segredo
 * muda com ela e todas as sessões abertas terminam. É por isso que a
 * variável dedicada continua a ser a opção correcta.
 */

export type SecretSource = 'NEXTAUTH_SECRET' | 'derivado' | 'nenhuma'

export function getAuthSecret(): { secret: string | undefined; source: SecretSource } {
  const explicito = process.env.NEXTAUTH_SECRET?.trim()
  if (explicito && explicito.length >= 16) {
    return { secret: explicito, source: 'NEXTAUTH_SECRET' }
  }

  const { url } = buildDatabaseUrl()
  if (url) {
    const derivado = createHash('sha256')
      .update('rencontres-premium:auth:v1:' + url)
      .digest('hex')
    return { secret: derivado, source: 'derivado' }
  }

  return { secret: undefined, source: 'nenhuma' }
}

/**
 * O NextAuth v4 precisa de saber o endereço público do site. Em alojamentos
 * onde a variável não foi definida, deduzimo-lo dos cabeçalhos do pedido.
 * Só escreve se a variável ainda não existir — um valor definido no painel
 * tem sempre prioridade.
 */
export function ensureAuthUrl(headers: Headers): void {
  if (process.env.NEXTAUTH_URL) return

  const host = headers.get('x-forwarded-host') ?? headers.get('host')
  if (!host) return

  const proto = headers.get('x-forwarded-proto') ?? 'https'
  process.env.NEXTAUTH_URL = `${proto}://${host}`
}
