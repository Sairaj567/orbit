interface EnvConfig {
  apiUrl: string;
  wsUrl: string;
  isProd: boolean;
}

function readValue(key: keyof ImportMetaEnv, devFallback?: string): string {
  const value = import.meta.env[key];

  if (value && value.trim().length > 0) {
    return value;
  }

  // In production builds, required variables must not rely on dev fallbacks
  if (import.meta.env.PROD && devFallback === undefined) {
    throw new Error(`[Env Config Error] Missing required environment variable: ${key}`);
  }

  return devFallback ?? '';
}

const isProd = import.meta.env.PROD;

export const env: EnvConfig = {
  apiUrl: readValue('VITE_API_URL', isProd ? '' : 'http://localhost:3001'),
  wsUrl: readValue('VITE_WS_URL', isProd ? '' : 'ws://localhost:3001'),
  isProd,
};
