import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import crypto from 'crypto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase-env';
import { createClient } from '@supabase/supabase-js';

// Resend n'est chargé qu'en runtime si la clé est présente
let resend: any = null;
if (process.env.RESEND_API_KEY) {
  const { Resend } = require('resend');
  resend = new Resend(process.env.RESEND_API_KEY);
}

/**
 * POST /api/auth/forgot-password
 *
 * Deux voies, testées dans l'ordre :
 *
 * 1. VOIE NATIVE (principale) — `resetPasswordForEmail` n'a besoin QUE de la
 *    clé anon : c'est Supabase Auth qui envoie l'e-mail de récupération, et
 *    le lien ramène le membre sur /reset-password avec une session de
 *    récupération (la nouvelle clé est fixée via updateUser côté client,
 *    sans clé de service). Résilient : fonctionne même si la clé de service
 *    est morte, comme c'a été le cas en production en septembre 2026.
 *    Supabase répond un succès même pour un e-mail inconnu : pas
 *    d'énumération d'adresses.
 *
 * 2. VOIE CUSTOM (repli) — jeton maison hashé dans `password_resets` + e-mail
 *    via Resend + changement via updateUserById (clé de service requise).
 *    Conservée car elle ne dépend pas de la liste « Redirect URLs » du
 *    tableau de bord Supabase.
 *
 * La réponse reste identique dans les deux voies : un succès neutre, jamais
 * d'information sur l'existence d'un compte.
 */
// Limiteur de débit : marque la demande et dit si le quota est atteint.
// Fenêtre glissante par clé (IP + e-mail en minuscules), 3 par 15 min.
const JANELA_MS = 15 * 60 * 1000;
const MAX_POR_JANELA = 3;

function limiteUltrapassado(chave: string): boolean {
  const g = globalThis as unknown as {
    __esquecerPasseMarcas?: Map<string, number[]>;
  };
  const marcas: Map<string, number[]> =
    g.__esquecerPasseMarcas ?? (g.__esquecerPasseMarcas = new Map<string, number[]>());
  const agora = Date.now();
  const vivas = (marcas.get(chave) ?? []).filter((t) => agora - t < JANELA_MS);
  if (vivas.length >= MAX_POR_JANELA) {
    return true;
  }
  vivas.push(agora);
  marcas.set(chave, vivas);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { email: emailBrut } = await req.json();

    if (!emailBrut || typeof emailBrut !== 'string') {
      return NextResponse.json({ error: 'Email obligatoire' }, { status: 400 });
    }
    const email = emailBrut.trim();

    // Limiteur de débit en mémoire (une seule instance Passenger) : 3
    // demandes par e-mail + IP toutes les 15 minutes. Sans lui, la voie
    // custom permet le bombing de courriels dès qu'une clé Resend vit
    // ici, et la différence de statut 200/503 rendrait l'énumération
    // d'adresses gratuite. Réponse identique quels que soient existence
    // et quota : aucun indice.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnue';
    const chave = `${ip}|${email.toLowerCase()}`;
    if (limiteUltrapassado(chave)) {
      return NextResponse.json(
        { error: "Trop de demandes : attendez quelques minutes avant de redemander." },
        { status: 429 }
      );
    }

    // ─── Voie 1 : e-mail de récupération natif de Supabase ───
    const urlBase = process.env.NEXT_PUBLIC_APP_URL || 'https://xlibertine.com';
    const redirection = `${urlBase}/reset-password`;

    let nativeOk = false;
    try {
      const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { error } = await anon.auth.resetPasswordForEmail(email, {
        redirectTo: redirection,
      });
      nativeOk = !error;
      if (error) {
        console.warn('[forgot-password] voie native indisponible :', error.message);
      }
    } catch (e: any) {
      nativeOk = false;
      console.warn('[forgot-password] voie native exception :', e?.message);
    }

    if (nativeOk) {
      return NextResponse.json(
        { success: true, message: "Si l'email existe, un lien de réinitialisation sera envoyé" },
        { status: 200 }
      );
    }

    // ─── Voie 2 : jeton maison (clé de service + Resend) ───
    const supabase = createServiceRoleClient();

    // Récupère le profil par email (table `profiles`, snake_case). Les
    // e-mails auth Supabase sont en minuscules : on normalise la demande
    // pour ne pas manquer les profils à cause de la casse tapée.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, username')
      .eq('email', email.toLowerCase())
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

    // Envoie l'email via Resend (si configuré). On suit le résultat : la
    // réponse ne peut PAS prétendre un succès (« Email envoyé ! ») quand
    // aucun courrier n'est parti — le membre resterait bloqué sans le
    // savoir (c'est arrivé en production avec une clé Resend morte).
    let emailEnviado = false;

    if (resend) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://xlibertine.com'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      try {
        const resultado = await resend.emails.send({
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
        const erroResend = (resultado as any)?.error;
        if (erroResend) {
          console.error('[forgot-password] Resend devolveu erro :', erroResend.message ?? erroResend);
        } else if (resultado?.data?.id) {
          emailEnviado = true;
        }
      } catch (emailError: any) {
        console.error('[forgot-password] erro do envio Resend :', emailError?.message ?? emailError);
      }
    } else {
      console.warn("Resend n'est pas configuré. L'email ne sera pas envoyé.");
    }

    // Le profil existe et une demande a été enregistrée : si AUCUN courrier
    // n'a pu partir (clé Resend absente/morte), on le dit au lieu de
    // mentir avec « Email envoyé ! ». Message générique : aucun indice
    // sur le compte n'est révélé.
    if (!emailEnviado) {
      return NextResponse.json(
        { error: "Le service d'envoi d'e-mails est momentanément indisponible. Réessayez dans quelques minutes." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Si l'email existe, un lien de réinitialisation sera envoyé" },
      { status: 200 }
    );
  } catch (error: any) {
    // La voie native n'exige rien d'exotique ; les vraies erreurs viennent
    // de la voie custom (clé de service). On reste neutre côté client.
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}