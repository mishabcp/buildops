import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';

function toNum(d) {
  if (d == null) return 0;
  return Number(d);
}

function getProjectWhere(req) {
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const userBranchId = req.user.branchId;
  const branchIdParam = req.query.branchId != null && req.query.branchId !== '' ? Number(req.query.branchId) : null;
  if (isSuperAdmin && branchIdParam != null && !Number.isNaN(branchIdParam)) {
    return { branchId: branchIdParam };
  }
  if (!isSuperAdmin && userBranchId != null) {
    return { branchId: userBranchId };
  }
  return {};
}

export async function getDashboard(req, res) {
  try {
    const projectWhere = getProjectWhere(req);
    const projectIds = (
      await prisma.project.findMany({
        where: projectWhere,
        select: { id: true },
      })
    ).map((p) => p.id);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [activeCount, stagesWithReceipts, labourPayments, associatePayments, billsPayable, materials, recentProjects] = await Promise.all([
      prisma.project.count({ where: { ...projectWhere, status: 'ACTIVE' } }),
      prisma.paymentStage.findMany({
        where: { projectId: { in: projectIds } },
        include: { receipts: true },
      }),
      projectIds.length ? prisma.labourPayment.findMany({ where: { projectId: { in: projectIds } } }) : [],
      projectIds.length ? prisma.associatePayment.findMany({ where: { projectId: { in: projectIds } } }) : [],
      prisma.bill.findMany({
        where: {
          type: 'PAYABLE',
          OR: [{ projectId: null }, { projectId: { in: projectIds } }],
        },
        include: { payments: true },
      }),
      prisma.material.findMany(),
      prisma.project.findMany({
        where: projectWhere,
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { client: true, branch: true },
      }),
    ]);

    let totalReceivedThisMonth = 0;
    let totalOutstandingFromClients = 0;
    for (const stage of stagesWithReceipts) {
      const expected = toNum(stage.expectedAmount);
      const received = stage.receipts.reduce((s, r) => s + toNum(r.amount), 0);
      totalOutstandingFromClients += expected - received;
      for (const r of stage.receipts) {
        const d = new Date(r.receivedDate);
        if (d >= startOfMonth && d <= now) totalReceivedThisMonth += toNum(r.amount);
      }
    }

    const totalPendingToLabour = labourPayments.reduce((s, l) => s + Math.max(0, toNum(l.totalAmount) - toNum(l.paidAmount)), 0);
    const totalPendingToAssociates = associatePayments.reduce((s, a) => s + Math.max(0, toNum(a.agreedAmount) - toNum(a.paidAmount)), 0);
    const totalPendingToVendors = billsPayable.reduce((s, b) => {
      const paid = b.payments.reduce((p, x) => p + toNum(x.amount), 0);
      return s + Math.max(0, toNum(b.totalAmount) - paid);
    }, 0);

    const lowStockMaterials = materials.filter((m) => toNum(m.currentStock) < toNum(m.minThreshold));

    return success(res, {
      activeProjects: activeCount,
      totalReceivedThisMonth,
      totalOutstandingFromClients,
      totalPendingToVendors,
      totalPendingToLabour,
      totalPendingToAssociates,
      lowStockMaterials,
      recentProjects,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return error(res, 'Failed to load dashboard', 500);
  }
}
