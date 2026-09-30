/**
 * Variáveis de ambiente do Supabase expostas de forma centralizada.
 *
 * Usadas em rotas API do lado servidor (recuperação de senha nativa,
 * reenvio de confirmação, verificação de pseudo) — só com a chave anon,
 * nunca a de service role. Reexportar através deste módulo evita espalhar
 * `process.env.NEXT_PUBLIC_*` por cada rota.
 */

export const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';