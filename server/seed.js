import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'admin123';

export async function runSeed() {
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  let branchA = await prisma.branch.findFirst({ where: { name: 'Branch A - Main Office' } });
  if (!branchA) branchA = await prisma.branch.create({ data: { name: 'Branch A - Main Office', location: 'City Centre' } });
  let branchB = await prisma.branch.findFirst({ where: { name: 'Branch B - Site Office' } });
  if (!branchB) branchB = await prisma.branch.create({ data: { name: 'Branch B - Site Office', location: 'Industrial Area' } });

  await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@company.com',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager-a@company.com' },
    update: {},
    create: {
      name: 'Branch A Manager',
      email: 'manager-a@company.com',
      passwordHash: hash,
      role: 'BRANCH_MANAGER',
      branchId: branchA.id,
    },
  });
  await prisma.user.upsert({
    where: { email: 'manager-b@company.com' },
    update: {},
    create: {
      name: 'Branch B Manager',
      email: 'manager-b@company.com',
      passwordHash: hash,
      role: 'BRANCH_MANAGER',
      branchId: branchB.id,
    },
  });

  let client1 = await prisma.client.findFirst({ where: { name: 'Rajesh Constructions' } });
  if (!client1) client1 = await prisma.client.create({ data: { name: 'Rajesh Constructions', phone: '9876543210' } });
  let client2 = await prisma.client.findFirst({ where: { name: 'Metro Developers' } });
  if (!client2) client2 = await prisma.client.create({ data: { name: 'Metro Developers', phone: '9123456789' } });
  if (!(await prisma.client.findFirst({ where: { name: 'City Infrastructure Ltd' } }))) {
    await prisma.client.create({ data: { name: 'City Infrastructure Ltd', phone: '9988776655' } });
  }

  const existingProjectA = await prisma.project.findFirst({ where: { name: 'Sample Project A' } });
  if (!existingProjectA) {
    await prisma.project.create({
      data: {
        name: 'Sample Project A',
        clientId: client1.id,
        branchId: branchA.id,
        status: 'ACTIVE',
        contractValue: 50_00_000,
        startDate: new Date(),
      },
    });
  }
  const existingProjectB = await prisma.project.findFirst({ where: { name: 'Sample Project B' } });
  if (!existingProjectB) {
    await prisma.project.create({
      data: {
        name: 'Sample Project B',
        clientId: client2.id,
        branchId: branchB.id,
        status: 'ACTIVE',
        contractValue: 75_00_000,
        startDate: new Date(),
      },
    });
  }

  const materials = [
    { name: 'Cement', unit: 'bags', currentStock: 500, minThreshold: 50 },
    { name: 'Steel', unit: 'MT', currentStock: 10, minThreshold: 2 },
    { name: 'Sand', unit: 'cubic ft', currentStock: 200, minThreshold: 30 },
    { name: 'Bricks', unit: 'nos', currentStock: 5000, minThreshold: 500 },
    { name: 'Paint', unit: 'litres', currentStock: 100, minThreshold: 20 },
  ];
  for (const m of materials) {
    await prisma.material.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    });
  }

  const associates = [
    { name: 'SK Electricals', workType: 'Electrical' },
    { name: 'RK Plumbing Works', workType: 'Plumbing' },
    { name: 'Fast Interiors', workType: 'Interior' },
  ];
  for (const a of associates) {
    const found = await prisma.associate.findFirst({ where: { name: a.name } });
    if (!found) await prisma.associate.create({ data: a });
  }

  await prisma.$disconnect();
}
