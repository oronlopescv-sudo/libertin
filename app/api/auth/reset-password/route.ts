import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, email, newPassword } = await req.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: "Le jeton, l'email et le nouveau mot de passe sont obligatoires" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Hash du jeton reçu (comparé au hash stocké)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Clé de service : la table password_resets est fermée au public (RLS).
    const supabase = createServiceRoleClient();

    // Récupère le jeton (snake_case)
    const { data: resetRecord, error: resetError } = await supabase
      .from('password_resets')
      .select('id, user_id, expires_at, used')
      .eq('token', tokenHash)
      .single();

    if (resetError || !resetRecord) {
      return NextResponse.json({ error: 'Jeton invalide ou expiré' }, { status: 400 });
    }

    if (resetRecord.used) {
      return NextResponse.json(
        { error: 'Ce lien de réinitialisation a déjà été utilisé' },
        { status: 400 }
      );
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Le lien de réinitialisation a expiré' },
        { status: 400 }
      );
    }

    // Vérifie que le profil correspond bien à l'email indiqué (cohérence)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', resetRecord.user_id)
      .single();

    if (profileError || !profile || profile.email !== email) {
      return NextResponse.json({ error: 'Jeton invalide ou expiré' }, { status: 400 });
    }

    // Change le mot de passe dans Supabase Auth (la vraie source de connexion).
    // L'ancien code écrivait bcrypt dans users.hashedPassword, table que la
    // connexion (Supabase Auth) ne lit jamais : le reset était sans effet.
    const { error: authError } = await supabase.auth.admin.updateUserById(
      resetRecord.user_id,
      { password: newPassword }
    );

    if (authError) {
      console.error('Auth update error:', authError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du mot de passe' },
        { status: 500 }
      );
    }

    // Marque le jeton comme utilisé de façon atomique : la mise à jour ne
    // s'applique que s'il est encore inutilisé, ce qui empêche un double reset
    // concurrent avec le même lien.
    const { data: marked, error: markError } = await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', resetRecord.id)
      .eq('used', false)
      .select('id');

    if (markError) {
      console.error('Mark error:', markError);
    }

    // Si aucune ligne n'a été modifiée, un autre usage concurrent a gagné.
    if (!markError && (!marked || marked.length === 0)) {
      return NextResponse.json(
        { error: 'Ce lien de réinitialisation a déjà été utilisé' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Mot de passe réinitialisé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}