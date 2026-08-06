import { createClient } from '@supabase/supabase-js';
import { User, GenderType, SexualOrientationType, SubscriptionTier, Group, Message } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não estão definidos.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'dummy-key'
);

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
    const password = userData.password;
    if (!password) {
      return {
        success: false,
        error: 'Mot de passe requis pour la création de compte.',
      };
    }

    // 1. Supabase Auth Registration
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password,
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
    if (!password) {
      return { success: false, error: 'Mot de passe requis.' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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

// ========================================================
// PROFILE HELPERS
// ========================================================

function snakeToCamelProfile(row: any): User {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone || undefined,
    username: row.username,
    dateOfBirth: row.date_of_birth,
    age: row.date_of_birth
      ? new Date().getFullYear() - new Date(row.date_of_birth).getFullYear()
      : 25,
    gender: row.gender,
    sexualOrientation: row.sexual_orientation,
    location: row.location,
    lat: row.lat,
    lng: row.lng,
    subscriptionTier: row.subscription_tier,
    subscriptionStart: row.subscription_start,
    subscriptionEnd: row.subscription_end,
    stripeCustomerId: row.stripe_customer_id,
    bio: row.bio,
    interests: row.interests || [],
    photos: [], // fetched separately if needed
    verificationPhotos: [],
    isVerified: row.is_verified,
    isActive: row.is_active,
    isNSFW: row.is_nsfw,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCurrentSupabaseUser(): Promise<User | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return null;

    const userId = sessionData.session.user.id;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.warn('getCurrentSupabaseUser:', error?.message);
      return null;
    }
    return snakeToCamelProfile(profile);
  } catch (e: any) {
    console.warn('getCurrentSupabaseUser error:', e.message);
    return null;
  }
}

export async function getSupabaseUserByEmail(email: string): Promise<User | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !profile) return null;
    return snakeToCamelProfile(profile);
  } catch (e) {
    return null;
  }
}

export async function getSupabaseUsersList(limit = 50): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .limit(limit);
    if (error || !data) return [];
    return data.map(snakeToCamelProfile);
  } catch (e) {
    return [];
  }
}

export async function updateSupabaseProfile(
  userId: string,
  payload: Partial<User>
): Promise<boolean> {
  try {
    const dbPayload: any = {};
    if (payload.username !== undefined) dbPayload.username = payload.username;
    if (payload.email !== undefined) dbPayload.email = payload.email;
    if (payload.bio !== undefined) dbPayload.bio = payload.bio;
    if (payload.location !== undefined) dbPayload.location = payload.location;
    if (payload.lat !== undefined) dbPayload.lat = payload.lat;
    if (payload.lng !== undefined) dbPayload.lng = payload.lng;
    if (payload.gender !== undefined) dbPayload.gender = payload.gender;
    if (payload.interests !== undefined) dbPayload.interests = payload.interests;
    if (payload.subscriptionTier !== undefined) dbPayload.subscription_tier = payload.subscriptionTier;
    if (payload.subscriptionStart !== undefined) dbPayload.subscription_start = payload.subscriptionStart;
    if (payload.subscriptionEnd !== undefined) dbPayload.subscription_end = payload.subscriptionEnd;
    if (payload.isVerified !== undefined) dbPayload.is_verified = payload.isVerified;
    if (payload.isActive !== undefined) dbPayload.is_active = payload.isActive;
    if (payload.role !== undefined) dbPayload.role = payload.role;
    dbPayload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('profiles').update(dbPayload).eq('id', userId);
    return !error;
  } catch (e) {
    return false;
  }
}

export async function deleteSupabaseUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    return !error;
  } catch (e) {
    return false;
  }
}

export async function getPendingVerifications(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('verification_photos')
      .select('*, profiles(id, username, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch (e) {
    return [];
  }
}

export async function approveVerification(photoId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('verification_photos')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', photoId);
    if (error) return false;
    return true;
  } catch (e) {
    return false;
  }
}

export async function rejectVerification(photoId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('verification_photos')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', photoId);
    if (error) return false;
    return true;
  } catch (e) {
    return false;
  }
}

// ========================================================
// PHOTOS HELPERS
// ========================================================

