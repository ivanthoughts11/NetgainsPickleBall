import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.court.upsert({
    where: { id: 'net-gains-court-1' },
    update: { name: 'Net Gains Court 1', active: true },
    create: { id: 'net-gains-court-1', name: 'Net Gains Court 1', description: 'Tournament-grade pickleball court.' }
  });
  console.log('Net Gains Court 1 ready.');
}
main().finally(() => prisma.$disconnect());
