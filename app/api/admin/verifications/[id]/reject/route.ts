import { NextRequest, NextResponse } from 'next/server';
import { utilisateurAdmin } from '@/lib/auth-serveur';
import { rejectVerification } from '@/lib/photo-verification';

/**
 * POST /api/admin/verifications/[id]/reject
 *
 * Rejette un selfie de vérification : passe status à 'rejected', inscrit le
 * motif (rejection_reason), supprime la photo du storage et notifie l'utilisateur
 * par email. L'admin vient de la session. Réservé aux administrateurs.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await utilisateurAdmin();
  if (!auth.ok) return auth.reponse;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 });
  }

  const { reason } = await req.json().catch(() => ({}));
  const motif = typeof reason === 'string' ? reason.trim() : '';
  if (!motif) {
    return NextResponse.json({ error: 'Le motif du rejet est requis' }, { status: 400 });
  }

  const ok = await rejectVerification(id, auth.user.id, motif);
  if (!ok) {
    return NextResponse.json({ error: 'Échec du rejet' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}