import { NextRequest, NextResponse } from 'next/server';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/photos — liste les photos du membre connecté.
 * DELETE /api/photos?id=... — supprime une de ses photos (fichier + ligne).
 *
 * Sans ce fichier, les photos envoyées via POST /api/photos/upload
 * n'étaient jamais visibles nulle part : rien ne les relisait.
 */

export async function GET(req: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = await createServerSupabaseClient();
    const { data: photos, error } = await supabase
      .from('photos')
      .select('id, url, is_cover, display_order, uploaded_at')
      .eq('user_id', auth.user.id)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[photos GET]', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des photos' }, { status: 500 });
    }

    return NextResponse.json({ photos: photos ?? [] });
  } catch (error) {
    console.error('[photos GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const photoId = req.nextUrl.searchParams.get('id');
    if (!photoId) {
      return NextResponse.json({ error: "L'identifiant de la photo est requis" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Vérifie que la photo appartient bien à la personne qui la supprime.
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('id, url, user_id, is_cover')
      .eq('id', photoId)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo introuvable' }, { status: 404 });
    }
    if (photo.user_id !== auth.user.id) {
      return NextResponse.json({ error: 'Vous ne possédez pas cette photo' }, { status: 403 });
    }

    // Retrouve le chemin dans le bucket à partir de l'URL publique pour
    // pouvoir supprimer le fichier, pas seulement la ligne en base.
    const bucket = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = photo.url.indexOf(marker);
    if (idx !== -1) {
      const path = photo.url.slice(idx + marker.length);
      const { error: storageError } = await supabase.storage.from(bucket).remove([path]);
      if (storageError) {
        console.error('[photos DELETE] storage', storageError);
        // On continue : mieux vaut une ligne DB propre qu'un fichier orphelin bloquant.
      }
    }

    const { error: deleteError } = await supabase.from('photos').delete().eq('id', photoId);
    if (deleteError) {
      console.error('[photos DELETE]', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    // Si la photo supprimée était la couverture, promouvoir la suivante.
    if (photo.is_cover) {
      const { data: next } = await supabase
        .from('photos')
        .select('id')
        .eq('user_id', auth.user.id)
        .order('display_order', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (next) {
        await supabase.from('photos').update({ is_cover: true }).eq('id', next.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[photos DELETE]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
