import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, email, newPassword } = await req.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: "Le jeton, l'email et le nouveau password sont obligatoires" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Senha deve ter 8+ caracteres' },
        { status: 400 }
      );
    }

    // Hash do token que recebemos (para comparar com o guardado)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Récupère o réinitialisation token
    const { data: réinitialisationRecord, error: réinitialisationError } = await supabase
      .from('password_resets')
      .select('userId, expiresAt, used')
      .eq('token', tokenHash)
      .single();

    if (réinitialisationError || !réinitialisationRecord) {
      return NextResponse.json(
        { error: 'Jeton invalide ou expiré' },
        { status: 400 }
      );
    }

    // Vérifie se já foi usado
    if (réinitialisationRecord.used) {
      return NextResponse.json(
        { error: 'Este link de réinitialisation já foi utilizado' },
        { status: 400 }
      );
    }

    // Vérifie se expirou
    if (new Date(réinitialisationRecord.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Link de réinitialisation expirou' },
        { status: 400 }
      );
    }

    // Hash a nova mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza password do user
    const { error: updateError } = await supabase
      .from('users')
      .update({ hashedPassword })
      .eq('id', réinitialisationRecord.userId)
      .eq('email', email);

    if (updateError) {
      return NextResponse.json({ error: 'Erreur lors de atualizar mot de passe' }, { status: 500 });
    }

    // Marca o token como usado
    const { error: markError } = await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('token', tokenHash);

    if (markError) {
      console.error('Mark error:', markError);
    }

    return NextResponse.json(
      { success: true, message: 'Mot de passe réinitialisationada avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
