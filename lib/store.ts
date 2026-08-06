import { User, Group, Message, VerificationPhoto, SubscriptionTier } from './types';
import { calculateSubscriptionEndDate } from './stripe';

// NOTE: legacy localStorage data store.
// Most app logic now uses Supabase directly. This file remains only for
// backwards-compatible helpers (block lists, drafts) that have no backend yet.

const STORAGE_KEYS = {
  BLOCKED_IDS: 'rp_blocked_ids_v2',
};

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const Store = {
  // Block list helpers (kept in localStorage until backend supports it)
  getBlockedIds(): string[] {
    return getItem<string[]>(STORAGE_KEYS.BLOCKED_IDS, []);
  },

  setBlockedIds(ids: string[]): void {
    setItem(STORAGE_KEYS.BLOCKED_IDS, ids);
  },

  blockUser(currentUserId: string, targetUserId: string): string[] {
    const blocked = this.getBlockedIds();
    if (!blocked.includes(targetUserId)) {
      const updated = [...blocked, targetUserId];
      this.setBlockedIds(updated);
      return updated;
    }
    return blocked;
  },

  unblockUser(currentUserId: string, targetUserId: string): string[] {
    const blocked = this.getBlockedIds().filter((id) => id !== targetUserId);
    this.setBlockedIds(blocked);
    return blocked;
  },

  isBlocked(currentUserId: string, targetUserId: string): boolean {
    return this.getBlockedIds().includes(targetUserId);
  },

  // Helper for subscription end date calculation
  calculateSubscriptionEndDate,
};
