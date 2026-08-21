import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Flame, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0C0512] border-t border-[#2C1B3D] pt-12 pb-8 text-zinc-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Guarantee */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D4145A] flex items-center justify-center">
                <Flame className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                x<span className="text-[#D4145A]">libertine</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              La plateforme française de référence dédiée aux rencontres libertines, échangistes et épicuriennes en toute discrétion.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Charte Discrétion & Sécurité Reconnue</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/decouvrir" className="hover:text-white transition-colors">
                  Découvrir les profils
                </Link>
              </li>
              <li>
                <Link href="/groupes" className="hover:text-white transition-colors">
                  Groupes & Soirées Privées
                </Link>
              </li>
              <li>
                <Link href="/abonnements" className="hover:text-white transition-colors">
                  Formules & Tarifs
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Créer un compte couple ou solo
                </Link>
              </li>
            </ul>
          </div>

          {/* Discretion & Security */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Discrétion Absolue
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#E86B7A]" />
                <span>Intitulé bancaire anonyme</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Photos vérifiées par modération</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-[#D4145A]" />
                <span>Consentement & Respect stricts</span>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Support & Contact
            </h4>
            <div className="space-y-2 text-xs">
              <p className="text-zinc-400">
                Notre équipe est disponible 7j/7 pour répondre à vos questions et valider vos vérifications.
              </p>
              <a
                href="mailto:support@xlibertine.com"
                className="inline-flex items-center gap-2 text-[#E86B7A] hover:underline font-medium"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>support@xlibertine.com</span>
              </a>
              <div className="text-[10px] text-zinc-500 pt-2">
                Temps de réponse moyen: &lt; 2h
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1C102B] flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} xlibertine — Tous droits réservés.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Réservé aux personnes majeures (+18 ans)</span>
            <span>•</span>
            <span>Conditions Générales</span>
            <span>•</span>
            <span>Politique de Confidentialité</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
