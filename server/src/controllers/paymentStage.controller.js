import { unlinkProjectMediaForEntity } from '../utils/unlinkProjectMedia.js';
import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';

function toNum(d) {
  if (d == null) return 0;
  return Number(d);
}

async function updateStageStatus(stageId) {
  const stage = await prisma.paymentStage.findUnique({
    where: { id: stageId },
    include: { receipts: true },
  });
  if (!stage) return;
  const sum = stage.receipts.reduce((s, r) => s + toNum(r.amount), 0);
  const expected = toNum(stage.expectedAmount);
  let status = 'PENDING';
  if (sum >= expected) status = 'PAID';
  else if (sum > 0) status = 'PARTIALLY_PAID';
  await prisma.paymentStage.update({
    where: { id: stageId },
    data: { status },
  });
}

export async function listStages(req, res) {
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
    const stages = await prisma.paymentStage.findMany({
      where: { projectId },
      include: { receipts: true },
      orderBy: { stageNumber: 'asc' },
    });
    const withPaid = stages.map((s) => {
      const paid = s.receipts.reduce((sum, r) => sum + toNum(r.amount), 0);
      return { ...s, paidAmount: paid };
    });
    return success(res, withPaid);
  } catch (err) {
    console.error('List stages error:', err);
    return error(res, 'Failed to list stages', 500);
  }
}

export async function createStage(req, res) {
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
    const { stageName, stageNumber, expectedAmount, dueDate } = req.body;
    if (!stageName || typeof stageName !== 'string' || !stageName.trim()) {
      return error(res, 'Stage name is required', 400);
    }
    const num = stageNumber != null ? Number(stageNumber) : null;
    const nextNum = num ?? (await prisma.paymentStage.count({ where: { projectId } })) + 1;
    const expected = expectedAmount != null ? Number(expectedAmount) : 0;
    if (Number.isNaN(expected) || expected < 0) return error(res, 'Valid expected amount is required', 400);
    const stage = await prisma.paymentStage.create({
      data: {
        projectId,
        stageName: stageName.trim(),
        stageNumber: nextNum,
        expectedAmount: expected,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { receipts: true },
    });
    return success(res, stage, 201);
  } catch (err) {
    console.error('Create stage error:', err);
    return error(res, 'Failed to create stage', 500);
  }
}

export async function updateStage(req, res) {
  try {
    const stageId = Number(req.params.id);
    if (Number.isNaN(stageId)) return error(res, 'Invalid stage id', 400);
    const stage = await prisma.paymentStage.findUnique({
      where: { id: stageId },
      include: { project: true },
    });
    if (!stage) return error(res, 'Stage not found', 404);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    if (!isSuperAdmin && userBranchId != null && stage.project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    const { stageName, stageNumber, expectedAmount, dueDate } = req.body;
    const updates = {};
    if (stageName !== undefined) updates.stageName = String(stageName).trim();
    if (stageNumber !== undefined) {
      const n = Number(stageNumber);
      if (!Number.isNaN(n)) updates.stageNumber = n;
    }
    if (expectedAmount !== undefined) {
      const n = Number(expectedAmount);
      if (!Number.isNaN(n) && n >= 0) updates.expectedAmount = n;
    }
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;
    const updated = await prisma.paymentStage.update({
      where: { id: stageId },
      data: updates,
      include: { receipts: true },
    });
    return success(res, updated);
  } catch (err) {
    console.error('Update stage error:', err);
    return error(res, 'Failed to update stage', 500);
  }
}

export async function deleteStage(req, res) {
  try {
    const stageId = Number(req.params.id);
    if (Number.isNaN(stageId)) return error(res, 'Invalid stage id', 400);
    const stage = await prisma.paymentStage.findUnique({
      where: { id: stageId },
      include: { project: true },
    });
    if (!stage) return error(res, 'Stage not found', 404);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    const isStaff = req.user.role === 'STAFF';
    if (isStaff) return error(res, 'Staff cannot delete records', 403);
    if (!isSuperAdmin && userBranchId != null && stage.project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    await unlinkProjectMediaForEntity('PAYMENT_STAGE', stageId);
    await prisma.paymentStage.delete({ where: { id: stageId } });
    return success(res, { id: stageId, deleted: true });
  } catch (err) {
    console.error('Delete stage error:', err);
    return error(res, 'Failed to delete stage', 500);
  }
}

export async function listReceipts(req, res) {
  try {
    const stageId = Number(req.params.id);
    if (Number.isNaN(stageId)) return error(res, 'Invalid stage id', 400);
    const stage = await prisma.paymentStage.findUnique({
      where: { id: stageId },
      include: { project: true },
    });
    if (!stage) return error(res, 'Stage not found', 404);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    if (!isSuperAdmin && userBranchId != null && stage.project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    const receipts = await prisma.paymentReceipt.findMany({
      where: { paymentStageId: stageId },
      orderBy: { receivedDate: 'desc' },
    });
    return success(res, receipts);
  } catch (err) {
    console.error('List receipts error:', err);
    return error(res, 'Failed to list receipts', 500);
  }
}

export async function createReceipt(req, res) {
  try {
    const stageId = Number(req.params.id);
    if (Number.isNaN(stageId)) return error(res, 'Invalid stage id', 400);
    const stage = await prisma.paymentStage.findUnique({
      where: { id: stageId },
      include: { project: true },
    });
    if (!stage) return error(res, 'Stage not found', 404);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    if (!isSuperAdmin && userBranchId != null && stage.project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    const { amount, receivedDate, paymentMode, referenceNo, notes } = req.body;
    const amountNum = amount != null ? Number(amount) : NaN;
    if (Number.isNaN(amountNum) || amountNum <= 0) return error(res, 'Valid amount is required', 400);
    const validModes = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI'];
    if (!paymentMode || !validModes.includes(paymentMode)) {
      return error(res, 'Valid payment mode is required', 400);
    }
    const receipt = await prisma.paymentReceipt.create({
      data: {
        paymentStageId: stageId,
        amount: amountNum,
        receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
        paymentMode,
        referenceNo: referenceNo != null ? String(referenceNo).trim() || null : null,
        notes: notes != null ? String(notes).trim() || null : null,
      },
    });
    await updateStageStatus(stageId);
    const updated = await prisma.paymentStage.findUnique({
      where: { id: stageId },
      include: { receipts: true },
    });
    return success(res, { receipt, stage: updated }, 201);
  } catch (err) {
    console.error('Create receipt error:', err);
    return error(res, 'Failed to record receipt', 500);
  }
}
