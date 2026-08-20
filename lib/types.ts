export type GenderType = 'couple' | 'homme' | 'femme';
export type SexualOrientationType = 'hetero' | 'homo' | 'bi' | 'libertin';
export type AbonnementTier = 'FREE' | 'PASS_EPICURIEN' | 'PASS_PRIVILEGE' | 'PASS_VIP';
export type EventType = 'festa' | 'gang_bang' | 'troca' | 'other';
export type EventPlanType = 'basic' | 'featured' | 'vip_gold';

export interface Photo {
  id: string;
  userId: string;
  url: string;
  isCover: boolean;
  order: number;
  uploadedAt: string;
}

export interface VerificationPhoto {
  id: string;
  userId: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  username: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  gender: GenderType;
  sexualOrientation: SexualOrientationType;
  location: string;
  lat?: number;
  lng?: number;
  subscriptionTier: AbonnementTier;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  stripeCustomerId?: string;
  bio?: string;
  interests: string[];
  photos: Photo[];
  verificationPhotos: VerificationPhoto[];
  isVerified: boolean;
  isActive: boolean;
  isNSFW: boolean;
  blockedUserIds?: string[];
  createdAt: string;
  updatedAt: string;
  role?: 'user' | 'admin';
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  isPrivate: boolean;
  maxMembers: number;
  memberCount: number;
  category: 'casual' | 'aventure' | 'discretion' | 'clubs' | 'soirees';
  coverUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMembership {
  id: string;
  userId: string;
  groupId: string;
  role: 'member' | 'moderator' | 'creator';
  joinedAt: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userGender?: GenderType;
  userIsVerified?: boolean;
  groupId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface AbonnementPlan {
  id: AbonnementTier;
  title: string;
  durationMonths: number;
  totalPrice: number;
  pricePerMonth: number;
  popular?: boolean;
  savings?: string;
  features: string[];
}

export interface Event {
  id: string;
  creator_id: string;
  type: EventType;
  title: string;
  description: string;
  location?: string;
  city?: string;
  date_time?: string;
  is_date_flexible: boolean;
  looking_for?: string;
  min_participants?: number;
  max_participants?: number;
  confirmed_count: number;
  is_public: boolean;
  requires_verification: boolean;
  is_nsfw: boolean;
  plan_type: EventPlanType;
  amount_paid: number;
  payment_status: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: 'interested' | 'confirmed' | 'cancelled';
  joined_at: string;
}

export interface EventPhoto {
  id: string;
  event_id: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
}
