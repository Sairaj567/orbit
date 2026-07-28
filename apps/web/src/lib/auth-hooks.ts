/**
 * Auth hooks abstraction layer.
 *
 * When AUTH_MODE=clerk: re-exports real Clerk hooks unchanged.
 * When AUTH_MODE=dev_bypass: returns fixed dev-user values,
 * removing the runtime dependency on ClerkProvider and real Clerk keys.
 */
import { env } from '@/config/env';

// ── Dev bypass fixed values ───────────────────────────────────────────────────

const DEV_AUTH = {
  isSignedIn: true as const,
  isLoaded: true as const,
  userId: 'dev_user_orbit',
  getToken: async () => 'dev_bypass_token',
};

const DEV_USER = {
  isLoaded: true as const,
  isSignedIn: true as const,
  user: {
    id: 'dev_user_orbit',
    fullName: 'Dev User',
    firstName: 'Dev',
    lastName: 'User',
    primaryEmailAddress: { emailAddress: 'dev@orbit.local' },
    imageUrl: null,
  },
};

// ── Exported hooks ────────────────────────────────────────────────────────────

let useAuth: () => {
  isSignedIn: boolean;
  isLoaded: boolean;
  userId: string;
  getToken: () => Promise<string>;
};

let useUser: () => {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: {
    id: string;
    fullName: string;
    firstName: string;
    lastName: string;
    primaryEmailAddress: { emailAddress: string } | null;
    imageUrl: string | null;
  } | null;
};

if (env.authMode === 'dev_bypass') {
  useAuth = () => DEV_AUTH;
  useUser = () => DEV_USER;
} else {
  // Dynamic import not needed — Vite will tree-shake the unused branch
  // at build time since env.authMode is a compile-time constant.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clerk = require('@clerk/clerk-react');
  useAuth = clerk.useAuth;
  useUser = clerk.useUser;
}

export { useAuth, useUser };
