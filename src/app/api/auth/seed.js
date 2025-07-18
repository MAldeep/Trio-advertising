import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.adminUser.findUnique({ where: { username: 'admin' } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('trio123', 10);
    await prisma.adminUser.create({ data: { username: 'admin', passwordHash } });
    console.log('Seeded admin user: admin / trio123');
  } else {
    console.log('Admin user already exists.');
  }
  await prisma.$disconnect();
}

main(); 