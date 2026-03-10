import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';

function toNum(d) {
  if (d == null) return 0;
  return Number(d);
}

function getStatus(paid, total) {
  if (paid <= 0) return 'PENDING';
  if (paid >= total) return 'PAID';
  return 'PARTIALLY_PAID';
}

export async function list(req, res) {
  try {
    const { type, status, branchId, projectId } = req.query;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;

    const where = {};
    if (type === 'PAYABLE' || type === 'RECEIVABLE') where.type = type;
    if (status === 'PENDING' || status === 'PARTIALLY_PAID' || status === 'PAID') where.status = status;
    if (projectId != null && projectId !== '') {
      const pid = Number(projectId);
      if (!Number.isNaN(pid)) where.projectId = pid;
    }
    if (branchId != null && branchId !== '') {
      const bid = Number(branchId);
      if (!Number.isNaN(bid)) where.project = { branchId: bid };
    }
    if (!isSuperAdmin && userBranchId != null && !where.project) {
      where.OR = [{ projectId: null }, { project: { branchId: userBranchId } }];
    }

    const bills = await prisma.bill.findMany({
      where,
      include: { project: true, payments: { orderBy: { paidDate: 'desc' } } },
      orderBy: { billDate: 'desc' },
    });
    return success(res, bills);
  } catch (err) {
    console.error('Bill list error:', err);
    return error(res, 'Failed to list bills', 500);
  }
}

export async function create(req, res) {
  try {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    const { projectId, type, partyName, billNumber, billDate, dueDate, totalAmount, description } = req.body;
    if (!partyName || typeof partyName !== 'string' || !partyName.trim()) {
      return error(res, 'Party name is required', 400);
    }
    if (!type || (type !== 'PAYABLE' && type !== 'RECEIVABLE')) {
      return error(res, 'Type must be PAYABLE or RECEIVABLE', 400);
    }
    const total = totalAmount != null ? Number(totalAmount) : 0;
    if (Number.isNaN(total) || total < 0) return error(res, 'Valid total amount is required', 400);
    const projectIdNum = projectId != null && projectId !== '' ? Number(projectId) : null;
    if (projectIdNum != null && !Number.isNaN(projectIdNum)) {
      const project = await prisma.project.findUnique({ where: { id: projectIdNum } });
      if (!project) return error(res, 'Project not found', 400);
      if (!isSuperAdmin && userBranchId != null && project.branchId !== userBranchId) {
        return error(res, 'Forbidden', 403);
      }
    }
    const bill = await prisma.bill.create({
      data: {
        projectId: projectIdNum,
        type,
        partyName: partyName.trim(),
        billNumber: billNumber != null ? String(billNumber).trim() || null : null,
        billDate: billDate ? new Date(billDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        totalAmount: total,
        description: description != null ? String(description).trim() || null : null,
      },
      include: { project: true, payments: true },
    });
    return success(res, bill, 201);
  } catch (err) {
    console.error('Bill create error:', err);
    return error(res, 'Failed to create bill', 500);
  }
}

export async function getOne(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid bill id', 400);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: { project: true, payments: { orderBy: { paidDate: 'desc' } } },
    });
    if (!bill) return error(res, 'Bill not found', 404);
    if (!isSuperAdmin && userBranchId != null && bill.projectId != null && bill.project?.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    return success(res, bill);
  } catch (err) {
    console.error('Bill getOne error:', err);
    return error(res, 'Failed to get bill', 500);
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid bill id', 400);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!bill) return error(res, 'Bill not found', 404);
    if (!isSuperAdmin && userBranchId != null && bill.projectId != null && bill.project?.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    const { projectId, type, partyName, billNumber, billDate, dueDate, totalAmount, description } = req.body;
    const updates = {};
    if (projectId !== undefined) {
      const pid = projectId === '' || projectId == null ? null : Number(projectId);
      updates.projectId = Number.isNaN(pid) ? undefined : pid;
    }
    if (type !== undefined && (type === 'PAYABLE' || type === 'RECEIVABLE')) updates.type = type;
    if (partyName !== undefined) updates.partyName = String(partyName).trim();
    if (billNumber !== undefined) updates.billNumber = billNumber === '' || billNumber == null ? null : String(billNumber).trim();
    if (billDate !== undefined) updates.billDate = billDate ? new Date(billDate) : null;
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;
    if (totalAmount !== undefined) {
      const n = Number(totalAmount);
      if (!Number.isNaN(n) && n >= 0) updates.totalAmount = n;
    }
    if (description !== undefined) updates.description = description === '' || description == null ? null : String(description).trim();
    const paid = toNum(bill.paidAmount);
    const total = updates.totalAmount !== undefined ? updates.totalAmount : toNum(bill.totalAmount);
    updates.status = getStatus(paid, total);
    const updated = await prisma.bill.update({
      where: { id },
      data: updates,
      include: { project: true, payments: true },
    });
    return success(res, updated);
  } catch (err) {
    console.error('Bill update error:', err);
    return error(res, 'Failed to update bill', 500);
  }
}

export async function createPayment(req, res) {
  try {
    const billId = Number(req.params.id);
    if (Number.isNaN(billId)) return error(res, 'Invalid bill id', 400);
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { project: true },
    });
    if (!bill) return error(res, 'Bill not found', 404);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    if (!isSuperAdmin && userBranchId != null && bill.projectId != null && bill.project?.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    const { amount, paidDate, paymentMode, referenceNo, notes } = req.body;
    const amountNum = amount != null ? Number(amount) : NaN;
    if (Number.isNaN(amountNum) || amountNum <= 0) return error(res, 'Valid amount is required', 400);
    const validModes = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI'];
    if (!paymentMode || !validModes.includes(paymentMode)) {
      return error(res, 'Valid payment mode is required', 400);
    }
    const currentPaid = toNum(bill.paidAmount);
    const newPaid = currentPaid + amountNum;
    const total = toNum(bill.totalAmount);
    const status = getStatus(newPaid, total);
    const [payment, updated] = await prisma.$transaction([
      prisma.billPayment.create({
        data: {
          billId,
          amount: amountNum,
          paidDate: paidDate ? new Date(paidDate) : new Date(),
          paymentMode,
          referenceNo: referenceNo != null ? String(referenceNo).trim() || null : null,
          notes: notes != null ? String(notes).trim() || null : null,
        },
      }),
      prisma.bill.update({
        where: { id: billId },
        data: { paidAmount: newPaid, status },
        include: { project: true, payments: { orderBy: { paidDate: 'desc' } } },
      }),
    ]);
    return success(res, { payment, bill: updated }, 201);
  } catch (err) {
    console.error('Bill createPayment error:', err);
    return error(res, 'Failed to record payment', 500);
  }
}
