/**
 * Hook de boot do servidor (Next 15) — corre UMA vez no arranque, antes de
 * qualquer módulo de rota inicializar. É o lugar certo para subir os segredos
 * do `.env-runtime` (caminho estável fora da pasta de versions do Hostinger):
 * as variáveis do painel podem estar antigas e sombreiam o `.env` do deploy,
 * porque o carregamento de env do Next nunca sobrepõe variáveis existentes.
 *
 * O webpack também empacota este ficheiro para o runtime EDGE, onde fs/path
 * não existem — por isso o import tem de ser DINÂMICO, dentro do guard
 * NEXT_RUNTIME === 'nodejs'. Só corre no servidor, nunca no bundle cliente.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { aplicaEnvRuntime } = await import('./lib/env-runtime');
  aplicaEnvRuntime();
}