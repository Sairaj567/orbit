process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ||
  'postgresql://orbit:orbit_secret@localhost:5432/orbit_test?schema=public';

process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'mock_openai_api_key';
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 'mock_clerk_secret_key';
process.env.CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || 'mock_clerk_pub_key';
process.env.CLERK_WEBHOOK_SECRET =
  process.env.CLERK_WEBHOOK_SECRET || 'whsec_C2Fyc29uY2l0eTExMTExMTExMTExMTExMTExMTExMTE=';
