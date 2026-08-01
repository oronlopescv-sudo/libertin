import nodemailer from 'nodemailer'

/**
 * Envio de email por SMTP.
 *
 * Configuração (variáveis de ambiente):
 *   SMTP_HOST      ex: smtp.hostinger.com
 *   SMTP_PORT      465 (SSL) ou 587 (TLS)
 *   SMTP_USER      ex: contact@rencontres-premium.fr
 *   SMTP_PASSWORD  password da conta de email
 *   SMTP_FROM      remetente (opcional, usa SMTP_USER se vazio)
 *
 * Se não estiver configurado, nada rebenta: as funções devolvem
 * { sent: false } e o motivo fica registado nos logs do servidor.
 */

export function isMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  )
}

function getTransport() {
  const port = Number(process.env.SMTP_PORT ?? 465)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

type SendResult = { sent: boolean; reason?: string }

export async function sendMail(options: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<SendResult> {
  if (!isMailConfigured()) {
      '[MAIL] SMTP não configurado — email não enviado para',
      options.to,
      '| define SMTP_HOST, SMTP_USER e SMTP_PASSWORD'
    )
    return { sent: false, reason: 'smtp_not_configured' }
  }

  try {
    await getTransport().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    return { sent: true }
  } catch (error) {
    throw error
      '[MAIL] Falha ao enviar email:',
      error instanceof Error ? error.message : error
    )
    return { sent: false, reason: 'send_failed' }
  }
}

function layout(title: string, body: string, cta?: { url: string; label: string }) {
  return `<!doctype html>
<html lang="fr"><body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
    <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a;">${title}</h1>
    <div style="font-size:15px;line-height:1.6;color:#334155;">${body}</div>
    ${
      cta
        ? `<p style="margin:28px 0;"><a href="${cta.url}" style="display:inline-block;background:#be185d;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;">${cta.label}</a></p>
           <p style="font-size:12px;color:#94a3b8;word-break:break-all;">Si le bouton ne fonctionne pas, copiez ce lien&nbsp;:<br>${cta.url}</p>`
        : ''
    }
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;">
    <p style="font-size:12px;color:#94a3b8;margin:0;">RencontresPremium — vous recevez cet email car une action a été demandée avec votre adresse.</p>
  </div>
</body></html>`
}

/** Email de reposição de password. */
export function passwordResetEmail(resetUrl: string): void {
  return {
    subject: 'Réinitialisation de votre mot de passe',
    text: `Vous avez demandé la réinitialisation de votre mot de passe.\n\nOuvrez ce lien (valable 1 heure) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    html: layout(
      'Réinitialisation de votre mot de passe',
      `<p>Vous avez demandé la réinitialisation de votre mot de passe. Ce lien est valable <strong>1 heure</strong>.</p>
       <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email — votre mot de passe reste inchangé.</p>`,
      { url: resetUrl, label: 'Choisir un nouveau mot de passe' }
    ),
  }
}

/** Email de boas-vindas após o registo. */
export function welcomeEmail(username: string, loginUrl: string): void {
  return {
    subject: 'Bienvenue sur RencontresPremium',
    text: `Bonjour ${username},\n\nVotre compte est actif. Connectez-vous ici :\n${loginUrl}`,
    html: layout(
      `Bienvenue, ${username}`,
      `<p>Votre compte est actif. Complétez votre profil et ajoutez une photo pour multiplier vos chances d'être contacté.</p>`,
      { url: loginUrl, label: 'Accéder à mon compte' }
    ),
  }
}
