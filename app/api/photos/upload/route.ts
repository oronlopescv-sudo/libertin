import { NextRequest, NextResponse } from 'next/server';
import { utilisateurPremium } from '@/lib/auth-serveur';
import { createServiceRoleClient } from '@/lib/supabase';
import { validateFileUpload } from '@/lib/validation';

/**
 * POST /api/photos/upload
 * Envoie une photo de profil/album vers Supabase Storage et l'enregistre dans
 * la table `photos`. Réservé aux membres Premium (vérifié côté serveur via la
 * session Supabase Auth, jamais via le corps de la requête).
 *
 * L'écriture se fait avec la clé de service (contourne le RLS) car
 * l'utilisateur est déjà authentifié + Premium ; les politiques de storage
 * ne sont pas configurées pour l'insertion anonyme.
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

    const supabase = createServiceRoleClient();
    const bucket = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `profiles/${auth.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('Photo upload error:', uploadError);
      return NextResponse.json(
        { error: "Échec de l'envoi de la photo" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
    const url = urlData.publicUrl;

    // Première photo = photo de couverture.
    const { data: existing } = await supabase
      .from('photos')
      .select('id')
      .eq('user_id', auth.user.id);
    const isFirst = !existing || existing.length === 0;

    const { error: insertError } = await supabase.from('photos').insert({
      user_id: auth.user.id,
      url,
      is_cover: isFirst,
      display_order: existing?.length ?? 0,
    });

    if (insertError) {
      console.error('Photo insert error:', insertError);
      // Le fichier est stocké même si l'insert échoue ; on renvoie l'URL.
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}