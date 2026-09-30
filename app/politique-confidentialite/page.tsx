import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Politique de Confidentialité — xlibertine',
  description:
    'Comment xlibertine collecte, utilise, conserve et protège vos données personnelles, et comment exercer vos droits.',
};

function Section({
  numero,
  titre,
  children,
}: {
  numero: number;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold text-white">
        {numero}. {titre}
      </h2>
      <div className="space-y-2 text-sm text-zinc-300 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <nav>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
          >
            &larr; Retour à l&apos;accueil
          </Link>
        </nav>

        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Politique de Confidentialité
          </h1>
          <p className="text-xs text-zinc-500">Dernière mise à jour : 30 septembre 2026</p>
          <p className="text-sm text-zinc-400">
            Cette politique décrit les données personnelles traitées par xlibertine.com, leur
            utilisation, leur conservation et l&apos;exercice de vos droits conformément au RGPD.
          </p>
        </header>

        <Section numero={1} titre="Responsable du traitement">
          <p>
            Le traitement est assuré par l&apos;éditeur du site xlibertine.com. Pour toute
            question relative à vos données :{' '}
            <a
              href="mailto:support@xlibertine.com"
              className="text-[#E86B7A] hover:underline font-medium"
            >
              support@xlibertine.com
            </a>
            .
          </p>
        </Section>

        <Section numero={2} titre="Données collectées">
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>
              <strong className="text-white">Compte :</strong> e-mail, pseudo, date de naissance,
              profil (genre, orientation), localisation déclarée ;
            </li>
            <li>
              <strong className="text-white">Photos :</strong> vos photos de profil, y compris le
              selfie de vérification transmis volontairement ;
            </li>
            <li>
              <strong className="text-white">Conversations :</strong> messages envoyés au sein des
              groupes et messageries privées ;
            </li>
            <li>
              <strong className="text-white">Modération :</strong> signalements reçus et émis,
              décisions administratives ;
            </li>
            <li>
              <strong className="text-white">Abonnement :</strong> statut et dates de validité de
              votre formule ; le paiement lui-même est traité par Stripe, qui ne nous transmet
              jamais vos données bancaires complètes ;
            </li>
            <li>
              <strong className="text-white">Technique :</strong> dates de connexion et
              d&apos;inscription, nécessaires à la sécurité du compte.
            </li>
          </ul>
        </Section>

        <Section numero={3} titre="Finalités et bases légales">
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Fonctionnement du service (profils, messagerie, groupes) — exécution du contrat ;</li>
            <li>
              Modération, prévention des faux profils et de la fraude — intérêt légitime et
              obligation légale de sécurité ;
            </li>
            <li>
              Gestion des abonnements et facturation — exécution du contrat et obligation légale
              comptable ;
            </li>
            <li>Notifications internes au service — exécution du contrat.</li>
          </ul>
          <p>Aucune donnée n&apos;est revendue ni exploitée à des fins publicitaires.</p>
        </Section>

        <Section numero={4} titre="Où sont hébergées vos données">
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>
              <strong className="text-white">Supabase</strong> — comptes, base de données et
              stockage des photos ;
            </li>
            <li>
              <strong className="text-white">Stripe</strong> — paiement et portail de facturation ;
            </li>
            <li>
              <strong className="text-white">Hébergement du site</strong> — l&apos;application
              web.
            </li>
          </ul>
          <p>
            Le selfie de vérification est uniquement visible par l&apos;équipe de modération, n&apos;est
            jamais affiché publiquement et est détruit après examen.
          </p>
        </Section>

        <Section numero={5} titre="Durée de conservation">
          <p>
            Les données de votre profil et vos conversations sont conservées tant que votre compte
            existe. Les photos de vérification sont détruites après examen. Les éléments de
            facturation sont conservés pendant les durées imposées par la loi comptable.
          </p>
          <p>
            La suppression de votre compte et de vos données peut être demandée à tout moment par
            e-mail à{' '}
            <a
              href="mailto:support@xlibertine.com"
              className="text-[#E86B7A] hover:underline font-medium"
            >
              support@xlibertine.com
            </a>
            .
          </p>
        </Section>

        <Section numero={6} titre="Vos droits (RGPD)">
          <p>
            Vous disposez des droits d&apos;accès, de rectification (modifiables directement sur
            votre profil), d&apos;effacement, d&apos;opposition et de portabilité. Écrivez à
            support@xlibertine.com pour les exercer ; vous pouvez aussi déposer une plainte auprès
            de la CNIL (cnil.fr).
          </p>
        </Section>

        <Section numero={7} titre="Cookies">
          <p>
            Le site n&apos;utilise que les cookies de session nécessaires à votre connexion (fournis
            par Supabase Auth). Aucun cookie publicitaire ni traceur tiers.
          </p>
        </Section>

        <Section numero={8} titre="Mineurs">
          <p>
            Le service est strictement réservé aux personnes majeures (18 ans et plus). Si vous
            pensez qu&apos;un compte appartient à un mineur, utilisez la fonction « Signaler » ou
            écrivez-nous : le compte sera supprimé sans délai.
          </p>
        </Section>

        <Section numero={9} titre="Liens utiles">
          <p>
            Voir également nos{' '}
            <Link href="/conditions-generales" className="text-[#E86B7A] hover:underline">
              Conditions Générales d&apos;Utilisation
            </Link>
            .
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}