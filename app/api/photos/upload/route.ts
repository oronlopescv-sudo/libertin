import { NextRequest, NextResponse } from 'next/server';
import { isPremium } from '@/lib/premium';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Busca user do token
    let userId: string;
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = tokenData.id;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Busca user para verificar subscrição
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscriptionTier, subscriptionEnd')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    // ✅ VALIDAÇÃO: Apenas PREMIUM pode fazer upload
    const userIsPremium = isPremium(user);

    if (!userIsPremium) {
      return NextResponse.json(
        { error: 'Apenas utilizadores Premium podem fazer upload de fotos. Faça upgrade!' },
        { status: 403 }
      );
    }

    // Resto da lógica de upload (implementar com Cloudinary, etc)
    // Por enquanto, retorna sucesso

    return NextResponse.json(
      { success: true, message: 'Upload com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
