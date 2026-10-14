import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { isAdmin } from '@/lib/premium';

/** DELETE /api/annonces/:id — supprime sa propre annonce (ou toute annonce pour un admin). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = await createServerSupabaseClient();
    let q = supabase.from('annonces').delete().eq('id', id);
    if (!isAdmin(auth.user)) q = q.eq('user_id', auth.user.id);
    const { error } = await q;
    if (error) {
      console.error('[annonces DELETE]', error);
      return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[annonces DELETE]', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
