import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const libPath = await prisma.$queryRaw<
    Array<{ dynamic_library_path: string }>
  >`SHOW dynamic_library_path;`;
  console.log('dynamic_library_path:', libPath);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
