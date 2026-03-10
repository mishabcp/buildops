import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

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

export async function getProjectPl(req, res) {
  try {
    const projectWhere = getProjectWhere(req);
    let where = { ...projectWhere };
    const dateRange = req.query.dateRange;
    if (dateRange && typeof dateRange === 'string') {
      const parts = dateRange.split(',').map((s) => s?.trim());
      if (parts[0]) {
        const startDate = new Date(parts[0]);
        if (!Number.isNaN(startDate.getTime())) where.startDate = { gte: startDate };
      }
      if (parts[1]) {
        const endDate = new Date(parts[1]);
        if (!Number.isNaN(endDate.getTime())) where.estimatedEndDate = { lte: endDate };
      }
    }
    const projects = await prisma.project.findMany({
      where,
      include: {
        client: true,
        branch: true,
        paymentStages: { include: { receipts: true } },
        labourPayments: true,
        materialItems: true,
        associatePayments: true,
        bills: true,
        otherExpenses: true,
      },
    });
    const rows = projects.map((p) => {
      const contractValue = toNum(p.contractValue);
      const totalReceived = p.paymentStages.reduce(
        (s, st) => s + st.receipts.reduce((r, rec) => r + toNum(rec.amount), 0),
        0
      );
      const labour = p.labourPayments.reduce((s, l) => s + toNum(l.totalAmount), 0);
      const materials = p.materialItems.filter((i) => i.type === 'PURCHASE').reduce((s, i) => s + toNum(i.totalCost ?? 0), 0);
      const associates = p.associatePayments.reduce((s, a) => s + toNum(a.agreedAmount), 0);
      const billsPayable = p.bills.filter((b) => b.type === 'PAYABLE').reduce((s, b) => s + toNum(b.totalAmount), 0);
      const other = p.otherExpenses.reduce((s, e) => s + toNum(e.amount), 0);
      const totalExpenses = labour + materials + associates + billsPayable + other;
      const profitLoss = contractValue - totalExpenses;
      return {
        projectId: p.id,
        projectName: p.name,
        clientName: p.client?.name ?? '—',
        branchName: p.branch?.name ?? '—',
        contractValue,
        totalReceived,
        totalExpenses,
        profitLoss,
      };
    });
    return success(res, rows);
  } catch (err) {
    console.error('Project P&L report error:', err);
    return error(res, 'Failed to get report', 500);
  }
}

export async function getPaymentCollection(req, res) {
  try {
    const projectWhere = getProjectWhere(req);
    const projectIds = (await prisma.project.findMany({ where: projectWhere, select: { id: true } })).map((p) => p.id);
    const month = req.query.month != null ? Number(req.query.month) : new Date().getMonth() + 1;
    const year = req.query.year != null ? Number(req.query.year) : new Date().getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const receipts = await prisma.paymentReceipt.findMany({
      where: {
        paymentStage: { projectId: { in: projectIds } },
        receivedDate: { gte: start, lte: end },
      },
      include: { paymentStage: { include: { project: true } } },
      orderBy: { receivedDate: 'asc' },
    });
    const rows = receipts.map((r) => ({
      id: r.id,
      receivedDate: r.receivedDate,
      projectName: r.paymentStage?.project?.name ?? '—',
      stageName: r.paymentStage?.stageName ?? '—',
      amount: toNum(r.amount),
      paymentMode: r.paymentMode,
    }));
    return success(res, { month, year, rows });
  } catch (err) {
    console.error('Payment collection report error:', err);
    return error(res, 'Failed to get report', 500);
  }
}

export async function getPendingBills(req, res) {
  try {
    const projectWhere = getProjectWhere(req);
    const projectIds = (await prisma.project.findMany({ where: projectWhere, select: { id: true } })).map((p) => p.id);
    const bills = await prisma.bill.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        OR: [{ projectId: null }, { projectId: { in: projectIds } }],
      },
      include: { project: true, payments: true },
    });
    const rows = bills.map((b) => {
      const total = toNum(b.totalAmount);
      const paid = b.payments?.reduce((s, p) => s + toNum(p.amount), 0) ?? 0;
      return {
        id: b.id,
        type: b.type,
        partyName: b.partyName,
        billNumber: b.billNumber,
        billDate: b.billDate,
        totalAmount: total,
        paidAmount: paid,
        balance: total - paid,
        status: b.status,
        projectName: b.project?.name ?? '—',
      };
    });
    return success(res, rows);
  } catch (err) {
    console.error('Pending bills report error:', err);
    return error(res, 'Failed to get report', 500);
  }
}

