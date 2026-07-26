import type { PrismaService } from '../../src/prisma/prisma.service';

export async function assertTestDatabaseSafety(prisma: PrismaService): Promise<void> {
  const result = await prisma.$queryRaw<
    Array<{ current_database: string }>
  >`SELECT current_database();`;
  const currentDb = result[0]?.current_database;

  console.log(`[SAFETY CHECK] Connected to database: "${currentDb}"`);

  if (currentDb !== 'orbit_test') {
    throw new Error(
      `FATAL SAFETY VIOLATION: Test database connection points to '${currentDb}' instead of 'orbit_test'. Aborting execution to prevent data loss.`,
    );
  }
}

export async function resetTestDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Activity", "Task", "Resource", "Note", "ProjectMember", "Project", "WorkspaceMember", "Workspace", "User" CASCADE;',
  );
}
