import { NextResponse } from 'next/server';
import { utilisateurAdmin } from '@/lib/auth-serveur';
import {
  getPendingVerifications,
  getVerificationStats,
} from '@/lib/photo-verification';

/**
 * GET /api/admin/verifications
 *
 * File d'attente des selfies de vérification + statistiques. Réservé aux
 * administrateurs (gate côté serveur via utilisateurAdmin). L'identité de
 * l'admin vient de la session, jamais du client.
 *
 * Avant, le composant client importait directement lib/photo-verification.ts
 * (qui construit un client Supabase service-role au chargement du module) :
 * fuite de logique privilégiée côté navigateur + aucune vérification admin.
 * Désormais tout passe par cette route serveur.
 */
export async function GET() {
  const auth = await utilisateurAdmin();
  if (!auth.ok) return auth.reponse;

  const [photos, stats] = await Promise.all([
    getPendingVerifications(50, 0),
    getVerificationStats(),
  ]);

  // Calcul de l'âge à partir de date_of_birth (profiles n'a pas de colonne
  // `age`) + mise à plat du profil joint pour le composant client.
  const computeAge = (dob: string | null | undefined): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const mapped = (photos ?? []).map((p: any) => ({
    id: p.id,
    url: p.url,
    status: p.status,
    created_at: p.created_at,
    user: {
      username: p.profiles?.username ?? '—',
      email: p.profiles?.email ?? '—',
      age: computeAge(p.profiles?.date_of_birth),
      gender: p.profiles?.gender ?? null,
      location: p.profiles?.location ?? null,
    },
  }));

  return NextResponse.json({ photos: mapped, stats }, { status: 200 });
}