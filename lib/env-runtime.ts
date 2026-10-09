/**
 * Sobrepõe segredos de runtime a partir de um ficheiro estável fora da pasta
 * da build. Porquê: no Hostinger, o `.env` do deploy é REGENERADO a cada
 * Deploy a partir das «Variables d'environnement» do painel — que ainda
 * guardava valores antigos (chave de serviço rotacionada, chave restrita sem
 * permissão de Checkout, whsec de endpoint eliminado). O dotenv do Next não
 * sobrepõe variáveis já presentes no ambiente, e o server.js standalone é
 * gerado pela plataforma, não pelo repo.
 *
 * Caminhos tentados, nesta ordem:
 *   1. HOME/domains/«dominio»/.env-runtime  (raiz de cada domínio — o
 *      ficheiro escrito por SSH sobrevive às deploys)
 *   2. cwd/../../../.env-runtime            (…/hbuilds/.env-runtime)
 *   3. cwd/../../../../.env-runtime         (…/domains/«dominio»/.env-runtime)
 *
 * Só sobrepõe as 3 chaves de SERVIDOR (nunca o cliente). Falha em silêncio:
 * sem este ficheiro, o comportamento é o de antes. Nunca aceitar NEXT_PUBLIC_*
 * — as públicas são congeladas na build de propósito.
 *
 * Este módulo é empacotado também para o runtime EDGE pelo webpack (porque é
 * alcançado por instrumentation.ts) — e aí `fs` não existe. Evitámos o import
 * estático (o webpack falha o build) e o 'path' (concatenação de strings): o
 * require com nome DINÂMICO não é resolvido estaticamente; no edge `require`
 * nem existe (aí o try/catch desiste — nunca é chamado).
 */

const CHAVES_PERMITIDAS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
] as const;

let jaAplicado = false;

export function aplicaEnvRuntime(): void {
  if (jaAplicado) return;
  jaAplicado = true;

  if (typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge') return;
  if (typeof window !== 'undefined') return;

  try {
    const req = eval('require') satisfies typeof require; // sem resolução estática
    const fs = req('fs') as typeof import('fs');

    // 1. $HOME/domains/*/.env-runtime
    const raizes: string[] = [];
    const home = process.env.HOME;
    if (home) {
      try {
        for (const d of fs.readdirSync(home + '/domains')) {
          raizes.push(home + '/domains/' + d + '/.env-runtime');
        }
      } catch {
        /* $HOME/domains não existe */
      }
    }
    // 2./3. relativos à pasta da app (versions/<uuid>/nodejs = cwd)
    raizes.push(process.cwd() + '/../../../.env-runtime');
    raizes.push(process.cwd() + '/../../../../.env-runtime');

    for (const ficheiro of raizes) {
      if (!fs.existsSync(ficheiro)) continue;

      let aplicadas = 0;
      for (const linha of fs.readFileSync(ficheiro, 'utf8').split('\n')) {
        const m = linha.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (!m) continue;
        if (!(CHAVES_PERMITIDAS as readonly string[]).includes(m[1])) continue;
        process.env[m[1]] = m[2].trim();
        aplicadas += 1;
      }
      if (aplicadas > 0) {
        console.log(`[env-runtime] ${aplicadas} segredos aplicados a partir de ${ficheiro}`);
        return;
      }
    }
  } catch {
    /* edge runtime, ficheiro ausente ou formato inesperado — segue o fluxo normal */
  }
}