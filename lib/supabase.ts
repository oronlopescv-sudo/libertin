import { createClient } from '@supabase/supabase-js';
import { User, GenderType, SexualOrientationType, SubscriptionTier } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mfchfnsekoluicxnguoh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mY2hmbnNla29sdWljeG5ndW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTI4NjcsImV4cCI6MjEwMTQyODg2N30.oGzeDkpo2KU1PSIn1l0RPSto-KfuNICQdtXpjVULutw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Register a user in Supabase Auth & insert record into public.profiles
 */
export async function signUpWithSupabase(userData: {
  email: string;
  password?: string;
  username: string;
  dateOfBirth: string;
  gender: GenderType;
  sexualOrientation: SexualOrientationType;
  location: string;
  lat?: number;
  lng?: number;
  bio?: string;
  interests?: string[];
  photoUrl?: string;
}) {
  try {
    const password = userData.password || 'Libertine2026!';

    // 1. Supabase Auth Registration
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: password,
      options: {
        data: {
          username: userData.username,
          gender: userData.gender,
          location: userData.location,
        },
      },
    });

    if (authError) {
      console.warn('Supabase Auth signUp warning/error:', authError.message);
    }

    const userId = authData.user?.id || `user-${Date.now()}`;

    // 2. Insert into public.profiles table in Supabase
    const profilePayload = {
      id: userId,
      email: userData.email,
      username: userData.username,
      date_of_birth: userData.dateOfBirth,
      gender: userData.gender,
      sexual_orientation: userData.sexualOrientation,
      location: userData.location,
      lat: userData.lat || 48.8566,
      lng: userData.lng || 2.3522,
      subscription_tier: 'FREE',
      bio: userData.bio || '',
      interests: userData.interests || [],
      is_verified: false,
      is_active: true,
      is_nsfw: true,
      role: 'user',
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      console.warn('Supabase profiles upsert info (table might need creation):', profileError.message);
    }

    // 3. Insert photo if provided
    if (userData.photoUrl && userId) {
      const { error: photoError } = await supabase.from('photos').insert({
        user_id: userId,
        url: userData.photoUrl,
        is_cover: true,
      });
      if (photoError) {
        console.warn('Photo insert notice:', photoError.message);
      }
    }

    return {
      success: true,
      userId,
      user: authData.user,
    };
  } catch (err: any) {
    console.error('Supabase registration error:', err);
    return {
      success: false,
      error: err.message || 'Erreur lors de l\'inscription Supabase',
    };
  }
}

/**
 * Sign in user with Supabase
 */
export async function signInWithSupabase(email: string, password?: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'Libertine2026!',
    });

    if (error) {
      console.warn('Supabase login notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, session: data.session, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Sign out from Supabase
 */
export async function signOutWithSupabase() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('Supabase signout warning:', e);
  }
}

/**
 * Full SQL Schema for Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- LIBERTINELOVERS - SCHEMA COMPLET SUPABASE (POSTGRESQL)
-- Executer ce script dans le "SQL Editor" de votre projet Supabase
-- ========================================================

-- 1. TABLE PROFILES / UTILISATEURS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT DEFAULT 'couple',
  sexual_orientation TEXT DEFAULT 'libertin',
  location TEXT DEFAULT 'Paris',
  lat DOUBLE PRECISION DEFAULT 48.8566,
  lng DOUBLE PRECISION DEFAULT 2.3522,
  subscription_tier TEXT DEFAULT 'FREE',
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_nsfw BOOLEAN DEFAULT TRUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active la sécurité niveau ligne (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user insert profile" ON public.profiles;
CREATE POLICY "Allow user insert profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow user update profile" ON public.profiles;
CREATE POLICY "Allow user update profile" ON public.profiles FOR UPDATE USING (true);


-- 2. TABLE PHOTOS
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public photos read" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Allow photos insert" ON public.photos FOR INSERT WITH CHECK (true);


-- 3. TABLE VERIFICATION_PHOTOS
CREATE TABLE IF NOT EXISTS public.verification_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.verification_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public verif photos read" ON public.verification_photos FOR SELECT USING (true);
CREATE POLICY "Allow verif photos insert" ON public.verification_photos FOR INSERT WITH CHECK (true);


-- 4. TABLE GROUPS (CLUBS & GROUPES)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_name TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  max_members INT DEFAULT 50,
  member_count INT DEFAULT 1,
  category TEXT DEFAULT 'clubs',
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public groups read" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Allow groups insert" ON public.groups FOR INSERT WITH CHECK (true);


-- 5. TABLE MESSAGES (TCHAT REAL-TIME)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public messages read" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow messages insert" ON public.messages FOR INSERT WITH CHECK (true);


-- 6. TABLE SUBSCRIPTIONS (PAGAMENTOS STRIPE & PLANOS)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public subscriptions read" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow subscriptions insert" ON public.subscriptions FOR INSERT WITH CHECK (true);
`;

