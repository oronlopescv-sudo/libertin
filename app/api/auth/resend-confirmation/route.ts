import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase-env';

/**
 * POST /api/auth/resend-confirmation  { email }
 *
 * Renvoie l'e-mail de confirmation d'inscription. Sans cela, une personne
 * qui n'avait pas reçu le premier e-mail restait fermée à l'extérieur pour
 * toujours : aucun bouton de reenvio n'existait.
 *
 * Clé anon uniquement (supabase.auth.resend). Le membre est déduit de
 * l'e-mail qu'il retape, jamais d'un identifiant client. Réponse neutre
 * quelque soit l'existence du compte (pas d'énumération).
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json().catch(() => ({}));

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email obligatoire.' }, { status: 400 });
    }

    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { error } = await anon.auth.resend({
      type: 'signup',
      email: email.trim(),
    });

    if (error) {
      const brut = String(error.message || '').toLowerCase();
      if (brut.includes('rate limit') || brut.includes('too many')) {
        return NextResponse.json(
          { error: 'Trop d\'e-mails envoyés : attendez quelques minutes avant de redemander.' },
          { status: 429 }
        );
      }
      // E-mail inconnu / déjà confirmé : réponse neutre — aucun indice.
      return NextResponse.json(
        { success: true, message: "Si l'inscription attend une confirmation, l'e-mail est reparti." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'E-mail de confirmation renvoyé.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[resend-confirmation]', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}