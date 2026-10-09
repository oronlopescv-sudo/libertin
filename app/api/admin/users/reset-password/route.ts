import { NextRequest, NextResponse } from 'next/server';
import { utilisateurAdmin } from '@/lib/auth-serveur';
import { createServiceRoleClient } from '@/lib/supabase';
import crypto from 'crypto';

/**
 * POST /api/admin/users/reset-password
 * { userId?, email?, newPassword? }
 *
 * Repor a password de um membro SEM depender do envio de e-mail. O
 * «mot de passe oublié» público passa por um correio real (Supabase
 * native, 2/h — frequentemente esgotado — ou Resend quando a chave é
 * boa) ; quando nenhum caminho parte, fica um membro bloqueado sem
 * self-service. O admin fecha esse buraco : identifica o membro, define
 * (ou deixa gerar) uma senha temporária, e entrega-a por um canal
 * privado — a senha nunca passa por e-mail nem por logs.
 *
 * A senha gerada é devolvida SOMENTE nesta resposta, ao admin
 * autenticado sobre HTTPS. Nada é persistido, nada é logado.
 */
export async function POST(req: NextRequest) {
  const auth = await utilisateurAdmin();
  if (!auth.ok) return auth.reponse;

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const userIdBrut = typeof body.userId === 'string' ? body.userId.trim() : '';
    const novaSenha =
      typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

    if (!userIdBrut && !email) {
      return NextResponse.json({ error: "Indique userId ou email du membre." }, { status: 400 });
    }

    let gerada = false;
    let senha = novaSenha;
    if (senha) {
      if (senha.length < 8) {
        return NextResponse.json(
          { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
          { status: 400 }
        );
      }
    } else {
      // Temporária legível no telefone (sem l/1, S/5, 0/O confusos ao ditar).
      const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      senha = Array.from(
        { length: 14 },
        () => alfabeto[crypto.randomInt(alfabeto.length)]
      ).join('');
      gerada = true;
    }

    const supabase = createServiceRoleClient();

    // Resolve o destino : userId direto ou por email (profiles, minúsculas).
    let destino = userIdBrut;
    if (!destino) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      if (profileError || !profile) {
        return NextResponse.json({ error: 'Membre introuvable pour cet email.' }, { status: 404 });
      }
      destino = profile.id;
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(destino, {
      password: senha,
    });
    if (authError) {
      console.error('[admin/reset-password] auth update :', authError.message);
      return NextResponse.json(
        { error: 'Erreur lors de la modification de la connexion.' },
        { status: 500 }
      );
    }

    // Tokens pendentes deste membro deixam de valer : a repor pela via
    // admin, nenhum link de recuperação antigo pode reaproveitar.
    const { error: resetsError } = await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', destino);
    if (resetsError) {
      console.error('[admin/reset-password] limpeza de tokens :', resetsError.message);
    }

    // Trilho de auditoria (como ban/unban) — SEM a password, nada de
    // credenciais persistidas em log algum.
    await supabase.from('admin_logs').insert({
      admin_id: auth.user.id,
      action: 'RESET_PASSWORD',
      target_id: destino,
      reason: gerada ? 'senha temporária gerada' : 'senha definida pelo admin',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      gerada,
      ...(gerada ? { password: senha } : {}),
      message: gerada
        ? 'Password reposta. Envia esta senha temporária ao membro por um canal privado (ela não sai por email).'
        : 'Password reposta.',
    });
  } catch (error) {
    console.error('[admin/reset-password] erro :', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la réinitialisation.' },
      { status: 500 }
    );
  }
}