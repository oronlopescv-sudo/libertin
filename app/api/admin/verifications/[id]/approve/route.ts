import { NextRequest, NextResponse } from 'next/server';
import { utilisateurAdmin } from '@/lib/auth-serveur';
import { approveVerification } from '@/lib/photo-verification';

/**
 * POST /api/admin/verifications/[id]/approve
 *
 * Approuve un selfie de vérification : passe verification_photos.status à
 * 'approved' et profiles.is_verified à true (badge vérifié). L'admin est
 * déduit de la session — c'est son id qui est inscrit dans reviewed_by.
 * Réservé aux administrateurs (gate serveur).
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await utilisateurAdmin();
  if (!auth.ok) return auth.reponse;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 });
  }

  const ok = await approveVerification(id, auth.user.id);
  if (!ok) {
    return NextResponse.json({ error: "Échec de l'approbation" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}