'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, SubscriptionTier } from '@/lib/types';
import { Store } from '@/lib/store';
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
  switchUser: (userId: string) => void;
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
        // Sync to local Store for components that still read localStorage
        Store.setCurrentUser(current.id);
        return true;
      }
    } catch (e) {
      console.warn('Supabase load failed, falling back to local Store', e);
    }
    return false;
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await loadFromSupabase();
    setIsLoading(false);
  }, [loadFromSupabase]);

  useEffect(() => {
    refreshUser();

    // Listen for Supabase auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      refreshUser();
    });

    const handleStorage = () => {
      refreshUser();
    };
    window.addEventListener('rp_storage_update', handleStorage);

    return () => {
      listener?.subscription?.unsubscribe?.();
      window.removeEventListener('rp_storage_update', handleStorage);
    };
  }, [refreshUser]);

  const isPremium = React.useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.subscriptionTier === 'FREE') return false;
    if (!user.subscriptionEnd) return true;
    return new Date(user.subscriptionEnd) > new Date();
  }, [user]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    // Real Supabase login only
    const result = await signInWithSupabase(email, password);
    if (result.success && result.user) {
      const profile = await getSupabaseUserByEmail(email);
      if (profile) {
        setUser(profile);
        const list = await getSupabaseUsersList();
        setUsersList(list);
        Store.setCurrentUser(profile.id);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    signOutWithSupabase();
    Store.clearCurrentUser();
    setUser(null);
    setUsersList([]);
  };

  const switchUser = (userId: string) => {
    Store.setCurrentUser(userId);
    refreshUser();
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
        Store.setCurrentUser(profile.id);
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
        switchUser,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
