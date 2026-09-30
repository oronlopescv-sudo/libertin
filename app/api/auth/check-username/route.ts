import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase-env';

/**
 * GET /api/auth/check-username?username=X
 *
 * Vérifie la disponibilité d'un pseudo public AVANT l'inscription. Sans cet
 * appel, un pseudo déjà pris ne provoquait une erreur qu'après tout le
 * formulaire (voir les tentatives de connexion en double) — d'où des
 * abandons à l'étape finale.
 *
 * Requête anonyme, une seule ligne lue : la RLS permissive de `profiles`
 * permet la lecture, et la clé de service n'est pas nécessaire.
 *
 * Réponse :
 *   { disponivel: true }                        — pseudo libre
 *   { disponivel: false, sugestao: 'duo_92' }   — pris ; variante proposée
 *   { disponivel: true, incerto: true }         — panne (on n'empêche pas)
 */
const MAX_REPONSES = 1; // ne jamais lister de usernames : un seul verdict

export async function GET(req: NextRequest) {
  try {
    const brut = req.nextUrl.searchParams.get('username') ?? '';
    const username = brut.trim();

    // Mêmes règles que le formulaire : 2 à 24 caractères visibles.
    if (username.length < 2 || username.length > 24) {
      return NextResponse.json(
        { disponivel: false, motivo: 'longueur' },
        { status: 200 }
      );
    }

    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await anon
      .from('profiles')
      .select('id')
      .eq('username', username)
      .limit(MAX_REPONSES);

    if (error) {
      // En cas de panne on répond « disponible » : mieux vaut laisser
      // l'inscription se terminer (le serveur revalidera) que bloquer.
      console.warn('[check-username] erreur lecture :', error.message);
      return NextResponse.json({ disponivel: true, incerto: true }, { status: 200 });
    }

    const ocupado = (data ?? []).length > 0;

    if (ocupado) {
      // Sugestão simple : pseudo + «_» + 2 chiffres (vérifié immédiatement).
      let sugestao = '';
      for (let tentativa = 0; tentativa < 5; tentativa++) {
        const numero = Math.floor(10 + Math.random() * 89); // 10-99
        const candidata = `${username.slice(0, 20)}_${numero}`;
        const { data: existente } = await anon
          .from('profiles')
          .select('id')
          .eq('username', candidata)
          .limit(1);
        if (!existente || existente.length === 0) {
          sugestao = candidata;
          break;
        }
      }
      return NextResponse.json({ disponivel: false, sugestao }, { status: 200 });
    }

    return NextResponse.json({ disponivel: true }, { status: 200 });
  } catch (err) {
    console.error('[check-username]', err);
    // Pareil : ne jamais bloquer une inscription pour une panne de l'aide.
    return NextResponse.json({ disponivel: true, incerto: true }, { status: 200 });
  }
}