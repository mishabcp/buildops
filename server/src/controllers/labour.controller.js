import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';
import { unlinkProjectMediaForEntity } from '../utils/unlinkProjectMedia.js';

function toNum(d) {
  if (d == null) return 0;
  return Number(d);
}

function getStatus(paid, total) {
  if (paid <= 0) return 'PENDING';
  if (paid >= total) return 'PAID';
  return 'PARTIALLY_PAID';
}

export async function listLabour(req, res) {
  try {
    const projectId = Number(req.params.id);
    if (Number.isNaN(projectId)) return error(res, 'Invalid project id', 400);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return error(res, 'Project not found', 404);
    if (!isSuperAdmin && userBranchId != null && project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    const entries = await prisma.labourPayment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, entries);
  } catch (err) {
    console.error('List labour error:', err);
    return error(res, 'Failed to list labour entries', 500);
  }
}

export async function createLabour(req, res) {
  try {
    const projectId = Number(req.params.id);
    if (Number.isNaN(projectId)) return error(res, 'Invalid project id', 400);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return error(res, 'Project not found', 404);
    if (!isSuperAdmin && userBranchId != null && project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    const { workerName, workType, days, ratePerDay, totalAmount, paidAmount, paymentDate, paymentMode, notes } = req.body;
    if (!workerName || typeof workerName !== 'string' || !workerName.trim()) {
      return error(res, 'Worker name is required', 400);
    }
    const total = totalAmount != null ? Number(totalAmount) : 0;
    if (Number.isNaN(total) || total < 0) return error(res, 'Valid total amount is required', 400);
    const paid = paidAmount != null ? Number(paidAmount) : 0;
    if (Number.isNaN(paid) || paid < 0) return error(res, 'Paid amount must be non-negative', 400);
    const validModes = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI'];
    const mode = paymentMode && validModes.includes(paymentMode) ? paymentMode : null;
    const status = getStatus(paid, total);
    const entry = await prisma.labourPayment.create({
      data: {
        projectId,
        workerName: workerName.trim(),
        workType: workType != null ? String(workType).trim() || null : null,
        days: days != null ? Number(days) : null,
        ratePerDay: ratePerDay != null ? Number(ratePerDay) : null,
        totalAmount: total,
        paidAmount: paid,
        status,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        paymentMode: mode,
        notes: notes != null ? String(notes).trim() || null : null,
      },
    });
    return success(res, entry, 201);
  } catch (err) {
    console.error('Create labour error:', err);
    return error(res, 'Failed to add labour entry', 500);
  }
}

export async function updateLabour(req, res) {
  try {
    const labourId = Number(req.params.id);
    if (Number.isNaN(labourId)) return error(res, 'Invalid labour entry id', 400);
    const entry = await prisma.labourPayment.findUnique({
      where: { id: labourId },
      include: { project: true },
    });
    if (!entry) return error(res, 'Labour entry not found', 404);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    if (!isSuperAdmin && userBranchId != null && entry.project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    const { workerName, workType, days, ratePerDay, totalAmount, paidAmount, paymentDate, paymentMode, notes } = req.body;
    const updates = {};
    if (workerName !== undefined) updates.workerName = String(workerName).trim();
    if (workType !== undefined) updates.workType = workType === '' || workType == null ? null : String(workType).trim();
    if (days !== undefined) updates.days = days === '' || days == null ? null : Number(days);
    if (ratePerDay !== undefined) updates.ratePerDay = ratePerDay === '' || ratePerDay == null ? null : Number(ratePerDay);
    if (totalAmount !== undefined) {
      const n = Number(totalAmount);
      if (!Number.isNaN(n) && n >= 0) updates.totalAmount = n;
    }
    if (paidAmount !== undefined) {
      const n = Number(paidAmount);
      if (!Number.isNaN(n) && n >= 0) updates.paidAmount = n;
    }
    if (paymentDate !== undefined) updates.paymentDate = paymentDate ? new Date(paymentDate) : null;
    if (paymentMode !== undefined) {
      const validModes = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI'];
      updates.paymentMode = paymentMode && validModes.includes(paymentMode) ? paymentMode : null;
    }
    if (notes !== undefined) updates.notes = notes === '' || notes == null ? null : String(notes).trim();
    const newTotal = updates.totalAmount !== undefined ? updates.totalAmount : toNum(entry.totalAmount);
    const newPaid = updates.paidAmount !== undefined ? updates.paidAmount : toNum(entry.paidAmount);
    updates.status = getStatus(newPaid, newTotal);
    const updated = await prisma.labourPayment.update({
      where: { id: labourId },
      data: updates,
    });
    return success(res, updated);
  } catch (err) {
    console.error('Update labour error:', err);
    return error(res, 'Failed to update labour entry', 500);
  }
}

export async function deleteLabour(req, res) {
  try {
    const labourId = Number(req.params.id);
    if (Number.isNaN(labourId)) return error(res, 'Invalid labour entry id', 400);
    const entry = await prisma.labourPayment.findUnique({
      where: { id: labourId },
      include: { project: true },
    });
    if (!entry) return error(res, 'Labour entry not found', 404);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    const isStaff = req.user.role === 'STAFF';
    if (isStaff) return error(res, 'Staff cannot delete records', 403);
    if (!isSuperAdmin && userBranchId != null && entry.project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    await unlinkProjectMediaForEntity('LABOUR_PAYMENT', labourId);
    await prisma.labourPayment.delete({ where: { id: labourId } });
    return success(res, { id: labourId, deleted: true });
  } catch (err) {
    console.error('Delete labour error:', err);
    return error(res, 'Failed to delete labour entry', 500);
  }
}
