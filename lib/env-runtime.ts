import fs from 'fs';
import path from 'path';

/**
 * Sobrepõe segredos de runtime a partir de um ficheiro estável fora da
 *
 * pasta da build. Porquê: no Hostinger, o `.env` do deploy é REGENERADO a
 *
 * cada Deploy a partir das «Variables d'environnement» do painel — que
 *
 * ainda guardava valores antigos (chave de serviço rotacionada, chave
 *
 * restrita sem permissão de Checkout, whsec de endpoint eliminado). O
 *
 * dotenv do Next não sobrepõe variáveis já presentes no ambiente, e o
 *
 * server.js standalone é gerado pela plataforma, não pelo repo.
 *
 *
 * O ficheiro vive no raiz do domínio (`…/domains/xlibertine.com/`), que
 *
 * sobrevive aos deploys; o caminho é relativo à pasta da app
 *
 * (…/hbuilds/versions/<uuid>/nodejs → ../../.. = raiz do domínio).
 *
 *
 * Só sobrepõe as 3 chaves de SERVIDOR (nunca o cliente). Falha em silêncio:
 *
 * sem este ficheiro, o comportamento é o de antes. Nunca aceitar
 *
 * NEXT_PUBLIC_* — as públicas são congeladas na build de propósito.
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

  try {
    const ficheiro = path.resolve(process.cwd(), '..', '..', '..', '.env-runtime');
    if (!fs.existsSync(ficheiro)) return;

    const bruto = fs.readFileSync(ficheiro, 'utf8');
    let aplicadas = 0;
    for (const linha of bruto.split('\n')) {
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
    /* sem permissão de leitura ou caminho inexistente — segue o fluxo normal */
  }
}