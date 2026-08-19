import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import crypto from 'crypto';

// Resend n'est chargé qu'en runtime si la clé est présente
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

    // Clé de service : lecture du profil + écriture du jeton (pas de session).
    const supabase = createServiceRoleClient();

    // Récupère le profil par email (table `profiles`, snake_case)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, username')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      // Ne pas révéler si l'email existe (sécurité)
      return NextResponse.json(
        { success: true, message: "Si l'email existe, un lien de réinitialisation sera envoyé" },
        { status: 200 }
      );
    }

    // Génère un jeton de réinitialisation (on stocke son hash SHA-256)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    const { error: insertError } = await supabase.from('password_resets').insert({
      user_id: profile.id,
      token: resetTokenHash,
      expires_at: expiresAt.toISOString(),
      used: false,
    });

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json({ error: 'Erreur lors de la création du jeton' }, { status: 500 });
    }

    // Envoie l'email via Resend (si configuré)
    if (resend) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://xlibertine.com'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      try {
        await resend.emails.send({
          from: 'noreply@xlibertine.com',
          to: email,
          subject: 'Réinitialiser votre mot de passe - xlibertine',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #D4145A 0%, #E86B7A 100%); padding: 30px; border-radius: 10px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">xlibertine</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">100% Libertin & Discret</p>
              </div>

              <div style="padding: 30px; background: #f8f8f8; border-radius: 10px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">Réinitialiser votre mot de passe</h2>

                <p style="color: #555; line-height: 1.6;">
                  Bonjour <strong>${profile.username}</strong>,
                </p>

                <p style="color: #555; line-height: 1.6;">
                  Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}"
                     style="background: linear-gradient(135deg, #D4145A 0%, #E86B7A 100%);
                            color: white;
                            padding: 12px 40px;
                            border-radius: 5px;
                            text-decoration: none;
                            font-weight: bold;
                            display: inline-block;">
                    Réinitialiser le mot de passe
                  </a>
                </div>

                <p style="color: #999; font-size: 12px;">
                  Ce lien expire dans 1 heure pour des raisons de sécurité.
                </p>

                <p style="color: #999; font-size: 12px;">
                  Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                </p>
              </div>

              <div style="padding: 20px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #ddd;">
                <p>© 2026 xlibertine. Tous droits réservés.</p>
                <p>Réservé aux personnes de plus de 18 ans.</p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Resend error:', emailError);
        // Ne pas échouer : le jeton a été créé
      }
    } else {
      console.warn("Resend n'est pas configuré. L'email ne sera pas envoyé.");
      console.log('Reset URL: /reset-password?token=' + resetToken + '&email=' + email);
    }

    return NextResponse.json(
      { success: true, message: "Si l'email existe, un lien de réinitialisation sera envoyé" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}