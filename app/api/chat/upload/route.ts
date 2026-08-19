import { NextRequest, NextResponse } from 'next/server';
import { utilisateurPremium } from '@/lib/auth-serveur';
import { createServerSupabaseClient } from '@/lib/supabase-server';
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
 * `photos` : la mídia de tchat vit dans `messages.media_url`, renseigné au
 * moment de l'envoi du message par /api/messages/[groupId].
 *
 * On utilise le client de session (clé anon + cookie de l'utilisateur) :
 * la politique du bucket `chat-media` autorise un membre authentifié à
 * écrire, et le gate Premium est appliqué ici avant l'appel Storage.
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

    const supabase = await createServerSupabaseClient();

    const bucket = process.env.SUPABASE_CHAT_BUCKET || 'chat-media';
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `chat/${auth.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('Chat media upload error:', uploadError);
      // Remonter le message réel de Supabase Storage : sans lui, une cause
      // concrète (bucket absent, clé invalide, type refusé) reste invisible.
      return NextResponse.json(
        {
          error: "Échec de l'envoi de l'image",
          message: uploadError?.message ?? 'Erreur de stockage inconnue',
        },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
    const url = urlData.publicUrl;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Chat upload error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}