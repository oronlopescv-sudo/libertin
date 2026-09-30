import { NextRequest, NextResponse } from 'next/server';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { comRetomada } from '@/lib/upload-fallback';
import { apiError, apiSuccess } from '@/lib/api-response';

/**
 * GET /api/photos — liste les photos du membre connecté.
 * DELETE /api/photos?id=... — supprime une de ses photos (fichier + ligne).
 *
 * L'identité est vérifiée via la session Supabase Auth. Les opérations sur
 * Storage et la table `photos` passent par comRetomada (lib/upload-fallback.ts)
 * : clé de service tant qu'elle est exploitable, reprise par la session du
 * membre sinon — plutôt que d'échouer silencieusement quand seule la clé de
 * service est cassée.
 */

export async function GET() {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const { data: photos, error } = await comRetomada<
      { id: string; url: string; is_cover: boolean; display_order: number; uploaded_at: string }[]
    >((c) =>
      c
        .from('photos')
        .select('id, url, is_cover, display_order, uploaded_at')
        .eq('user_id', auth.user.id)
        .order('display_order', { ascending: true })
    );

    if (error) {
      console.error('[photos GET]', error);
      return apiError('Erreur lors de la récupération des photos', 500);
    }

    return apiSuccess({ photos: photos ?? [] });
  } catch (error) {
    console.error('[photos GET]', error);
    return apiError('Erreur interne', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const photoId = req.nextUrl.searchParams.get('id');
    if (!photoId) {
      return apiError("L'identifiant de la photo est requis", 400);
    }

    // Vérifie que la photo appartient bien à la personne qui la supprime.
    const { data: photo } = await comRetomada<{
      id: string;
      url: string;
      user_id: string;
      is_cover: boolean;
    }>((c) =>
      c
        .from('photos')
        .select('id, url, user_id, is_cover')
        .eq('id', photoId)
        .single()
    );

    if (!photo) {
      return apiError('Photo introuvable', 404);
    }
    if (photo.user_id !== auth.user.id) {
      return apiError('Vous ne possédez pas cette photo', 403);
    }

    // Retrouve le chemin dans le bucket à partir de l'URL publique pour
    // pouvoir supprimer le fichier, pas seulement la ligne en base.
    const bucket = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = photo.url.indexOf(marker);
    if (idx !== -1) {
      const path = photo.url.slice(idx + marker.length);
      const { error: storageError } = await comRetomada((c) =>
        c.storage.from(bucket).remove([path])
      );
      if (storageError) {
        console.error('[photos DELETE] storage', storageError);
        // On continue : mieux vaut une ligne DB propre qu'un fichier orphelin bloquant.
      }
    }

    const { error: deleteError } = await comRetomada((c) =>
      c.from('photos').delete().eq('id', photoId)
    );
    if (deleteError) {
      console.error('[photos DELETE]', deleteError);
      return apiError('Erreur lors de la suppression', 500);
    }

    // Si la photo supprimée était la couverture, promouvoir la suivante.
    if (photo.is_cover) {
      const { data: next } = await comRetomada<{ id: string }>((c) =>
        c
          .from('photos')
          .select('id')
          .eq('user_id', auth.user.id)
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle()
      );
      if (next) {
        await comRetomada((c) => c.from('photos').update({ is_cover: true }).eq('id', next.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[photos DELETE]', error);
    return apiError('Erreur interne', 500);
  }
}