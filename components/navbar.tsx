'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { isAdmin as isAdminUser } from '@/lib/premium';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Flame,
  Users,
  MessageSquare,
  Crown,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Database,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, isPremium, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/decouvrir', label: 'Découvrir', icon: Flame, badge: isPremium ? null : 'Premium' },
    { href: '/groupes', label: 'Groupes', icon: Users },
    { href: '/abonnements', label: 'Abonnements', icon: Crown, highlight: true },
    { href: '/admin', label: 'Modération', icon: ShieldCheck, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1C102B]/90 backdrop-blur-md border-b border-[#2C1B3D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4145A] to-[#E86B7A] flex items-center justify-center shadow-lg shadow-[#D4145A]/25 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              {/* Une seule version du nom, avec taille responsive au lieu de deux
                  spans qui apparaissent tous les deux quand le CSS ne charge pas. */}
              <div className="text-sm sm:text-xl font-bold tracking-tight text-white">
                x<span className="text-[#D4145A]">libertine</span>
              </div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                100% Libertin & Discret
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.adminOnly && !isAdminUser(user)) return null;
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#D4145A]/15 text-[#E86B7A] border border-[#D4145A]/30'
                      : link.highlight
                      ? 'bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white hover:opacity-95 shadow-md shadow-[#D4145A]/20'
                      : 'text-zinc-300 hover:text-white hover:bg-[#2C1B3D]/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4145A] text-white font-semibold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Current User Profile Pill */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profil"
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#2C1B3D] border border-[#3D2654] hover:border-[#D4145A] transition-colors"
                >
                  <img
                    src={user.photos?.[0]?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover border border-[#D4145A]"
                  />
                  <div className="text-xs text-left">
                    <div className="font-semibold text-white flex items-center gap-1 leading-tight">
                      {user.username}
                      {user.isVerified && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-medium">
                      {isPremium ? (
                        <span className="text-[#E86B7A] font-bold">Premium Active</span>
                      ) : (
                        <span className="text-zinc-400">Compte Gratuit</span>
                      )}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2C1B3D] transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-[#D4145A] text-white text-xs font-semibold hover:bg-[#B50E4A] transition-colors shadow-md"
              >
                Se Connecter
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#2C1B3D] text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1C102B] border-b border-[#2C1B3D] px-4 pt-2 pb-6 space-y-3">
          {user && (
            <div className="p-3 rounded-xl bg-[#2C1B3D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.photos?.[0]?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover border border-[#D4145A]"
                />
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-1">
                    {user.username}
                    {user.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Statut: <span className="text-[#E86B7A] font-bold">{user.subscriptionTier}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/profil"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs px-2.5 py-1 rounded-md bg-[#D4145A] text-white font-medium"
              >
                Profil
              </Link>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.adminOnly && !isAdminUser(user)) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-200 hover:bg-[#2C1B3D]"
                >
                  <Icon className="w-5 h-5 text-[#E86B7A]" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#D4145A] text-white font-semibold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Le bouton de déconnexion n'existait que dans la barre de bureau :
              sur mobile, aucun moyen de se déconnecter. */}
          {user ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-200 hover:bg-[#2C1B3D] border-t border-[#2C1B3D] mt-3 pt-4"
            >
              <LogOut className="w-5 h-5 text-[#E86B7A]" />
              <span>Se déconnecter</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center px-4 py-2.5 rounded-lg bg-[#D4145A] text-white text-sm font-semibold hover:bg-[#B50E4A] transition-colors mt-3"
            >
              Se connecter
            </Link>
          )}

        </div>
      )}
    </header>
  );
}
