export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-do-not-use-in-prod',
  },

  storage: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || 'orbit-uploads',
    publicUrl: process.env.R2_PUBLIC_URL,
  },

  discord: {
    botToken: process.env.DISCORD_BOT_TOKEN,
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
  },
});
