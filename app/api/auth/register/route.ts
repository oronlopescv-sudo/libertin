import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password, username, dateOfBirth, gender, sexualOrientation, location } = await req.json();

    // Validação
    if (!email || !password || !username || !dateOfBirth) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter 8+ caracteres' }, { status: 400 });
    }

    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    if (age < 18) {
      return NextResponse.json({ error: 'Deve ter 18+ anos' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insere no Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          username,
          hashedPassword,
          dateOfBirth: new Date(dateOfBirth).toISOString(),
          gender,
          sexualOrientation,
          location,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ])
      .select('id, email, username')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Email já existe' }, { status: 400 });
    }

    // Cria JWT simples (em produção usar Supabase Auth)
    const token = Buffer.from(JSON.stringify({ id: data.id, email: data.email })).toString('base64');

    return NextResponse.json(
      { success: true, user: data, token },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
