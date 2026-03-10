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

  // ─── BRANCHES (keep as is) ─────────────────────────
  let branchA = await prisma.branch.findFirst({ where: { name: 'Branch A - Main Office' } });
  if (!branchA) branchA = await prisma.branch.create({ data: { name: 'Branch A - Main Office', location: 'City Centre' } });
  let branchB = await prisma.branch.findFirst({ where: { name: 'Branch B - Site Office' } });
  if (!branchB) branchB = await prisma.branch.create({ data: { name: 'Branch B - Site Office', location: 'Industrial Area' } });

  // ─── USERS: 1 admin, 2 managers, 4 staff ───────────
  await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@company.com', passwordHash: hash, role: 'SUPER_ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'manager-a@company.com' },
    update: {},
    create: { name: 'Branch A Manager', email: 'manager-a@company.com', passwordHash: hash, role: 'BRANCH_MANAGER', branchId: branchA.id },
  });
  await prisma.user.upsert({
    where: { email: 'manager-b@company.com' },
    update: {},
    create: { name: 'Branch B Manager', email: 'manager-b@company.com', passwordHash: hash, role: 'BRANCH_MANAGER', branchId: branchB.id },
  });
  const staffEmails = [
    { name: 'Staff A1', email: 'staff-a1@company.com', branchId: branchA.id },
    { name: 'Staff A2', email: 'staff-a2@company.com', branchId: branchA.id },
    { name: 'Staff B1', email: 'staff-b1@company.com', branchId: branchB.id },
    { name: 'Staff B2', email: 'staff-b2@company.com', branchId: branchB.id },
  ];
  for (const s of staffEmails) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { name: s.name, email: s.email, passwordHash: hash, role: 'STAFF', branchId: s.branchId },
    });
  }

  // ─── CLIENTS (more) ────────────────────────────────
  const clientData = [
    { name: 'Rajesh Constructions', phone: '9876543210', email: 'rajesh@constructions.in' },
    { name: 'Metro Developers', phone: '9123456789', email: 'contact@metrodev.com' },
    { name: 'City Infrastructure Ltd', phone: '9988776655', email: 'info@cityinfra.com' },
    { name: 'Green Valley Builders', phone: '9876501234', email: 'projects@greenvalley.in' },
    { name: 'Prime Housing Pvt Ltd', phone: '9123409876', email: 'sales@primehousing.com' },
    { name: 'Skyline Constructions', phone: '9988123456', email: 'enquiry@skyline.co' },
    { name: 'Heritage Developers', phone: '9876512345', email: 'heritage@dev.in' },
    { name: 'Tech Park Estates', phone: '9123450123', email: 'techpark@estates.com' },
    { name: 'Riverside Projects', phone: '9988765432', email: 'riverside@projects.in' },
    { name: 'Summit Builders', phone: '9876598765', email: 'summit@builders.com' },
  ];
  const clients = [];
  for (const c of clientData) {
    const existing = await prisma.client.findFirst({ where: { name: c.name } });
    clients.push(existing || await prisma.client.create({ data: c }));
  }

  // ─── PROJECTS (more, varied status) ─────────────────
  const projectData = [
    { name: 'Sample Project A', clientName: 'Rajesh Constructions', branch: branchA, status: 'ACTIVE', contractValue: 50_00_000 },
    { name: 'Sample Project B', clientName: 'Metro Developers', branch: branchB, status: 'ACTIVE', contractValue: 75_00_000 },
    { name: 'Green Valley Phase 1', clientName: 'Green Valley Builders', branch: branchA, status: 'ACTIVE', contractValue: 1_20_00_000 },
    { name: 'Prime Towers', clientName: 'Prime Housing Pvt Ltd', branch: branchA, status: 'ON_HOLD', contractValue: 2_50_00_000 },
    { name: 'Skyline Heights', clientName: 'Skyline Constructions', branch: branchB, status: 'ACTIVE', contractValue: 95_00_000 },
    { name: 'Heritage Residency', clientName: 'Heritage Developers', branch: branchA, status: 'COMPLETED', contractValue: 80_00_000 },
    { name: 'Tech Park Block C', clientName: 'Tech Park Estates', branch: branchB, status: 'ACTIVE', contractValue: 1_80_00_000 },
    { name: 'Riverside Villa', clientName: 'Riverside Projects', branch: branchB, status: 'ENQUIRY', contractValue: 45_00_000 },
    { name: 'Summit Commercial', clientName: 'Summit Builders', branch: branchA, status: 'ACTIVE', contractValue: 3_00_00_000 },
  ];
  const projects = [];
  for (const p of projectData) {
    const client = clients.find((c) => c.name === p.clientName) || clients[0];
    const existing = await prisma.project.findFirst({ where: { name: p.name } });
    if (!existing) {
      const proj = await prisma.project.create({
        data: {
          name: p.name,
          clientId: client.id,
          branchId: p.branch.id,
          status: p.status,
          contractValue: p.contractValue,
          startDate: new Date(),
        },
      });
      projects.push(proj);
    }
  }
  const allProjects = await prisma.project.findMany({ orderBy: { id: 'asc' } });

  // ─── MATERIALS (more) ───────────────────────────────
  const materialData = [
    { name: 'Cement', unit: 'bags', currentStock: 500, minThreshold: 50 },
    { name: 'Steel', unit: 'MT', currentStock: 10, minThreshold: 2 },
    { name: 'Sand', unit: 'cubic ft', currentStock: 200, minThreshold: 30 },
    { name: 'Bricks', unit: 'nos', currentStock: 5000, minThreshold: 500 },
    { name: 'Paint', unit: 'litres', currentStock: 100, minThreshold: 20 },
    { name: 'Gravel', unit: 'cubic ft', currentStock: 350, minThreshold: 40 },
    { name: 'Tiles', unit: 'sq ft', currentStock: 1200, minThreshold: 100 },
    { name: 'Wood', unit: 'cubic ft', currentStock: 80, minThreshold: 10 },
    { name: 'Glass', unit: 'sq ft', currentStock: 200, minThreshold: 25 },
    { name: 'Insulation', unit: 'rolls', currentStock: 60, minThreshold: 15 },
  ];
  const materials = [];
  for (const m of materialData) {
    const created = await prisma.material.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    });
    materials.push(created);
  }

  // ─── ASSOCIATES (more) ─────────────────────────────
  const associateData = [
    { name: 'SK Electricals', workType: 'Electrical', phone: '9876111111' },
    { name: 'RK Plumbing Works', workType: 'Plumbing', phone: '9876222222' },
    { name: 'Fast Interiors', workType: 'Interior', phone: '9876333333' },
    { name: 'Safe Elevators Ltd', workType: 'Elevator', phone: '9876444444' },
    { name: 'Cool Air HVAC', workType: 'HVAC', phone: '9876555555' },
    { name: 'Secure Fire Systems', workType: 'Fire Safety', phone: '9876666666' },
    { name: 'Green Landscaping', workType: 'Landscaping', phone: '9876777777' },
    { name: 'Pro Painting Co', workType: 'Painting', phone: '9876888888' },
  ];
  const associates = [];
  for (const a of associateData) {
    const found = await prisma.associate.findFirst({ where: { name: a.name } });
    associates.push(found || await prisma.associate.create({ data: a }));
  }

  // ─── PAYMENT STAGES + RECEIPTS (for all projects so every project has demo data) ─
  for (let i = 0; i < allProjects.length; i++) {
    const project = allProjects[i];
    const existingStages = await prisma.paymentStage.findMany({ where: { projectId: project.id } });
    if (existingStages.length > 0) continue;
    const cv = Number(project.contractValue);
    const stages = await Promise.all([
      prisma.paymentStage.create({
        data: { projectId: project.id, stageName: 'Stage 1 - Advance', stageNumber: 1, expectedAmount: cv * 0.2, dueDate: new Date(), status: 'PAID' },
      }),
      prisma.paymentStage.create({
        data: { projectId: project.id, stageName: 'Stage 2 - Foundation', stageNumber: 2, expectedAmount: cv * 0.25, dueDate: new Date(), status: 'PARTIALLY_PAID' },
      }),
      prisma.paymentStage.create({
        data: { projectId: project.id, stageName: 'Stage 3 - Structure', stageNumber: 3, expectedAmount: cv * 0.3, dueDate: new Date(), status: 'PENDING' },
      }),
    ]);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    await prisma.paymentReceipt.create({
      data: { paymentStageId: stages[0].id, amount: cv * 0.2, receivedDate: startOfMonth, paymentMode: 'BANK_TRANSFER', referenceNo: 'INV-001' },
    });
    await prisma.paymentReceipt.create({
      data: { paymentStageId: stages[1].id, amount: cv * 0.1, receivedDate: now, paymentMode: 'CHEQUE', referenceNo: 'CHQ-001' },
    });
    await prisma.paymentReceipt.create({
      data: { paymentStageId: stages[1].id, amount: cv * 0.08, receivedDate: now, paymentMode: 'UPI', referenceNo: 'UPI-001' },
    });
  }

  // ─── LABOUR PAYMENTS (for all projects) ─────────────
  for (const project of allProjects) {
    const count = await prisma.labourPayment.count({ where: { projectId: project.id } });
    if (count > 0) continue;
    const payDate = new Date();
    await prisma.labourPayment.createMany({
      data: [
        { projectId: project.id, workerName: 'Ramesh Kumar', workType: 'Mason', days: 20, ratePerDay: 800, totalAmount: 16000, paidAmount: 10000, status: 'PARTIALLY_PAID', paymentDate: payDate, paymentMode: 'CASH' },
        { projectId: project.id, workerName: 'Suresh Singh', workType: 'Labour', days: 30, ratePerDay: 500, totalAmount: 15000, paidAmount: 15000, status: 'PAID', paymentDate: payDate, paymentMode: 'UPI' },
        { projectId: project.id, workerName: 'Vijay Patel', workType: 'Carpenter', days: 15, ratePerDay: 1000, totalAmount: 15000, paidAmount: 0, status: 'PENDING' },
        { projectId: project.id, workerName: 'Anil Sharma', workType: 'Electrician', days: 10, ratePerDay: 1200, totalAmount: 12000, paidAmount: 5000, status: 'PARTIALLY_PAID', paymentDate: payDate, paymentMode: 'BANK_TRANSFER' },
        { projectId: project.id, workerName: 'Deepak Roy', workType: 'Plumber', days: 12, ratePerDay: 900, totalAmount: 10800, paidAmount: 0, status: 'PENDING' },
      ],
    });
  }

  // ─── MATERIAL ITEMS (purchases for all projects) ────
  const cement = materials.find((m) => m.name === 'Cement');
  const bricks = materials.find((m) => m.name === 'Bricks');
  if (cement && bricks) {
    const numProjects = allProjects.length;
    for (const project of allProjects) {
      const count = await prisma.materialItem.count({ where: { projectId: project.id } });
      if (count > 0) continue;
      await prisma.materialItem.create({
        data: { projectId: project.id, materialId: cement.id, type: 'PURCHASE', quantity: 100, ratePerUnit: 400, totalCost: 40000, supplierName: 'Cement Corp', date: new Date() },
      });
      await prisma.materialItem.create({
        data: { projectId: project.id, materialId: bricks.id, type: 'PURCHASE', quantity: 5000, ratePerUnit: 8, totalCost: 40000, supplierName: 'Brick Works', date: new Date() },
      });
    }
    await prisma.material.update({ where: { id: cement.id }, data: { currentStock: Number(cement.currentStock) + 100 * numProjects } });
    await prisma.material.update({ where: { id: bricks.id }, data: { currentStock: Number(bricks.currentStock) + 5000 * numProjects } });
  }

  // ─── ASSOCIATE PAYMENTS + TRANSACTIONS (for all projects) ───────────────
  for (let i = 0; i < allProjects.length; i++) {
    const project = allProjects[i];
    const count = await prisma.associatePayment.count({ where: { projectId: project.id } });
    if (count > 0) continue;
    const assoc = associates[i % associates.length];
    const assoc2 = associates[(i + 2) % associates.length];
    const pay = await prisma.associatePayment.create({
      data: { projectId: project.id, associateId: assoc.id, scopeOfWork: 'Full scope as per contract', agreedAmount: 150000, paidAmount: 50000, status: 'PARTIALLY_PAID' },
    });
    await prisma.associateTransaction.create({
      data: { associatePaymentId: pay.id, amount: 50000, paidDate: new Date(), paymentMode: 'BANK_TRANSFER', referenceNo: 'AP-001' },
    });
    const pay2 = await prisma.associatePayment.create({
      data: { projectId: project.id, associateId: assoc2.id, scopeOfWork: 'HVAC installation', agreedAmount: 220000, paidAmount: 0, status: 'PENDING' },
    });
  }

  // ─── BILLS + BILL PAYMENTS (for all projects) ───────────────────────────
  for (const project of allProjects) {
    const count = await prisma.bill.count({ where: { projectId: project.id } });
    if (count > 0) continue;
    const bill = await prisma.bill.create({
      data: {
        projectId: project.id,
        type: 'PAYABLE',
        partyName: 'ABC Suppliers',
        billNumber: `BL-${project.id}-001`,
        billDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalAmount: 75000,
        paidAmount: 25000,
        status: 'PARTIALLY_PAID',
        description: 'Construction materials',
      },
    });
    await prisma.billPayment.create({
      data: { billId: bill.id, amount: 25000, paidDate: new Date(), paymentMode: 'CHEQUE', referenceNo: 'BP-001' },
    });
    const bill2 = await prisma.bill.create({
      data: {
        projectId: project.id,
        type: 'PAYABLE',
        partyName: 'Steel & Hardware Co',
        billNumber: `BL-${project.id}-002`,
        billDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        totalAmount: 120000,
        paidAmount: 40000,
        status: 'PARTIALLY_PAID',
        description: 'Steel and hardware supplies',
      },
    });
    await prisma.billPayment.create({
      data: { billId: bill2.id, amount: 40000, paidDate: new Date(), paymentMode: 'BANK_TRANSFER', referenceNo: 'BP-002' },
    });
  }
  if (!(await prisma.bill.findFirst({ where: { billNumber: 'RC-001' } }))) {
    await prisma.bill.create({
      data: {
        projectId: null,
        type: 'RECEIVABLE',
        partyName: 'Misc Client',
        billNumber: 'RC-001',
        billDate: new Date(),
        totalAmount: 50000,
        paidAmount: 0,
        status: 'PENDING',
      },
    });
  }

  // ─── OTHER EXPENSES (for all projects) ─────────────────────────────────
  for (let i = 0; i < allProjects.length; i++) {
    const project = allProjects[i];
    const count = await prisma.otherExpense.count({ where: { projectId: project.id } });
    if (count > 0) continue;
    await prisma.otherExpense.createMany({
      data: [
        { projectId: project.id, description: 'Site permit and clearance', amount: 15000, date: new Date(), paymentMode: 'BANK_TRANSFER' },
        { projectId: project.id, description: 'Temporary electricity', amount: 8000, date: new Date(), paymentMode: 'CASH' },
      ],
    });
  }

  await prisma.$disconnect();
}
