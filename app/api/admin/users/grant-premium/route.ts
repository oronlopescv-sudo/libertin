import { NextRequest, NextResponse } from 'next/server';
import { utilisateurAdmin } from '@/lib/auth-serveur';
import { createServiceRoleClient } from '@/lib/supabase';
import { sendAbonnementConfirmationEmail } from '@/lib/email';

/**
 * POST /api/admin/users/grant-premium
 *
 * Permet à un administrateur d'offrir un abonnement Premium sur le compte d'un
 * autre utilisateur, sans passer par Stripe. Écrit dans `profiles` (snake_case)
 * — la source unique de vérité lue par lib/auth-serveur.ts et lib/premium.ts.
 *
 * Corps : { userId: string, plan: 'PASS_EPICURIEN' | 'PASS_PRIVILEGE' | 'PASS_VIP', months?: number }
 *
 * `plan` est le pacquet mensuel attribué. `months` est la durée de la cortesie
 * (en mois) ; par défaut 1. L'activation est immédiate : isPremium() renverra
 * true dès le prochain appel pour cet utilisateur.
 */
const VALID_PLANS = new Set(['PASS_EPICURIEN', 'PASS_PRIVILEGE', 'PASS_VIP']);

export async function POST(req: NextRequest) {
  try {
    const auth = await utilisateurAdmin();
    if (!auth.ok) return auth.reponse;

    const body = await req.json().catch(() => ({}));
    const userId = typeof body.userId === 'string' ? body.userId : '';
    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });
    }

    // Pacquet mensuel valide ? Sinon, défaut Pass Privilège.
    const planId =
      typeof body.plan === 'string' && VALID_PLANS.has(body.plan)
        ? body.plan
        : 'PASS_PRIVILEGE';

    // Durée de la cortesie en mois (défaut 1, min 1).
    const parsedMonths = Number(body.months);
    const months = Number.isFinite(parsedMonths) && parsedMonths >= 1
      ? Math.floor(parsedMonths)
      : 1;

    const supabase = createServiceRoleClient();

    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + months);

    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: planId,
        subscription_start: now.toISOString(),
        subscription_end: end.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', userId)
      .select('email, username')
      .single();

    if (error) {
      console.error('[grant-premium] update error:', error);
      return NextResponse.json(
        { error: 'Erro ao ativar premium', detail: error.message },
        { status: 500 }
      );
    }

    // Journalisation de l'action admin (non bloquant).
    try {
      await supabase.from('admin_logs').insert({
        admin_id: auth.user.id,
        action: 'GRANT_PREMIUM',
        target_id: userId,
        reason: `${planId} (${months} meses) — atribuído pelo admin ${auth.user.email ?? ''}`,
        created_at: now.toISOString(),
      });
    } catch (logErr) {
      console.error('[grant-premium] log insert failed:', logErr);
    }

    // Email de confirmation au bénéficiaire (non bloquant : Resend peut être
    // en cours de vérification de domaine).
    if (updated?.email) {
      try {
        await sendAbonnementConfirmationEmail(
          updated.email,
          updated.username ?? '',
          planId,
          end
        );
      } catch (emailErr) {
        console.error('[grant-premium] email failed:', emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        plan: planId,
        months,
        subscriptionEnd: end.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[grant-premium] error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}