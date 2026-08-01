/**
 * Constrói o URL de ligação à base de dados.
 *
 * Existem duas formas de configurar, e a segunda evita o erro mais comum:
 * uma password com caracteres especiais (@ + & # / : ?) parte o URL se não
 * for codificada, e o erro que daí resulta não ajuda nada.
 *
 * Forma 1 — URL completo (a password TEM de vir codificada):
 *   DATABASE_URL = mysql://utilizador:pass%40word@localhost:3306/base
 *
 * Forma 2 — campos separados (a password vai tal como é, sem codificar):
 *   DB_HOST     = localhost
 *   DB_PORT     = 3306          (opcional, 3306 por omissão)
 *   DB_USER     = o_utilizador_da_base
 *   DB_PASSWORD = a_password_tal_como_e
 *   DB_NAME     = o_nome_da_base
 *
 * Nunca escrever credenciais reais neste ficheiro: fica tudo no histórico
 * do Git. Os valores vivem apenas nas variáveis de ambiente do servidor.
 *
 * Se as duas estiverem presentes, os campos separados têm prioridade,
 * por serem menos propensos a erro.
 */

export type DbUrlSource = 'campos_separados' | 'DATABASE_URL' | 'nenhuma'

export function buildDatabaseUrl(): { url: string | null; source: DbUrlSource } {
  const host = process.env.DB_HOST
  const user = process.env.DB_USER
  const password = process.env.DB_PASSWORD
  const name = process.env.DB_NAME

  if (host && user && name) {
    const port = process.env.DB_PORT || '3306'
    const auth = password
      ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
      : encodeURIComponent(user)
    return {
      url: `mysql://${auth}@${host}:${port}/${name}`,
      source: 'campos_separados',
    }
  }

  if (process.env.DATABASE_URL) {
    return { url: process.env.DATABASE_URL, source: 'DATABASE_URL' }
  }

  return { url: null, source: 'nenhuma' }
}

/**
 * Deteta um URL cuja password não foi codificada.
 * Reconhece-se por haver mais do que um '@' na parte das credenciais.
 */
export function hasUnencodedPassword(url: string): boolean {
  const afterScheme = url.split('://')[1]
  if (!afterScheme) return false
  const credentials = afterScheme.slice(0, afterScheme.lastIndexOf('@'))
  return credentials.includes('@')
}
