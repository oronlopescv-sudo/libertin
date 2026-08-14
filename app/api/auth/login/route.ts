/**
 * ⚠️ Route héritée — NE PAS UTILISER pour de nouvelles fonctionnalités.
 *
 * Cette route vérifie le mot de passe contre la colonne `hashedPassword`
 * de la table `users` et renvoie un jeton maison. Le reste du site
 * s'authentifie via Supabase Auth (voir `signInWithSupabase` dans
 * lib/supabase.ts, utilisé par le contexte d'authentification).
 *
 * Les deux systèmes ne se connaissent pas : se connecter par ici réussit
 * côté serveur, mais le site continue de voir un visiteur non connecté.
 * Le formulaire de connexion utilise désormais le contexte.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha obligatoires' }, { status: 400 });
    }

    // Récupère user
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, hashedPassword')
      .eq('email', email)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Valida mot de passe
    const isValid = await bcrypt.compare(password, data.hashedPassword);
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Crée JWT
    const token = Buffer.from(JSON.stringify({ id: data.id, email: data.email })).toString('base64');

    // Response com cookie
    const response = NextResponse.json(
      { success: true, user: { id: data.id, email: data.email, username: data.username }, token },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
