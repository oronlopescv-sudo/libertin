import { User, Group, Message, VerificationPhoto, SubscriptionTier } from './types';
import { INITIAL_USERS, INITIAL_GROUPS, INITIAL_MESSAGES } from './seedData';
import { calculateSubscriptionEndDate } from './stripe';

const STORAGE_KEYS = {
  USERS: 'rp_users_v1',
  GROUPS: 'rp_groups_v1',
  MESSAGES: 'rp_messages_v1',
  CURRENT_USER_ID: 'rp_current_user_id_v1',
};

// Helper for safe localStorage access
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
    // Broadcast event for multi-tab sync
    window.dispatchEvent(new Event('rp_storage_update'));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const Store = {
  getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  saveUsers(users: User[]): void {
    setItem(STORAGE_KEYS.USERS, users);
  },

  getUserById(id: string): User | undefined {
    const users = this.getUsers();
    return users.find((u) => u.id === id);
  },

  getCurrentUser(): User {
    const currentId = getItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user-couple-paris');
    const user = this.getUserById(currentId);
    if (user) return user;
    const all = this.getUsers();
    return all[0] || INITIAL_USERS[0];
  },

  setCurrentUser(id: string): void {
    setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  updateUser(updated: Partial<User> & { id: string }): User {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === updated.id);
    if (index === -1) throw new Error('User not found');
    const newUser = { ...users[index], ...updated, updatedAt: new Date().toISOString() };
    users[index] = newUser;
    this.saveUsers(users);
    return newUser;
  },

  deleteUser(id: string): void {
    const users = this.getUsers().filter((u) => u.id !== id);
    this.saveUsers(users);
  },

  registerUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'photos' | 'verificationPhotos' | 'isVerified' | 'isActive' | 'subscriptionTier'> & { subscriptionTier?: SubscriptionTier }): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
      subscriptionTier: userData.subscriptionTier || 'FREE',
      photos: [],
      verificationPhotos: [],
      isVerified: false,
      isActive: true,
      isNSFW: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser.id);
    return newUser;
  },

  uploadVerificationPhoto(userId: string, photoUrl: string): VerificationPhoto {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const vPhoto: VerificationPhoto = {
      id: `verif-${Date.now()}`,
      userId,
      url: photoUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    user.verificationPhotos.unshift(vPhoto);
    this.updateUser(user);
    return vPhoto;
  },

  approveVerificationPhoto(userId: string, photoId: string): void {
    const user = this.getUserById(userId);
    if (!user) return;

    user.verificationPhotos = user.verificationPhotos.map((vp) =>
      vp.id === photoId ? { ...vp, status: 'approved' as const } : vp
    );
    user.isVerified = true;
    this.updateUser(user);
  },

  upgradeSubscription(userId: string, tier: SubscriptionTier): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();
    let durationMonths = 0;
    if (tier === 'PREMIUM_3M') durationMonths = 3;
    else if (tier === 'PREMIUM_12M') durationMonths = 12;
    else if (tier === 'PREMIUM_24M') durationMonths = 24;

    const endDate = durationMonths > 0 ? calculateSubscriptionEndDate(now, durationMonths) : undefined;

    return this.updateUser({
      id: userId,
      subscriptionTier: tier,
      subscriptionStart: now.toISOString(),
      subscriptionEnd: endDate ? endDate.toISOString() : undefined,
      stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 9)}`,
    });
  },

  // User Blocking Management
  blockUser(currentUserId: string, targetUserId: string): User {
    const user = this.getUserById(currentUserId);
    if (!user) throw new Error('User not found');

    const blocked = user.blockedUserIds || [];
    if (!blocked.includes(targetUserId)) {
      const updatedBlocked = [...blocked, targetUserId];
      return this.updateUser({
        id: currentUserId,
        blockedUserIds: updatedBlocked,
      });
    }
    return user;
  },

  unblockUser(currentUserId: string, targetUserId: string): User {
    const user = this.getUserById(currentUserId);
    if (!user) throw new Error('User not found');

    const blocked = user.blockedUserIds || [];
    const updatedBlocked = blocked.filter((id) => id !== targetUserId);
    return this.updateUser({
      id: currentUserId,
      blockedUserIds: updatedBlocked,
    });
  },

  isBlocked(currentUserId: string, targetUserId: string): boolean {
    const user = this.getUserById(currentUserId);
    if (!user) return false;
    return (user.blockedUserIds || []).includes(targetUserId);
  },

  getBlockedUserIds(currentUserId: string): string[] {
    const user = this.getUserById(currentUserId);
    return user?.blockedUserIds || [];
  },

  // Groups
  getGroups(): Group[] {
    return getItem<Group[]>(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
  },

  saveGroups(groups: Group[]): void {
    setItem(STORAGE_KEYS.GROUPS, groups);
  },

  createGroup(data: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'memberCount'>): Group {
    const groups = this.getGroups();
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      ...data,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    groups.unshift(newGroup);
    this.saveGroups(groups);
    return newGroup;
  },

  updateGroup(updated: Partial<Group> & { id: string }): Group {
    const groups = this.getGroups();
    const index = groups.findIndex((g) => g.id === updated.id);
    if (index === -1) throw new Error('Group not found');
    const newGroup = { ...groups[index], ...updated, updatedAt: new Date().toISOString() };
    groups[index] = newGroup;
    this.saveGroups(groups);
    return newGroup;
  },

  deleteGroup(id: string): void {
    const groups = this.getGroups().filter((g) => g.id !== id);
    this.saveGroups(groups);
  },

  joinGroup(groupId: string): void {
    const groups = this.getGroups();
    const group = groups.find((g) => g.id === groupId);
    if (group && group.memberCount < group.maxMembers) {
      group.memberCount += 1;
      this.saveGroups(groups);
    }
  },

  // Messages
  getMessages(): Record<string, Message[]> {
    return getItem<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  },

  getGroupMessages(groupId: string): Message[] {
    const all = this.getMessages();
    return all[groupId] || [];
  },

  sendMessage(groupId: string, user: User, content: string, mediaUrl?: string): Message {
    const all = this.getMessages();
    const groupMsgs = all[groupId] || [];

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      userId: user.id,
      userName: user.username,
      userAvatar: user.photos[0]?.url,
      userGender: user.gender,
      userIsVerified: user.isVerified,
      groupId,
      content,
      mediaUrl,
      createdAt: new Date().toISOString(),
    };

    groupMsgs.push(newMsg);
    all[groupId] = groupMsgs;
    setItem(STORAGE_KEYS.MESSAGES, all);

    return newMsg;
  },
};
