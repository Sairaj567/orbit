import { Logger } from '@nestjs/common';
import { z } from 'zod';

const logger = new Logger('EnvValidation');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 3001)),

  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL environment variable is required' })
    .min(1, 'DATABASE_URL cannot be empty')
    .refine((url) => /^postgres(?:ql)?:\/\//i.test(url), {
      message: 'Invalid DATABASE_URL format. Must start with postgresql:// or postgres://',
    }),

  REDIS_URL: z
    .string()
    .optional()
    .refine((url) => !url || /^rediss?:\/\//i.test(url), {
      message: 'Invalid REDIS_URL format. Must start with redis:// or rediss://',
    }),

  CORS_ORIGIN: z.string().optional(),

  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('orbit-uploads'),
  R2_PUBLIC_URL: z.string().optional(),

  DISCORD_BOT_TOKEN: z.string().optional(),
  DISCORD_WEBHOOK_URL: z.string().optional(),
});

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('; ');
    const message = `[Environment Configuration Error] Validation failed: ${formattedErrors}`;
    logger.error(message);
    throw new Error(message);
  }

  const parsed = result.data;
  const isProd = parsed.NODE_ENV === 'production';

  // Strict Production Enforcement Rules
  if (isProd) {
    const missingProdSecrets: string[] = [];

    if (!parsed.CLERK_SECRET_KEY || parsed.CLERK_SECRET_KEY.trim() === '') {
      missingProdSecrets.push('CLERK_SECRET_KEY');
    }
    if (!parsed.CLERK_PUBLISHABLE_KEY || parsed.CLERK_PUBLISHABLE_KEY.trim() === '') {
      missingProdSecrets.push('CLERK_PUBLISHABLE_KEY');
    }
    if (!parsed.CLERK_WEBHOOK_SECRET || parsed.CLERK_WEBHOOK_SECRET.trim() === '') {
      missingProdSecrets.push('CLERK_WEBHOOK_SECRET');
    }
    if (!parsed.REDIS_URL || parsed.REDIS_URL.trim() === '') {
      missingProdSecrets.push('REDIS_URL');
    }
    if (!parsed.CORS_ORIGIN || parsed.CORS_ORIGIN.trim() === '') {
      missingProdSecrets.push('CORS_ORIGIN');
    }

    if (missingProdSecrets.length > 0) {
      const message = `[Production Environment Security Error] The following required variables are missing or empty in production mode (NODE_ENV=production): ${missingProdSecrets.join(
        ', ',
      )}`;
      logger.error(message);
      throw new Error(message);
    }
  } else {
    // Non-production warning for missing auth/integration keys
    const missingOptional: string[] = [];
    if (!parsed.CLERK_SECRET_KEY) missingOptional.push('CLERK_SECRET_KEY');
    if (!parsed.CLERK_WEBHOOK_SECRET) missingOptional.push('CLERK_WEBHOOK_SECRET');
    if (!parsed.OPENAI_API_KEY) missingOptional.push('OPENAI_API_KEY');

    if (missingOptional.length > 0) {
      logger.warn(`Dev mode optional environment variables not set: ${missingOptional.join(', ')}`);
    }
  }

  return config;
}