export async function getSupabasePhotos(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });
    if (error || !data) return [];
    return data;
  } catch (e) {
    return [];
  }
}

export async function addSupabasePhoto(userId: string, url: string): Promise<boolean> {
  try {
    const { data: existing } = await supabase.from('photos').select('id').eq('user_id', userId);
    const isFirst = !existing || existing.length === 0;
    const { error } = await supabase.from('photos').insert({
      user_id: userId,
      url,
      is_cover: isFirst,
      display_order: existing?.length || 0,
    });
    return !error;
  } catch (e) {
    return false;
  }
}

export async function deleteSupabasePhoto(photoId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('photos').delete().eq('id', photoId);
    return !error;
  } catch (e) {
    return false;
  }
}

export async function setSupabaseCoverPhoto(userId: string, photoId: string): Promise<boolean> {
  try {
    await supabase.from('photos').update({ is_cover: false }).eq('user_id', userId);
    const { error } = await supabase.from('photos').update({ is_cover: true }).eq('id', photoId);
    return !error;
  } catch (e) {
    return false;
  }
}

// ========================================================
// GROUPS HELPERS
// ========================================================

export async function getSupabaseGroups(): Promise<Group[]> {
  try {
    const { data, error } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      isPrivate: row.is_private,
      maxMembers: row.max_members,
      memberCount: row.member_count,
      category: row.category,
      coverUrl: row.cover_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (e) {
    return [];
  }
}

export async function createSupabaseGroup(payload: {
  name: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  category: Group['category'];
  maxMembers: number;
  isPrivate: boolean;
  coverUrl?: string;
}): Promise<Group | null> {
  try {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: payload.name,
        description: payload.description,
        creator_id: payload.creatorId,
        creator_name: payload.creatorName,
        category: payload.category,
        max_members: payload.maxMembers,
        is_private: payload.isPrivate,
        cover_url: payload.coverUrl,
        member_count: 1,
      })
      .select()
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      creatorId: data.creator_id,
      creatorName: data.creator_name,
      isPrivate: data.is_private,
      maxMembers: data.max_members,
      memberCount: data.member_count,
      category: data.category,
      coverUrl: data.cover_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (e) {
    return null;
  }
}

export async function updateSupabaseGroup(
  groupId: string,
  payload: Partial<Group>
): Promise<boolean> {
  try {
    const dbPayload: any = {};
    if (payload.name !== undefined) dbPayload.name = payload.name;
    if (payload.description !== undefined) dbPayload.description = payload.description;
    if (payload.category !== undefined) dbPayload.category = payload.category;
    if (payload.maxMembers !== undefined) dbPayload.max_members = payload.maxMembers;
    if (payload.isPrivate !== undefined) dbPayload.is_private = payload.isPrivate;
    if (payload.coverUrl !== undefined) dbPayload.cover_url = payload.coverUrl;
    if (payload.memberCount !== undefined) dbPayload.member_count = payload.memberCount;
    dbPayload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('groups').update(dbPayload).eq('id', groupId);
    return !error;
  } catch (e) {
    return false;
  }
}

export async function deleteSupabaseGroup(groupId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    return !error;
  } catch (e) {
    return false;
  }
}

// ========================================================
// MESSAGES HELPERS
// ========================================================

export async function getSupabaseMessages(groupId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userAvatar: row.user_avatar,
      userGender: row.user_gender,
      userIsVerified: row.user_is_verified,
      groupId: row.group_id,
      content: row.content,
      mediaUrl: row.media_url,
      createdAt: row.created_at,
    }));
  } catch (e) {
    return [];
  }
}

export async function sendSupabaseMessage(payload: {
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userGender?: GenderType;
  userIsVerified?: boolean;
  content: string;
  mediaUrl?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('messages').insert({
      group_id: payload.groupId,
      user_id: payload.userId,
      user_name: payload.userName,
      user_avatar: payload.userAvatar,
      user_gender: payload.userGender,
      user_is_verified: payload.userIsVerified,
      content: payload.content,
      media_url: payload.mediaUrl,
    });
    return !error;
  } catch (e) {
    return false;
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