export async function getLabourCost(req, res) {
  try {
    const projectWhere = getProjectWhere(req);
    const projects = await prisma.project.findMany({
      where: projectWhere,
      include: { labourPayments: true, client: true, branch: true },
    });
    const rows = projects.map((p) => {
      const totalLabourCost = p.labourPayments.reduce((s, l) => s + toNum(l.totalAmount), 0);
      return {
        projectId: p.id,
        projectName: p.name,
        clientName: p.client?.name ?? '—',
        branchName: p.branch?.name ?? '—',
        totalLabourCost,
        entriesCount: p.labourPayments.length,
      };
    });
    return success(res, rows);
  } catch (err) {
    console.error('Labour cost report error:', err);
    return error(res, 'Failed to get report', 500);
  }
}

export async function getMaterialUsage(req, res) {
  try {
    const projectWhere = getProjectWhere(req);
    const projectIds = (await prisma.project.findMany({ where: projectWhere, select: { id: true } })).map((p) => p.id);
    const items = await prisma.materialItem.findMany({
      where: { projectId: { in: projectIds }, type: 'USAGE' },
      include: { material: true, project: true },
    });
    const byMaterial = {};
    for (const i of items) {
      const name = i.material?.name ?? 'Unknown';
      if (!byMaterial[name]) byMaterial[name] = { materialName: name, unit: i.material?.unit ?? '—', totalQuantity: 0, projectCount: new Set() };
      byMaterial[name].totalQuantity += toNum(i.quantity);
      byMaterial[name].projectCount.add(i.projectId);
    }
    const rows = Object.values(byMaterial).map((m) => ({
      materialName: m.materialName,
      unit: m.unit,
      totalQuantity: m.totalQuantity,
      projectCount: m.projectCount.size,
    }));
    return success(res, rows);
  } catch (err) {
    console.error('Material usage report error:', err);
    return error(res, 'Failed to get report', 500);
  }
}

async function getReportData(reportType, req) {
  const projectWhere = getProjectWhere(req);
  const projectIds = (await prisma.project.findMany({ where: projectWhere, select: { id: true } })).map((p) => p.id);
  switch (reportType) {
    case 'project-pl': {
      const projects = await prisma.project.findMany({
        where: projectWhere,
        include: {
          client: true,
          branch: true,
          paymentStages: { include: { receipts: true } },
          labourPayments: true,
          materialItems: true,
          associatePayments: true,
          bills: true,
          otherExpenses: true,
        },
      });
      return projects.map((p) => {
        const contractValue = toNum(p.contractValue);
        const totalReceived = p.paymentStages.reduce(
          (s, st) => s + st.receipts.reduce((r, rec) => r + toNum(rec.amount), 0),
          0
        );
        const totalExpenses =
          p.labourPayments.reduce((s, l) => s + toNum(l.totalAmount), 0) +
          p.materialItems.filter((i) => i.type === 'PURCHASE').reduce((s, i) => s + toNum(i.totalCost ?? 0), 0) +
          p.associatePayments.reduce((s, a) => s + toNum(a.agreedAmount), 0) +
          p.bills.filter((b) => b.type === 'PAYABLE').reduce((s, b) => s + toNum(b.totalAmount), 0) +
          p.otherExpenses.reduce((s, e) => s + toNum(e.amount), 0);
        return {
          projectName: p.name,
          clientName: p.client?.name ?? '—',
          branchName: p.branch?.name ?? '—',
          contractValue,
          totalReceived,
          totalExpenses,
          profitLoss: contractValue - totalExpenses,
        };
      });
    }
    case 'payment-collection': {
      const month = req.query.month != null ? Number(req.query.month) : new Date().getMonth() + 1;
      const year = req.query.year != null ? Number(req.query.year) : new Date().getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const receipts = await prisma.paymentReceipt.findMany({
        where: {
          paymentStage: { projectId: { in: projectIds } },
          receivedDate: { gte: start, lte: end },
        },
        include: { paymentStage: { include: { project: true } } },
        orderBy: { receivedDate: 'asc' },
      });
      return receipts.map((r) => ({
        receivedDate: r.receivedDate,
        projectName: r.paymentStage?.project?.name ?? '—',
        stageName: r.paymentStage?.stageName ?? '—',
        amount: toNum(r.amount),
        paymentMode: r.paymentMode,
      }));
    }
    case 'pending-bills': {
      const bills = await prisma.bill.findMany({
        where: {
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
          OR: [{ projectId: null }, { projectId: { in: projectIds } }],
        },
        include: { project: true, payments: true },
      });
      return bills.map((b) => {
        const total = toNum(b.totalAmount);
        const paid = b.payments?.reduce((s, p) => s + toNum(p.amount), 0) ?? 0;
        return {
          type: b.type,
          partyName: b.partyName,
          billNumber: b.billNumber,
          billDate: b.billDate,
          totalAmount: total,
          paidAmount: paid,
          balance: total - paid,
          status: b.status,
          projectName: b.project?.name ?? '—',
        };
      });
    }
    case 'labour-cost': {
      const projects = await prisma.project.findMany({
        where: projectWhere,
        include: { labourPayments: true, client: true, branch: true },
      });
      return projects.map((p) => ({
        projectName: p.name,
        clientName: p.client?.name ?? '—',
        branchName: p.branch?.name ?? '—',
        totalLabourCost: p.labourPayments.reduce((s, l) => s + toNum(l.totalAmount), 0),
        entriesCount: p.labourPayments.length,
      }));
    }
    case 'material-usage': {
      const items = await prisma.materialItem.findMany({
        where: { projectId: { in: projectIds }, type: 'USAGE' },
        include: { material: true },
      });
      const byMaterial = {};
      for (const i of items) {
        const name = i.material?.name ?? 'Unknown';
        if (!byMaterial[name]) byMaterial[name] = { materialName: name, unit: i.material?.unit ?? '—', totalQuantity: 0 };
        byMaterial[name].totalQuantity += toNum(i.quantity);
      }
      return Object.values(byMaterial).map((m) => ({
        materialName: m.materialName,
        unit: m.unit,
        totalQuantity: m.totalQuantity,
      }));
    }
    default:
      return null;
  }
}

