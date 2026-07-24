export interface User {
  id: string;
  clerkId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  xp: number;
  level: number;
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
