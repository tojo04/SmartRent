import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// optional: clean shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
