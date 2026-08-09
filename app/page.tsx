'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProfileCard } from '@/components/profile-card';
import { SubscriptionPlans } from '@/components/subscription-plans';
import { useAuth } from '@/context/auth-context';
import {
  Flame,
  ShieldCheck,
  Lock,
  Heart,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Compass,
  Crown,
} from 'lucide-react';

export default function HomePage() {
  const { user, usersList, isPremium } = useAuth();

  const features = [
    {
      icon: ShieldCheck,
      title: 'Profils 100% Vérifiés',
      desc: 'Chaque couple et célibataire peut faire vérifier sa photo avec pièce d\'identité auprès de nos modérateurs français.',
    },
    {
      icon: Lock,
      title: 'Discrétion Absolue',
      desc: 'Aucune donnée revendue, floutage optionnel des photos et intitulé bancaire 100% neutre (RP-SERVICES).',
    },
    {
      icon: Users,
      title: 'Groupes & Soirées Privées',
      desc: 'Rejoignez des cercles d&apos;épicuriens sur Paris, Lyon, PACA, Bordeaux pour organiser vos sorties en clubs et villas.',
    },
  ];

  const testimonials = [
    {
      author: 'Couple parisien',
      city: 'Paris (75)',
      role: 'Couple Membre',
      text: 'Interface élégante et communauté respectueuse. Nous avons pu organiser des rencontres en toute sérénité.',
      stars: 5,
    },
    {
      author: 'Sophie',
      city: 'Bordeaux (33)',
      role: 'Femme Solo',
      text: 'Le respect et la modération sont primordiaux pour une femme solo. Les profils vérifiés rassurent dès les premiers échanges.',
      stars: 5,
    },
    {
      author: 'Membre Côte d\'Azur',
      city: 'Cannes (06)',
      role: 'Organisateur de soirées',
      text: 'Le système de groupes permet de rassembler les bonnes personnes pour des soirées privées en toute discrétion.',
      stars: 5,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-[#2C1B3D]">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D4145A]/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-[#2C1B3D]/40 blur-[90px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C102B] border border-[#D4145A]/40 text-xs font-semibold text-[#E86B7A] shadow-lg">
                <Sparkles className="w-4 h-4 text-[#D4145A]" />
                <span>Réseau Libertin Francophone : 🇫🇷 France • 🇧🇪 Belgique • 🇱🇺 Luxembourg • 🇨🇭 Suisse • 🇲🇨 Monaco</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Rencontres Libertines <br />
                <span className="bg-gradient-to-r from-[#D4145A] via-[#E86B7A] to-purple-400 bg-clip-text text-transparent">
                  Casais, Femmes & Solos
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal max-w-2xl mx-auto">
                Espace raffiné et discret dédié aux couples libertins et célibataires exigents. Échangez en temps réel, rejoignez des groupes de soirées privées et découvrez des profils vérifiés près de chez vous.
              </p>

              {/* CTA Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold text-sm hover:opacity-95 shadow-xl shadow-[#D4145A]/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <Flame className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span>Rejoindre Maintenant</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/decouvrir"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#2C1B3D] border border-[#3D2654] text-white font-bold text-sm hover:border-[#D4145A] transition-all flex items-center justify-center gap-2"
                >
                  <Compass className="w-5 h-5 text-[#E86B7A]" />
                  <span>Explorer les Profils</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Profils Réels & Vérifiés</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Paiements sécurisés via Stripe</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Communauté 100% Francophone</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-[#160B21] border-b border-[#2C1B3D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Un Cadre de Liberté Régi par l&apos;Élégance
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                Tout a été conçu pour préserver votre vie privée et vous offrir des rencontres d&apos;exception.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] hover:border-[#D4145A]/40 transition-all space-y-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#D4145A]/20 border border-[#D4145A]/40 flex items-center justify-center text-[#E86B7A]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Member Preview Grid */}
        <section className="py-16 border-b border-[#2C1B3D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>Derniers Profils Actifs</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4145A] text-white font-semibold">
                    En Direct
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Découvrez les couples et célibataires connectés dans votre région
                </p>
              </div>

              <Link
                href="/decouvrir"
                className="text-xs font-bold text-[#E86B7A] hover:underline flex items-center gap-1"
              >
                <span>Voir tous les profils</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {usersList.slice(0, 4).map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  currentUser={user}
                  isPremium={isPremium}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Subscriptions Section */}
        <section className="py-16 bg-[#160B21] border-b border-[#2C1B3D]" id="abonnements">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4145A]/20 text-[#E86B7A] text-xs font-bold mb-3">
                <Crown className="w-4 h-4" />
                <span>Formules de Subscriptions</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                Choisissez Votre Niveau de Privilège
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                Accès complet aux tchats, profils défloutés, albums privés et invitations aux événements.
              </p>
            </div>

            <SubscriptionPlans />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Témoignages de Nos Membres
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Avis vérifiés de couples et solos ayant trouvé la complicité recherchée
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-4"
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-zinc-300 italic leading-relaxed">
                    &quot;{item.text}&quot;
                  </p>

                  <div className="pt-3 border-t border-[#2C1B3D]">
                    <div className="font-bold text-white text-xs">{item.author}</div>
                    <div className="text-[10px] text-zinc-400">{item.role} • {item.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
