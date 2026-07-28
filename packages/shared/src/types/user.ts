export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  xp: number;
  level: number;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  soundsEnabled: boolean;
  animationsEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  reducedMotion: boolean;
  notificationsEnabled: boolean;
}
