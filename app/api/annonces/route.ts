import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurActuel, utilisateurPremium } from '@/lib/auth-serveur';

/** GET /api/annonces — annonces actives (tout membre connecté). */
export async function GET() {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('annonces')
      .select('id, user_id, title, body, city, created_at, expires_at')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      console.error('[annonces GET]', error);
      return NextResponse.json({ error: 'Erreur lors du chargement des annonces' }, { status: 500 });
    }

    const ids = [...new Set((data ?? []).map((a: any) => a.user_id))];
    const noms = new Map<string, string>();
    if (ids.length) {
      const { data: profils } = await supabase.from('profiles').select('id, username').in('id', ids);
      (profils ?? []).forEach((p: any) => noms.set(p.id, p.username));
    }

    return NextResponse.json({
      moiId: auth.user.id,
      annonces: (data ?? []).map((a: any) => ({
        id: a.id,
        userId: a.user_id,
        username: noms.get(a.user_id) ?? 'Membre',
        title: a.title,
        body: a.body,
        city: a.city,
        createdAt: a.created_at,
        expiresAt: a.expires_at,
      })),
    });
  } catch (err) {
    console.error('[annonces GET]', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/** POST /api/annonces — publier une annonce (Premium uniquement). */
export async function POST(req: NextRequest) {
  try {
    const auth = await utilisateurPremium('publier une annonce');
    if (!auth.ok) return auth.reponse;

    const b = await req.json().catch(() => ({}));
    const title = typeof b.title === 'string' ? b.title.trim() : '';
    const body = typeof b.body === 'string' ? b.body.trim() : '';
    const city = typeof b.city === 'string' ? b.city.trim().slice(0, 80) : '';
    if (title.length < 3 || title.length > 100) {
      return NextResponse.json({ error: 'Le titre doit contenir entre 3 et 100 caractères.' }, { status: 400 });
    }
    if (body.length < 10 || body.length > 1500) {
      return NextResponse.json({ error: 'Le texte doit contenir entre 10 et 1500 caractères.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Anti-spam : 5 annonces actives maximum par membre.
    const { count } = await supabase
      .from('annonces')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());
    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: 'Vous avez déjà 5 annonces actives. Supprimez-en une pour en publier une nouvelle.' }, { status: 429 });
    }

    const { data, error } = await supabase
      .from('annonces')
      .insert({ user_id: auth.user.id, title, body, city })
      .select('id')
      .single();
    if (error) {
      console.error('[annonces POST]', error);
      return NextResponse.json({ error: "Erreur lors de la publication de l'annonce" }, { status: 500 });
    }
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error('[annonces POST]', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