function formatDate(d) {
  if (!d) return '—';
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? '—' : x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);
}

export async function exportPdf(req, res) {
  try {
    const report = req.query.report;
    const valid = ['project-pl', 'payment-collection', 'pending-bills', 'labour-cost', 'material-usage'];
    if (!report || !valid.includes(report)) {
      return error(res, 'Invalid report type', 400);
    }
    const data = await getReportData(report, req);
    const doc = new PDFDocument({ margin: 50 });
    const title = report.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report}.pdf"`);
    doc.pipe(res);
    doc.fontSize(18).text(`Report: ${title}`, { underline: true });
    doc.moveDown();
    if (!data || data.length === 0) {
      doc.text('No data for this report.');
      doc.end();
      return;
    }
    const keys = Object.keys(data[0]);
    doc.fontSize(10);
    for (const row of data) {
      for (const k of keys) {
        let v = row[k];
        if (v instanceof Date) v = formatDate(v);
        else if (typeof v === 'number' && /Amount|Value|Cost|Balance|Received|Labour|profit/i.test(k)) v = formatCurrency(v);
        else if (typeof v === 'number') v = String(v);
        doc.text(`${k}: ${v ?? '—'}`);
      }
      doc.moveDown(0.5);
    }
    doc.end();
  } catch (err) {
    console.error('PDF export error:', err);
    return error(res, 'Failed to export PDF', 500);
  }
}

export async function exportExcel(req, res) {
  try {
    const report = req.query.report;
    const valid = ['project-pl', 'payment-collection', 'pending-bills', 'labour-cost', 'material-usage'];
    if (!report || !valid.includes(report)) {
      return error(res, 'Invalid report type', 400);
    }
    const data = await getReportData(report, req);
    const workbook = new ExcelJS.Workbook();
    const title = report.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const sheet = workbook.addWorksheet(title.substring(0, 31), { headerFooter: { firstHeader: title } });
    if (!data || data.length === 0) {
      sheet.addRow(['No data for this report.']);
    } else {
      const keys = Object.keys(data[0]);
      sheet.addRow(keys.map((k) => k.replace(/([A-Z])/g, ' $1').trim()));
      for (const row of data) {
        sheet.addRow(keys.map((k) => (row[k] instanceof Date ? formatDate(row[k]) : row[k] ?? '')));
      }
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${report}.xlsx"`);
    await workbook.xlsx.write(res);
  } catch (err) {
    console.error('Excel export error:', err);
    return error(res, 'Failed to export Excel', 500);
  }
}
