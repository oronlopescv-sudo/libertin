'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AbonnementTier } from '@/lib/types';
import { isPremium as isPremiumFn, isAdmin as isAdminFn } from '@/lib/premium';
import {
  supabase,
  signUpWithSupabase,
  signInWithSupabase,
  signOutWithSupabase,
  getCurrentSupabaseUser,
  getSupabaseUserByEmail,
  creerProfilManquant,
  getSupabaseUsersList,
  updateSupabaseProfile,
} from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  usersList: User[];
  isLoading: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<User>;
  refreshUser: () => void;
  canSeeProfile: (targetUserId: string) => boolean;
  canAccessChat: () => boolean;
  canSendMessages: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadFromSupabase = useCallback(async () => {
    try {
      const current = await getCurrentSupabaseUser();
      const list = await getSupabaseUsersList();
      if (current) {
        setUser(current);
        setUsersList(list);
        return true;
      } else {
        // Pas de session valide : on réinitialise l'état utilisateur
        // pour que le site affiche les boutons "Se connecter" au lieu
        // de rester bloqué en mode "chargement" (effet hors-ligne).
        setUser(null);
        setUsersList(list);
        return false;
      }
    } catch (e) {
      console.warn('Supabase load failed', e);
      setUser(null);
      return false;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await loadFromSupabase();
    setIsLoading(false);
  }, [loadFromSupabase]);

  useEffect(() => {
    let listener: any = null;
    const handleStorage = () => {
      refreshUser();
    };

    try {
      refreshUser();

      // Listen for Supabase auth changes
      const sub = supabase?.auth?.onAuthStateChange?.(() => {
        refreshUser();
      });
      listener = sub?.data ?? null;

      window.addEventListener('rp_storage_update', handleStorage);
    } catch (e) {
      console.warn('[AuthProvider] init failed', e);
      setIsLoading(false);
    }

    return () => {
      try {
        listener?.subscription?.unsubscribe?.();
        window.removeEventListener('rp_storage_update', handleStorage);
      } catch {
        /* noop */
      }
    };
  }, [refreshUser]);

  const isPremium = React.useMemo(() => isPremiumFn(user), [user]);
  const isAdmin = React.useMemo(() => isAdminFn(user), [user]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    const result = await signInWithSupabase(email, password);

    // Mot de passe refusé par Supabase Auth : identifiants réellement invalides.
    if (!result.success || !result.user) return false;

    const profile = await getSupabaseUserByEmail(email);
    if (profile) {
      setUser(profile);
      setUsersList(await getSupabaseUsersList());
      return true;
    }

    // Le mot de passe est bon mais aucun profil n'existe dans `profiles`.
    // Cela arrive quand l'inscription a créé le compte Auth sans réussir
    // l'insertion du profil (l'erreur y est seulement journalisée).
    // On répare au lieu de refuser une connexion pourtant valide.
    const reparation = await creerProfilManquant(result.user, email);
    if (reparation) {
      setUser(reparation);
      setUsersList(await getSupabaseUsersList());
      return true;
    }

    return false;
  };

  const logout = () => {
    signOutWithSupabase();
    setUser(null);
    setUsersList([]);
  };


  const register = async (userData: any): Promise<User> => {
    const password = userData.password || userData.hashedPassword;

    const sbResult = await signUpWithSupabase({
      email: userData.email,
      password: password || '',
      username: userData.username,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      sexualOrientation: userData.sexualOrientation,
      location: userData.location,
      lat: userData.lat,
      lng: userData.lng,
      bio: userData.bio,
      interests: userData.interests,
      photoUrl: userData.photos?.[0]?.url,
    });

    if (sbResult.success) {
      const profile = await getSupabaseUserByEmail(userData.email);
      if (profile) {
        setUser(profile);
        setUsersList(await getSupabaseUsersList());
        return profile;
      }
    }

    // Le compte Auth a été créé (mot de passe valide) mais l'insertion du
    // profil a échoué : sans ceci, l'inscription semble avoir échoué alors
    // que le compte existe déjà. On répare au lieu d'afficher une erreur
    // trompeuse.
    if (sbResult.profileMissing && sbResult.userId) {
      const reparation = await creerProfilManquant(
        { id: sbResult.userId, user_metadata: userData },
        userData.email
      );
      if (reparation) {
        setUser(reparation);
        setUsersList(await getSupabaseUsersList());
        return reparation;
      }
    }

    throw new Error(sbResult.error || "Échec de l'inscription. Veuillez réessayer.");
  };

  /**
   * Consultation des profils : ouverte à tout membre connecté.
   * La restriction Premium porte sur le contact, pas sur la consultation.
   */
  const canSeeProfile = (_targetUserId: string) => {
    return Boolean(user);
  };

  /**
   * Lecture des conversations : ouverte à tout membre connecté.
   * L'envoi de messages, lui, reste réservé aux membres Premium
   * (vérifié côté serveur dans les routes API).
   */
  const canAccessChat = () => {
    return Boolean(user);
  };

  /** Envoi de messages : réservé aux membres Premium. */
  const canSendMessages = () => {
    if (!user) return false;
    return isPremium;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        usersList,
        isLoading,
        isPremium,
        isAdmin,
        login,
        logout,
        register,
        refreshUser,
        canSeeProfile,
        canAccessChat,
        canSendMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const FALLBACK_AUTH: AuthContextType = {
  user: null,
  usersList: [],
  isLoading: false,
  isPremium: false,
  isAdmin: false,
  login: async () => false,
  logout: () => {},
  register: async () => {
    throw new Error('Auth indisponible.');
  },
  refreshUser: () => {},
  canSeeProfile: () => false,
  canAccessChat: () => false,
  canSendMessages: () => false,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    if (typeof window !== 'undefined') {
      console.warn('[useAuth] used outside AuthProvider — using fallback.');
    }
    return FALLBACK_AUTH;
  }
  return context;
}
