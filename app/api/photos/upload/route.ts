import { NextRequest, NextResponse } from 'next/server';
import { utilisateurPremium } from '@/lib/auth-serveur';
import { comRetomada, clienteDeEscrita, mensagensDeErroUpload } from '@/lib/upload-fallback';
import { validateFileUpload } from '@/lib/validation';

/**
 * POST /api/photos/upload
 * Envoie une photo de profil/album vers Supabase Storage et l'enregistre dans
 * la table `photos`. Réservé aux membres Premium (vérifié côté serveur via la
 * session Supabase Auth, jamais via le corps de la requête).
 *
 * L'identité est vérifiée avec le client de session (clé anon + cookie).
 * L'écriture dans Storage et la table `photos` passe par la clé de service
 * tant qu'elle est exploitable, avec reprise par la session du membre sinon
 * (lib/upload-fallback.ts) : cela contourne aussi bien les politiques RLS du
 * bucket que les clés mortes/malformées — l'utilisateur voit « Échec de
 * l'envoi » sans cause apparente quand rien n'aboutit.
 * Le service role n'est utilisé qu'après authentification réussie.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await utilisateurPremium('envoyer des photos');
    if (!auth.ok) return auth.reponse;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const validation = validateFileUpload(file, 5, [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Client de service pour Storage + table photos ; si la clé est morte ou
    // malformée, comRetomada reproche l'opération avec la session du membre
    // (voir lib/upload-fallback.ts — cas « Invalid Compact JWS » en prod).

    const bucket = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `profiles/${auth.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await comRetomada<{ path: string }>((c) =>
      c.storage.from(bucket).upload(filename, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })
    );

    if (uploadError || !uploadData) {
      console.error('Photo upload error:', uploadError);
      return NextResponse.json(
        {
          error: "Échec de l'envoi de la photo",
          message: mensagensDeErroUpload(uploadError) ?? 'Erreur de stockage inconnue',
        },
        { status: 500 }
      );
    }

    const { cliente } = await clienteDeEscrita();
    const { data: urlData } = cliente.storage.from(bucket).getPublicUrl(uploadData.path);
    const url = urlData.publicUrl;

    // Première photo = photo de couverture.
    const { data: existentes } = await comRetomada<{ id: string }[]>((c) =>
      c.from('photos').select('id').eq('user_id', auth.user.id)
    );
    const isFirst = !existentes || existentes.length === 0;

    const { error: insertError } = await comRetomada((c) =>
      c.from('photos').insert({
        user_id: auth.user.id,
        url,
        is_cover: isFirst,
        display_order: existentes?.length ?? 0,
      })
    );

    if (insertError) {
      console.error('Photo insert error:', insertError);
      // L'insert a échoué : on supprime le fichier du Storage pour ne pas
      // laisser une photo « orpheline » invisible sur le profil.
      await comRetomada((c) => c.storage.from(bucket).remove([uploadData.path]));
      return NextResponse.json(
        {
          error: "Échec de l'enregistrement de la photo",
          message: mensagensDeErroUpload(insertError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}