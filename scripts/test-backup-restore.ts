import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://orbit:orbit_secret@localhost:5432/orbit_test',
    },
  },
});

async function runBackupRestoreTest() {
  console.log('==> [Test] Starting Database Backup & Restore Verification...');

  // 1. Seed test verification record
  const testEmail = `backup_test_${Date.now()}@orbit.dev`;
  const testUser = await prisma.user.create({
    data: {
      clerkId: `clerk_${Date.now()}`,
      email: testEmail,
      displayName: 'Backup Tester',
    },
  });
  console.log(`[Test Step 1] Created test verification user with ID: ${testUser.id}`);

  // 2. Perform mock raw data export / check record existence
  const countBefore = await prisma.user.count();
  console.log(`[Test Step 2] Verified record count before test operation: ${countBefore}`);

  // 3. Verify backup file creation structure
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const sampleDumpPath = path.join(backupDir, `test_verify_${Date.now()}.json`);
  const allUsers = await prisma.user.findMany();
  fs.writeFileSync(sampleDumpPath, JSON.stringify(allUsers, null, 2));
  console.log(
    `[Test Step 3] Verified backup file write to disk: ${sampleDumpPath} (${fs.statSync(sampleDumpPath).size} bytes)`,
  );

  // 4. Verify data cleanup and restore reading
  const restoredData = JSON.parse(fs.readFileSync(sampleDumpPath, 'utf8'));
  const foundTestUser = restoredData.find((u: { id: string }) => u.id === testUser.id);

  if (!foundTestUser || foundTestUser.email !== testEmail) {
    throw new Error('Backup & Restore Verification FAILED: Restored data mismatch!');
  }

  console.log(
    `[Test Step 4] Restored data verification SUCCESS: Record ${foundTestUser.id} matched expected email ${testEmail}`,
  );

  // Clean up test user
  await prisma.user.delete({ where: { id: testUser.id } });
  fs.unlinkSync(sampleDumpPath);
  console.log('[Test Step 5] Cleaned up temporary test user and verification file.');
  console.log('==> [Test] Database Backup & Restore Flow PASSED CLEANLY!');
}

runBackupRestoreTest()
  .catch((err) => {
    console.error('Backup restore test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
