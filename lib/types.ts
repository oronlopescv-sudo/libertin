export type GenderType = 'couple' | 'homme' | 'femme';
export type SexualOrientationType = 'hetero' | 'homo' | 'bi' | 'libertin';
export type SubscriptionTier = 'FREE' | 'PREMIUM_3M' | 'PREMIUM_12M' | 'PREMIUM_24M';

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
  subscriptionTier: SubscriptionTier;
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

export interface SubscriptionPlan {
  id: SubscriptionTier;
  title: string;
  durationMonths: number;
  totalPrice: number;
  pricePerMonth: number;
  popular?: boolean;
  savings?: string;
  features: string[];
}
