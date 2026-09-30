/**
 * Uploads resilientes : clé de service indisponible → session du membre.
 *
 * En septembre 2026, la production a tourné pendant des jours avec une clé de
 * service morte (401 « Unregistered ») ou vide (« Invalid Compact JWS ») :
 * tout upload de photo échouait côté client sans cause visible. Ce module
 * centralise la parade :
 *
 *   1. La clé de service n'est utilisée que si elle ressemble à un JWT
 *      exploitable par Supabase (format legacy `eyJ…` à trois segments — les
 *      nouvelles clés `sb_secret_…` ne le sont pas).
 *   2. Si l'écriture avec la clé de service échoue pour une raison liée à
 *      l'authentification, on reprend exactement la même opération avec le
 *      client de session du membre (cookie @supabase/ssr), qui fonctionne
 *      tant que les politiques RLS du bucket/table permettent l'écriture au
 *      propriétaire.
 *   3. Si aucune des deux n'aboutit, l'erreur de la dernière tentative
 *      remonte : le message est honnête et diagnostiquable.
 *
 * Les routes restent propriétaires de leur logique ; ce module ne décide
 * RIEN d'autre que « quel client utiliser pour écrire ».
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createServiceRoleClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * La clé de service n'est utilisée que si elle ressemble à un JWT Supabase
 * exploitable (format legacy `eyJ…` à trois segments). Les clés au nouveau
 * format `sb_secret_…` ne sont PAS acceptées par Storage/GoTrue : elles
 * produisent « Invalid Compact JWS ». Une valeur tronquée/absente est rejetée.
 */
export function chaveServicoUsavel(): boolean {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const segmentos = chave.split('.');
  return (
    chave.startsWith('eyJ') &&
    segmentos.length === 3 &&
    segmentos.every((s) => s.length > 0) &&
    chave.length > 150
  );
}

/**
 * Erreurs d'authentification/autorisation Supabase qui justifient une reprise
 * avec le client de session du membre : clé morte (« Unregistered API key »),
 * clé malformée (« Invalid Compact JWS », « invalid claim », …). Une
 * restriction métier (RLS du bucket lui-même, taille de fichier…) n'entre
 * PAS dans cette liste.
 */
export function erroDeAutenticacao(e: unknown): boolean {
  const mensagens = [String((e as any)?.message ?? ''), String(e ?? '')].join(' ');
  return /compact|jws|jwt|claim|api\s*key|unregistered|unauthoriz/i.test(mensagens);
}

type ResultadoSupabase<T> = { data: T | null; error: { message?: string } | null };

/** Rend [data, error] d'un retour supabase-js, qu'il soit object ou valeur nue. */
function extrairResultado<T>(r: unknown): [T | null, { message?: string } | null] {
  if (r && typeof r === 'object' && 'data' in (r as Record<string, unknown>)) {
    const forma = r as ResultadoSupabase<T>;
    return [forma.data, forma.error];
  }
  return [(r as T) ?? null, null];
}

function erroExcecao(e: unknown): { message?: string } | null {
  return { message: String((e as Error)?.message ?? e) };
}

export type ClienteComFonte = {
  cliente: SupabaseClient;
  /** 'servico' | 'sessao' | null (nenhum dos deux utilisable) */
  fonte: 'servico' | 'sessao' | null;
};

/**
 * Résout le client d'écriture au moment de la requête : clé de service s'il
 * en existe une d'exploitable, sinon client de session du membe.
 */
export async function clienteDeEscrita(): Promise<ClienteComFonte> {
  // 1) Clé de service exploitable → on la construit (peut lever si absente :
  //    capturé ici pour que seul le client de session soit rendu).
  if (chaveServicoUsavel()) {
    try {
      return { cliente: createServiceRoleClient(), fonte: 'servico' };
    } catch {
      /* clé définie mais non constructible — on continue vers la session */
    }
  }
  // 2) Client de session (cookies du membe, clé anon) — fonctionne pour
  //    chaque route dont les politiques Storage/table l'autorisent.
  return { cliente: await createServerSupabaseClient(), fonte: 'sessao' };
}

/**
 * Exécute `operacao` d'abord avec la clé de service (si exploitable) ; si le
 * résultat indique une erreur d'authentification, la refait à l'identique avec
 * le client de session du membre. `.supabase-js` retourne `{ error }` au lieu
 * de lever, les deux formes sont donc traitées ici.
 */
export async function comRetomada<T = unknown>(
  operacao: (cliente: SupabaseClient) => PromiseLike<unknown>
): Promise<ResultadoSupabase<T> & { fonte: 'servico' | 'sessao' | null }> {
  // 1) Tentativa com a chave de serviço — apenas se ela for utilizável.
  if (chaveServicoUsavel()) {
    let servico: SupabaseClient | null = null;
    try {
      servico = createServiceRoleClient();
    } catch {
      servico = null; // clé définie mais non constructible — on continue vers la session
    }
    if (servico) {
      let r1: unknown;
      try {
        r1 = await operacao(servico);
      } catch (e) {
        r1 = { data: null, error: erroExcecao(e) };
      }
      const [dados1, erro1] = extrairResultado<T>(r1);
      if (!erro1) return { data: dados1, error: null, fonte: 'servico' };
      if (erroDeAutenticacao(erro1)) {
        console.warn(
          "[upload-fallback] écriture refusée avec la clé de service ('" +
            String(erro1?.message ?? erro1) +
            "') — reprise avec la session du membre"
        );
        // on continue vers la reprise par session
      } else {
        // Erro de verdade (política, tamanho, tipo de ficheiro) : não insistir.
        return { data: null, error: erro1, fonte: 'servico' };
      }
    }
  }
  // 2) Reprise (ou caminho único) : session du membre.
  try {
    const sessao = await createServerSupabaseClient();
    let r2: unknown;
    try {
      r2 = await operacao(sessao);
    } catch (e) {
      r2 = { data: null, error: erroExcecao(e) };
    }
    const [dados2, erro2] = extrairResultado<T>(r2);
    return { data: dados2, error: erro2, fonte: 'sessao' };
  } catch (e) {
    return { data: null, error: erroExcecao(e), fonte: 'sessao' };
  }
}

/** Message français, présentable au membre, pour une erreur d'upload. */
export function mensagensDeErroUpload(e: unknown): string {
  const msg = String((e as any)?.message ?? e ?? 'Erreur inconnue');
  if (/5MB|too large|trop volumineux/i.test(msg)) return 'Fichier trop volumineux (max 5 Mo)';
  if (/mime|type|format|content/i.test(msg)) return 'Format de fichier non accepté (JPEG, PNG ou WebP)';
  if (/compact|jws|jwt|claim|api\s*key|unregistered|unauthoriz/i.test(msg)) {
    return 'Stockage indisponible pour le moment — réessayez dans un instant.';
  }
  return msg;
}