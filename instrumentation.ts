import { aplicaEnvRuntime } from './lib/env-runtime';

/**
 * Hook de boot do servidor (Next 15) — corre UMA vez no arranque, antes de
 * qualquer módulo de rota inicializar. É o lugar certo para subir os segredos
 * do `.env-runtime` (caminho estável fora da pasta de versions do Hostinger):
 * as variáveis do painel podem estar antigas e sombreiam o `.env` do deploy,
 * porque o carregamento de env do Next nunca sobrepõe variáveis existentes.
 *
 * Só corre no servidor — nunca toca no bundle do cliente.
 */
export async function register(): Promise<void> {
  if (typeof window !== 'undefined') return;
  aplicaEnvRuntime();
}