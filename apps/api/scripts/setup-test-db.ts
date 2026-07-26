import { PrismaClient } from '@prisma/client';

async function main() {
  const adminUrl = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/postgres';
  const testUrl =
    process.env.DATABASE_URL_TEST || 'postgresql://postgres@localhost:5432/orbit_test';

  const adminClient = new PrismaClient({
    datasources: {
      db: { url: adminUrl },
    },
  });

  try {
    await adminClient.$executeRawUnsafe('DROP DATABASE IF EXISTS orbit_test WITH (FORCE);');
    await adminClient.$executeRawUnsafe('CREATE DATABASE orbit_test;');
    console.log('Database orbit_test created successfully.');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('Database creation notice:', msg);
  } finally {
    await adminClient.$disconnect();
  }

  const testClient = new PrismaClient({
    datasources: {
      db: { url: testUrl },
    },
  });

  try {
    const result = await testClient.$queryRaw`SELECT 1 as connected`;
    console.log('Test database connectivity test succeeded:', result);
  } finally {
    await testClient.$disconnect();
  }
}

main();
