import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Importar Resend apenas em runtime
let resend: any = null;
if (process.env.RESEND_API_KEY) {
  const { Resend } = require('resend');
  resend = new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email obligatoire' }, { status: 400 });
    }

    // Récupère user pelo email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Ne pas révéler si l'email existe (sécurité)
      return NextResponse.json(
        { success: true, message: 'Se o email existir, um link de réinitialisation será enviado' },
        { status: 200 }
      );
    }

    // Gera token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Guarda no Supabase
    const { error: insertError } = await supabase
      .from('mot de passe_réinitialisations')
      .insert([
        {
          userId: user.id,
          token: resetTokenHash,
          expiresAt: expiresAt.toISOString(),
          used: false,
        }
      ]);

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json({ error: 'Erreur lors de gerar token' }, { status: 500 });
    }

    // Envoie email com Resend (se configurado)
    if (resend) {
      const réinitialisationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://xlibertine.com'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      try {
        await resend.emails.send({
          from: 'noreply@xlibertine.com',
          to: email,
          subject: 'Réinitialiser sua password - xlibertine',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #D4145A 0%, #E86B7A 100%); padding: 30px; border-radius: 10px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">xlibertine</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">100% Libertin & Discret</p>
              </div>

              <div style="padding: 30px; background: #f8f8f8; border-radius: 10px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">Recuperar sua Mot de passe</h2>
                
                <p style="color: #555; line-height: 1.6;">
                  Olá <strong>${user.username}</strong>,
                </p>

                <p style="color: #555; line-height: 1.6;">
                  Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${réinitialisationUrl}" 
                     style="background: linear-gradient(135deg, #D4145A 0%, #E86B7A 100%); 
                            color: white; 
                            padding: 12px 40px; 
                            border-radius: 5px; 
                            text-decoration: none; 
                            font-weight: bold;
                            display: inline-block;">
                    Réinitialiser Mot de passe
                  </a>
                </div>

                <p style="color: #999; font-size: 12px;">
                  Este link expira em 1 heure por motivos de segurança.
                </p>

                <p style="color: #999; font-size: 12px;">
                  Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                </p>
              </div>

              <div style="padding: 20px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #ddd;">
                <p>© 2026 xlibertine. Tous os direitos reservados.</p>
                <p>Reservado para maiores de 18 ans.</p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Resend error:', emailError);
        // Non retornar erro, o token foi criado
      }
    } else {
      console.warn("Resend n'est pas configuré. L'email ne sera pas envoyé.");
      console.log('Token de réinitialisation:', resetToken);
      console.log('Reset URL: /reset-password?token=' + resetToken + '&email=' + email);
    }

    return NextResponse.json(
      { success: true, message: 'Se o email existir, um link de réinitialisation será enviado' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
