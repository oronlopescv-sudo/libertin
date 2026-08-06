'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, SubscriptionTier } from '@/lib/types';
import { Store } from '@/lib/store';
import { signUpWithSupabase, signInWithSupabase, signOutWithSupabase } from '@/lib/supabase';

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

  const refreshUser = useCallback(() => {
    const currentUser = Store.getCurrentUser();
    const allUsers = Store.getUsers();
    setUser(currentUser);
    setUsersList(allUsers);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshUser();
    }, 0);

    const handleStorage = () => {
      refreshUser();
    };

    window.addEventListener('rp_storage_update', handleStorage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('rp_storage_update', handleStorage);
    };
  }, [refreshUser]);

  const isPremium = React.useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.subscriptionTier === 'FREE') return false;
    if (!user.subscriptionEnd) return true; // Lifetime/active
    return new Date(user.subscriptionEnd) > new Date();
  }, [user]);

  const login = async (email: string, password?: string) => {
    // 1. Try Supabase Login
    await signInWithSupabase(email, password);

    // 2. Sync local user list
    const found = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      Store.setCurrentUser(found.id);
      refreshUser();
      return true;
    }
    return false;
  };

  const logout = () => {
    signOutWithSupabase();
    Store.setCurrentUser('user-homme-lyon'); // Fallback to free account
    refreshUser();
  };

  const switchUser = (userId: string) => {
    Store.setCurrentUser(userId);
    refreshUser();
  };

  const register = async (userData: any): Promise<User> => {
    // 1. Register with local Store
    const newUser = Store.registerUser(userData);

    // 2. Register asynchronously with Supabase
    try {
      await signUpWithSupabase({
        email: userData.email,
        password: userData.hashedPassword || userData.password,
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
    } catch (e) {
      console.warn('Supabase sync warning:', e);
    }

    refreshUser();
    return newUser;
  };

  const upgradeSubscription = (tier: SubscriptionTier) => {
    if (!user) return;
    Store.upgradeSubscription(user.id, tier);
    refreshUser();
  };

  const canSeeProfile = (targetUserId: string) => {
    if (!user) return false;
    if (user.id === targetUserId) return true; // Own profile always visible
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
