import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const requiredVars: string[] = ['DATABASE_URL'];

  const missingVars = requiredVars.filter(
    (key) => !config[key] || (typeof config[key] === 'string' && config[key] === ''),
  );

  if (missingVars.length > 0) {
    const message = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error(message);
    throw new Error(message);
  }

  const optionalVars = [
    'CLERK_SECRET_KEY',
    'DISCORD_BOT_TOKEN',
    'R2_ACCOUNT_ID',
  ];

  const missingOptional = optionalVars.filter(
    (key) => !config[key] || (typeof config[key] === 'string' && config[key] === ''),
  );

  if (missingOptional.length > 0) {
    logger.warn(`Optional environment variables not set: ${missingOptional.join(', ')}`);
  }

  return config;
}
