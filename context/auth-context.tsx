'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, SubscriptionTier } from '@/lib/types';
import { isPremium as isPremiumFn } from '@/lib/premium';
import {
  supabase,
  signUpWithSupabase,
  signInWithSupabase,
  signOutWithSupabase,
  getCurrentSupabaseUser,
  getSupabaseUserByEmail,
  getSupabaseUsersList,
  updateSupabaseProfile,
} from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  usersList: User[];
  isLoading: boolean;
  isPremium: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<User>;
  upgradeSubscription: (tier: SubscriptionTier) => void;
  refreshUser: () => void;
  canSeeProfile: (targetUserId: string) => boolean;
  canAccessChat: () => boolean;
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
      }
    } catch (e) {
      console.warn('Supabase load failed', e);
    }
    return false;
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

  const login = async (email: string, password?: string): Promise<boolean> => {
    // Real Supabase login only
    const result = await signInWithSupabase(email, password);
    if (result.success && result.user) {
      const profile = await getSupabaseUserByEmail(email);
      if (profile) {
        setUser(profile);
        const list = await getSupabaseUsersList();
        setUsersList(list);
        return true;
      }
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

    // 1. Try real Supabase registration
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
        const list = await getSupabaseUsersList();
        setUsersList(list);
        return profile;
      }
    }

    throw new Error(sbResult.error || "Échec de l'inscription. Veuillez réessayer.");
  };

  const upgradeSubscription = async (tier: SubscriptionTier) => {
    if (!user) return;

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (tier === 'PREMIUM_24M' ? 24 : tier === 'PREMIUM_12M' ? 12 : 3));

    await updateSupabaseProfile(user.id, {
      subscriptionTier: tier,
      subscriptionEnd: endDate.toISOString(),
    });

    await refreshUser();
  };

  const canSeeProfile = (targetUserId: string) => {
    if (!user) return false;
    if (user.id === targetUserId) return true;
    if (user.role === 'admin') return true;
    return isPremium;
  };

  const canAccessChat = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return isPremium;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        usersList,
        isLoading,
        isPremium,
        login,
        logout,
        register,
        upgradeSubscription,
        refreshUser,
        canSeeProfile,
        canAccessChat,
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
  login: async () => false,
  logout: () => {},
  register: async () => {
    throw new Error('Auth indisponible.');
  },
  upgradeSubscription: () => {},
  refreshUser: () => {},
  canSeeProfile: () => false,
  canAccessChat: () => false,
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
