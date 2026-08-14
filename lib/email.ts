/**
 * Email Service using Resend
 * Send transactional emails for:
 * - Welcome emails
 * - Mot de passe réinitialisations
 * - Abonnement confirmations
 * - Verification approvals
 * - Group invitations
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@xlibertine.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://xlibertine.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via Resend
 */
async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text: text || stripHtml(html),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    const result = await response.json();
    console.log(`✉️ Email sent: ${result.id} to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Welcome email for new users
 */
export async function sendWelcomeEmail(
  email: string,
  username: string,
  verificationToken: string
): Promise<boolean> {
  const verifyUrl = `${APP_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4145A, #E86B7A); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px 0; }
          .button { display: inline-block; background: #D4145A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue sur xlibertine 🔥</h1>
          </div>
          
          <div class="content">
            <p>Bonjour ${username},</p>
            <p>Merci d'avoir créé votre compte sur xlibertine!</p>
            <p>Pour accéder complètement à votre profil, veuillez vérifier votre email en cliquant sur le bouton ci-dessous:</p>
            <a href="${verifyUrl}" class="button">Vérifier mon email</a>
            <p>Après vérification, vous pourrez:</p>
            <ul>
              <li>Découvrir des profils vérifiés dans votre région</li>
              <li>Envoyer des messages privés</li>
              <li>Rejoindre des groupes de soirées privées</li>
              <li>Organiser des rencontres discrètes</li>
            </ul>
            <p>Si vous n'avez pas créé ce compte, veuillez ignorer cet email.</p>
          </div>
          
          <div class="footer">
            <p>© 2026 xlibertine — Tous droits réservés.</p>
            <p>Réseau Libertin Francophone 100% Discret</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Bienvenue sur xlibertine - Vérifiez votre email',
    html,
  });
}

/**
 * Mot de passe réinitialisation email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const réinitialisationUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #12091A; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .alert { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #D4145A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réinitialiser votre mot de passe</h1>
          </div>
          
          <div class="alert">
            <strong>⚠️ Important:</strong> Ce lien expire dans 24 heures.
          </div>
          
          <p>Vous avez demandé la réinitialisation de votre password xlibertine.</p>
          <p>Cliquez sur le bouton ci-dessous pour créer un nouveau password:</p>
          <a href="${réinitialisationUrl}" class="button">Réinitialiser mon mot de passe</a>
          
          <p><strong>Si vous n'avez pas demandé cette action:</strong></p>
          <p>Ignorez cet email. Votre compte reste sécurisé. Si vous continuez à avoir des problèmes, contactez le support.</p>
          
          <div class="footer">
            <p>© 2026 xlibertine — Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Réinitialiser votre password xlibertine',
    html,
  });
}

/**
 * Abonnement confirmation email
 */
export async function sendAbonnementConfirmationEmail(
  email: string,
  username: string,
  planId: string,
  subscriptionEnd: Date
): Promise<boolean> {
  const planNames: Record<string, string> = {
    PREMIUM_3M: 'Pass Épicurien 3 Mois',
    PREMIUM_12M: 'Pass Privilège 12 Mois',
    PREMIUM_24M: 'Pass VIP Elite 24 Mois',
  };

  const planName = planNames[planId] || planId;
  const endDate = subscriptionEnd.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4145A, #E86B7A); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .success { background: #D4EDDA; border-left: 4px solid #28A745; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .plan-details { background: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #D4145A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue dans l'élite</h1>
          </div>
          
          <div class="success">
            <strong>✓ Abonnement confirmé!</strong> Votre paiement a été traité avec succès.
          </div>
          
          <p>Bonjour ${username},</p>
          
          <div class="plan-details">
            <h3>Détails de votre subscription:</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Valide jusqu'au:</strong> ${endDate}</p>
            <p><strong>Statut:</strong> ✅ Actif</p>
          </div>
          
          <p>Vous avez maintenant accès à:</p>
          <ul>
            <li>✓ Profils 100% vérifiés</li>
            <li>✓ Messagerie illimitée</li>
            <li>✓ Albums photos privés</li>
            <li>✓ Groupes de soirées privées</li>
            <li>✓ Mode fantôme (visites invisibles)</li>
          </ul>
          
          <a href="${APP_URL}/decouvrir" class="button">Découvrir les profils</a>
          
          <p>Des questions? Contactez notre équipe à <strong>support@xlibertine.com</strong></p>
          
          <div class="footer">
            <p>© 2026 xlibertine — Tous droits réservés.</p>
            <p>Réseau Libertin Francophone 100% Discret</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `✓ Abonnement ${planName} confirmé`,
    html,
  });
}

/**
 * Photo verification approval email
 */
export async function sendPhotoApprovedEmail(
  email: string,
  username: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28A745; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .success { background: #D4EDDA; border-left: 4px solid #28A745; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #28A745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Vérification approuvée</h1>
          </div>
          
          <div class="success">
            <strong>Félicitations!</strong> Votre profil a été vérifié par notre équipe.
          </div>
          
          <p>Bonjour ${username},</p>
          <p>Votre photo de vérification a été approuvée. Votre badge "Profil Vérifié" est maintenant visible sur xlibertine.</p>
          <p>Cela augmente considérablement votre crédibilité auprès des autres membres et vous aide à trouver les rencontres que vous recherchez!</p>
          
          <a href="${APP_URL}/decouvrir" class="button">Découvrir d'autres profils vérifiés</a>
          
          <div class="footer">
            <p>© 2026 xlibertine — Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '✓ Votre profil a été vérifié',
    html,
  });
}

/**
 * Photo verification rejection email
 */
export async function sendPhotoRejectedEmail(
  email: string,
  username: string,
  reason: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FFC107; color: #333; padding: 20px; border-radius: 8px; text-align: center; }
          .alert { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #D4145A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Photo de vérification rejetée</h1>
          </div>
          
          <div class="alert">
            Votre photo n'a pas pu être approuvée pour la raison suivante:
          </div>
          
          <p>Bonjour ${username},</p>
          <p><strong>Raison:</strong> ${reason}</p>
          <p>Veuillez soumettre une nouvelle photo respectant les critères suivants:</p>
          <ul>
            <li>Photo claire et bien éclairée</li>
            <li>Tenez un papier avec "xlibertine" + la date actuelle</li>
            <li>Photo prise dans les 48 dernières heures</li>
            <li>Pas de filtres ou de retouche</li>
          </ul>
          
          <a href="${APP_URL}/profil" class="button">Soumettre une nouvelle photo</a>
          
          <p>Questions? Contactez support@xlibertine.com</p>
          
          <div class="footer">
            <p>© 2026 xlibertine — Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Votre photo de vérification n\'a pas pu être approuvée',
    html,
  });
}

/**
 * Group invitation email
 */
export async function sendGroupInvitationEmail(
  email: string,
  username: string,
  groupName: string,
  inviterName: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4145A, #E86B7A); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .invitation { background: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #D4145A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Vous êtes invité!</h1>
          </div>
          
          <div class="invitation">
            <p><strong>${inviterName}</strong> vous invite à rejoindre:</p>
            <h2 style="color: #D4145A;">${groupName}</h2>
            <p>Découvrez une communauté de membres vérifiés et organisez vos prochaines rencontres!</p>
          </div>
          
          <a href="${APP_URL}/groupes" class="button">Voir l'invitation</a>
          
          <div class="footer">
            <p>© 2026 xlibertine — Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Invitation: ${groupName}`,
    html,
  });
}
