import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export const metadata = {
  title: "Conditions Générales d'Utilisation — xlibertine",
  description:
    "Les règles d'utilisation de la plateforme xlibertine : accès, comptes, abonnements, modération et responsabilité.",
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

export default function ConditionsGeneralesPage() {
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
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-xs text-zinc-500">Dernière mise à jour : 30 septembre 2026</p>
          <p className="text-sm text-zinc-400">
            Les présentes conditions régissent l&apos;utilisation du site xlibertine.com. En créant
            un compte ou en naviguant sur le site, vous les acceptez sans réserve.
          </p>
        </header>

        <Section numero={1} titre="Objet du service">
          <p>
            xlibertine est une plateforme de rencontres libertines, échangistes et épicuriennes :
            elle permet à ses membres de créer un profil, découvrir d&apos;autres profils,
            s&apos;exprimer au sein de groupes privés, échanger en messagerie et publier des
            annonces de rencontres ou d&apos;événements.
          </p>
        </Section>

        <Section numero={2} titre="Accès au service et compte">
          <p>
            L&apos;inscription et l&apos;utilisation du service sont strictement réservées aux
            personnes majeures (18 ans et plus). La date de naissance est contrôlée à
            l&apos;inscription : tout compte de mineur sera supprimé sans délai.
          </p>
          <p>
            Les informations de votre profil (pseudo, photo, localisation) doivent être exactes et
            vous concerner. Un compte ne doit jamais usurper l&apos;identité d&apos;une autre
            personne, ni représenter un tiers sans son accord explicite.
          </p>
          <p>
            Vous êtes responsable de la confidentialité de votre mot de passe et de l&apos;activité
            réalisée depuis votre compte.
          </p>
        </Section>

        <Section numero={3} titre="Comportement des membres, modération et signalement">
          <p>
            Le respect et le consentement sont absolus : harcèlement, menaces, propos
            discriminatoires, et tout contenu illégal au sens de la loi française sont
            interdits.
          </p>
          <p>
            Tout membre peut signaler un profil ou un message via la fonction « Signaler »
            (harcèlement, contenu illégal, faux profil, comportement inapproprié, spam, autre).
            Chaque signalement est examiné par l&apos;équipe de modération.
          </p>
          <p>
            En cas de violation des présentes conditions, xlibertine peut suspendre ou bannir un
            compte, sans remboursement de la période d&apos;abonnement en cours.
          </p>
        </Section>

        <Section numero={4} titre="Vérification de profil">
          <p>
            Le badge « profil vérifié » est attribué après examen d&apos;un selfie (avec le mot
            « xlibertine » et la date, manuscrits) transmis volontairement. Cette photo reste
            strictement confidentielle : elle n&apos;est diffusée à aucun autre membre et est
            détruite après examen par la modération.
          </p>
        </Section>

        <Section numero={5} titre="Abonnements et paiement">
          <p>
            L&apos;accès de base est gratuit. Trois Pass payants sont proposés, facturés comme des
            abonnements mensuels récurrents <strong>sans engagement</strong> :
          </p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Pass Épicurien — 9 € / mois</li>
            <li>Pass Privilège — 15 € / mois</li>
            <li>Pass VIP Elite — 25 € / mois</li>
          </ul>
          <p>
            Le paiement est traité de manière sécurisée par Stripe : aucune donnée bancaire ne
            transite par nos serveurs. L&apos;abonnement est activé automatiquement après la
            confirmation du paiement. L&apos;intitulé bancaire est discret (« RP-SERVICES »),
            sans mention libertine.
          </p>
          <p>
            Vous pouvez résilier à tout moment depuis le portail de facturation Stripe, accessible
            sur la page « Abonnements ». En cas de résiliation, l&apos;abonnement reste actif
            jusqu&apos;à la fin de la période déjà payée, sans renouvellement.
          </p>
        </Section>

        <Section numero={6} titre="Événements et annonces">
          <p>
            Les membres Premium peuvent publier des annonces d&apos;événements (soirées privées,
            rencontres), soumises à une participation forfaitaire selon la formule choisie
            (durée d&apos;affichage et visibilité variables). L&apos;annonce est activée après
            confirmation du paiement.
          </p>
          <p>
            Les rencontres organisées via ces annonces se déroulent hors de la plateforme entre
            membres adultes consentants : chaque participant est seul responsable de sa sécurité
            et de ses choix. xlibertine n&apos;organise aucune rencontre physique et n&apos;est
            pas partie aux arrangements conclus entre membres.
          </p>
        </Section>

        <Section numero={7} titre="Limitation de responsabilité">
          <p>
            xlibertine fournit le service « en l&apos;état » et met en œuvre des moyens de
            modération raisonnables, sans garantir l&apos;exactitude des informations publiées par
            les membres ni la disponibilité ininterrompue du service.
          </p>
          <p>
            Les interactions entre membres (messages, groupes, rendez-vous) relèvent de la seule
            responsabilité des personnes concernées.
          </p>
        </Section>

        <Section numero={8} titre="Propriété intellectuelle">
          <p>
            La marque, le design et les éléments du site sont la propriété de son éditeur. Les
            photos et contenus que vous publiez restent les vôtres : vous nous accordez
            uniquement la licence technique nécessaire à leur affichage sur la plateforme.
          </p>
        </Section>

        <Section numero={9} titre="Évolution de ces conditions">
          <p>
            Les présentes conditions peuvent être modifiées. La version applicable est celle
            publiée sur cette page à la date de votre utilisation du service.
          </p>
        </Section>

        <Section numero={10} titre="Contact">
          <p>
            Une question sur ces conditions ? Écrivez à{' '}
            <a
              href="mailto:support@xlibertine.com"
              className="text-[#E86B7A] hover:underline font-medium"
            >
              support@xlibertine.com
            </a>
            .
          </p>
          <p>
            Voir également notre{' '}
            <Link href="/politique-confidentialite" className="text-[#E86B7A] hover:underline">
              Politique de confidentialité
            </Link>
            .
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}