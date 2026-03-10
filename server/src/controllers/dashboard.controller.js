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

    // ─── Chart data: collections by month (last 6 months) ───
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` });
    }
    const collectionsByMonth = months.map(({ year, month, key }) => {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      let received = 0;
      for (const stage of stagesWithReceipts) {
        for (const r of stage.receipts) {
          const d = new Date(r.receivedDate);
          if (d >= start && d <= end) received += toNum(r.amount);
        }
      }
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return { month: key, label: `${monthNames[month]} ${year}`, received };
    });

    // ─── Chart data: project status counts ───
    const statusCounts = await prisma.project.groupBy({
      by: ['status'],
      where: projectWhere,
      _count: { id: true },
    });
    const projectStatusCounts = statusCounts.map((s) => ({ status: s.status, count: s._count.id }));

    // ─── Chart data: pending payables breakdown ───
    const pendingBreakdown = [
      { name: 'Vendors', value: totalPendingToVendors },
      { name: 'Labour', value: totalPendingToLabour },
      { name: 'Associates', value: totalPendingToAssociates },
    ].filter((x) => x.value > 0);

    // ─── Chart data: expense breakdown (actual spend) ───
    const labourSpend = labourPayments.reduce((s, l) => s + toNum(l.paidAmount), 0);
    const associateSpend = associatePayments.reduce((s, a) => s + toNum(a.paidAmount), 0);
    const billsPaid = billsPayable.reduce((s, b) => {
      const paid = b.payments.reduce((p, x) => p + toNum(x.amount), 0);
      return s + paid;
    }, 0);
    const otherExpenses = projectIds.length
      ? await prisma.otherExpense.aggregate({ where: { projectId: { in: projectIds } }, _sum: { amount: true } })
      : { _sum: { amount: 0 } };
    const materialSpend = projectIds.length
      ? (await prisma.materialItem.aggregate({ where: { projectId: { in: projectIds } }, _sum: { totalCost: true } }))._sum.totalCost ?? 0
      : 0;
    const expenseBreakdown = [
      { name: 'Labour', value: labourSpend },
      { name: 'Materials', value: toNum(materialSpend) },
      { name: 'Associates', value: associateSpend },
      { name: 'Bills paid', value: billsPaid },
      { name: 'Other', value: toNum(otherExpenses._sum?.amount) ?? 0 },
    ].filter((x) => x.value > 0);

    return success(res, {
      activeProjects: activeCount,
      totalReceivedThisMonth,
      totalOutstandingFromClients,
      totalPendingToVendors,
      totalPendingToLabour,
      totalPendingToAssociates,
      lowStockMaterials,
      recentProjects,
      collectionsByMonth,
      projectStatusCounts,
      pendingBreakdown,
      expenseBreakdown,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return error(res, 'Failed to load dashboard', 500);
  }
}
