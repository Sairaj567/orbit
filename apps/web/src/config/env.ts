interface EnvConfig {
  apiUrl: string;
  wsUrl: string;
  clerkPublishableKey: string;
  isProd: boolean;
}

function readValue(key: keyof ImportMetaEnv, fallback?: string): string {
  const value = import.meta.env[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env: EnvConfig = {
  apiUrl: readValue('VITE_API_URL', '/api'),
  wsUrl: readValue('VITE_WS_URL', 'ws://localhost:3001'),
  clerkPublishableKey: readValue('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_placeholder'),
  isProd: import.meta.env.PROD,
};