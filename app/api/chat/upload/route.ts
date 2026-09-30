import { NextRequest, NextResponse } from 'next/server';
import { utilisateurPremium } from '@/lib/auth-serveur';
import { comRetomada, clienteDeEscrita, mensagensDeErroUpload } from '@/lib/upload-fallback';
import { validateFileUpload } from '@/lib/validation';

/**
 * POST /api/chat/upload
 * Envoie une image de tchat (groupe ou conversation privée) vers le bucket
 * Supabase Storage `chat-media` et renvoie son URL publique. Réservé aux
 * membres Premium (vérifié côté serveur via la session Supabase Auth, jamais
 * via le corps de la requête) — cohérent avec le gate Premium de l'envoi de
 * messages (/api/messages/[groupId]).
 *
 * Contrairement à /api/photos/upload, on n'insère rien dans la table
 * `photos` : la média de tchat vit dans `messages.media_url`, renseigné au
 * moment de l'envoi du message par /api/messages/[groupId].
 *
 * L'identité est vérifiée avec le client de session. L'écriture dans Storage
 * passe par la clé de service, avec reprise par la session du membre si la
 * clé est morte/malformée (lib/upload-fallback.ts) — avant ce refactor, une
 * clé de service indisponible faisait échouer silencieusement l'envoi.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await utilisateurPremium('envoyer des images dans le tchat');
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

    // L'identité est vérifiée avec le client de session. L'écriture dans
    // Storage passe par la clé de service tant qu'elle est exploitable, avec
    // reprise par la session du membre sinon (lib/upload-fallback.ts).

    const bucket = process.env.SUPABASE_CHAT_BUCKET || 'chat-media';
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `chat/${auth.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await comRetomada<{ path: string }>((c) =>
      c.storage.from(bucket).upload(filename, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })
    );

    if (uploadError || !uploadData) {
      console.error('Chat media upload error:', uploadError);
      return NextResponse.json(
        {
          error: "Échec de l'envoi de l'image",
          message: mensagensDeErroUpload(uploadError) ?? 'Erreur de stockage inconnue',
        },
        { status: 500 }
      );
    }

    const { cliente } = await clienteDeEscrita();
    const { data: urlData } = cliente.storage.from(bucket).getPublicUrl(uploadData.path);
    const url = urlData.publicUrl;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Chat upload error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}