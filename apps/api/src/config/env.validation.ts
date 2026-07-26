import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const requiredVars: string[] = ['DATABASE_URL'];

  const missingVars = requiredVars.filter(
    (key) =>
      !config[key] || (typeof config[key] === 'string' && (config[key] as string).trim() === ''),
  );

  if (missingVars.length > 0) {
    const message = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error(message);
    throw new Error(message);
  }

  // Validate DATABASE_URL connection string format
  const dbUrl = config['DATABASE_URL'] as string;
  if (!/^postgres(?:ql)?:\/\//i.test(dbUrl)) {
    const message = 'Invalid DATABASE_URL format. Must start with postgresql:// or postgres://';
    logger.error(message);
    throw new Error(message);
  }

  // Validate REDIS_URL format if provided
  const redisUrl = config['REDIS_URL'] as string;
  if (redisUrl && typeof redisUrl === 'string' && redisUrl.trim() !== '') {
    if (!/^rediss?:\/\//i.test(redisUrl)) {
      const message = 'Invalid REDIS_URL format. Must start with redis:// or rediss://';
      logger.error(message);
      throw new Error(message);
    }
  }

  // OPENAI_API_KEY is optional: a missing AI provider key should not prevent the API from serving non-AI endpoints.
  const optionalVars = [
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SECRET',
    'DATABASE_URL_TEST',
    'DISCORD_BOT_TOKEN',
    'R2_ACCOUNT_ID',
    'OPENAI_API_KEY',
    'REDIS_URL',
  ];

  const missingOptional = optionalVars.filter(
    (key) =>
      !config[key] || (typeof config[key] === 'string' && (config[key] as string).trim() === ''),
  );

  if (missingOptional.length > 0) {
    logger.warn(`Optional environment variables not set: ${missingOptional.join(', ')}`);
  }

  return config;
}
