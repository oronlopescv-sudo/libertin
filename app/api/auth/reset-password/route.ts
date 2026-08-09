import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, email, newPassword } = await req.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: 'Token, email e nova password são obrigatórios' },
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

    // Busca o reset token
    const { data: resetRecord, error: resetError } = await supabase
      .from('password_resets')
      .select('userId, expiresAt, used')
      .eq('token', tokenHash)
      .single();

    if (resetError || !resetRecord) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verifica se já foi usado
    if (resetRecord.used) {
      return NextResponse.json(
        { error: 'Este link de reset já foi utilizado' },
        { status: 400 }
      );
    }

    // Verifica se expirou
    if (new Date(resetRecord.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Link de reset expirou' },
        { status: 400 }
      );
    }

    // Hash a nova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza password do user
    const { error: updateError } = await supabase
      .from('users')
      .update({ hashedPassword })
      .eq('id', resetRecord.userId)
      .eq('email', email);

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar password' }, { status: 500 });
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
      { success: true, message: 'Password resetada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
