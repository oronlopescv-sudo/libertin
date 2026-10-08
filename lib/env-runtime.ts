/**
 * Sobrepõe segredos de runtime a partir de um ficheiro estável fora da pasta
 * da build. Porquê: no Hostinger, o `.env` do deploy é REGENERADO a cada
 * Deploy a partir das «Variables d'environnement» do painel — que ainda
 * guardava valores antigos (chave de serviço rotacionada, chave restrita sem
 * permissão de Checkout, whsec de endpoint eliminado). O dotenv do Next não
 * sobrepõe variáveis já presentes no ambiente, e o server.js standalone é
 * gerado pela plataforma, não pelo repo.
 *
 * O ficheiro vive no raiz do domínio (`…/domains/xlibertine.com/`), que
 * sobrevive aos deploys; o caminho é relativo à pasta da app
 * (…/hbuilds/versions/<uuid>/nodejs → ../../../ = raiz do domínio).
 *
 * Só sobrepõe as 3 chaves de SERVIDOR (nunca o cliente). Falha em silêncio:
 * sem este ficheiro, o comportamento é o de antes. Nunca aceitar NEXT_PUBLIC_*
 * — as públicas são congeladas na build de propósito.
 *
 * Este módulo é empacotado também para o runtime EDGE pelo webpack (porque é
 * alcançado por instrumentation.ts) — e aí `fs`/`path` não existem. Evitámos
 * `import fs` estático (o webpack falha o build) e `path` (concatenação de
 * strings): o require com nome DINÂMICO não é resolvido estaticamente; no
 * edge `require` nem existe (aí o try/catch desiste — nunca é chamado).
 */

const CHAVES_PERMITIDAS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const;

let jaAplicado = false;

export function aplicaEnvRuntime(): void {
  if (jaAplicado) return;
  jaAplicado = true;

  if (typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge') return;

  try {
    const req = eval('require') satisfies typeof require; // sem resolução estática
    const fs = req('fs') as typeof import('fs');
    const ficheiro = process.cwd() + '/../../../.env-runtime';
    if (!fs.existsSync(ficheiro)) return;

    let aplicadas = 0;
    for (const linha of fs.readFileSync(ficheiro, 'utf8').split('\n')) {
      const m = linha.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m) continue;
      if (!(CHAVES_PERMITIDAS as readonly string[]).includes(m[1])) continue;
      process.env[m[1]] = m[2].trim();
      aplicadas += 1;
    }
    if (aplicadas > 0) {
      console.log(`[env-runtime] ${aplicadas} segredos aplicados a partir de .env-runtime`);
    }
  } catch {
    /* edge runtime, ficheiro ausente ou formato inesperado — segue o fluxo normal */
  }
}