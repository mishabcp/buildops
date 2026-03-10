import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';

function toNum(d) {
  if (d == null) return 0;
  return Number(d);
}

function getStatus(paid, agreed) {
  if (paid <= 0) return 'PENDING';
  if (paid >= agreed) return 'PAID';
  return 'PARTIALLY_PAID';
}

export async function list(req, res) {
  try {
    const associates = await prisma.associate.findMany({
      orderBy: { name: 'asc' },
    });
    return success(res, associates);
  } catch (err) {
    console.error('Associate list error:', err);
    return error(res, 'Failed to list associates', 500);
  }
}

export async function create(req, res) {
  try {
    const { name, phone, email, workType } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return error(res, 'Associate name is required', 400);
    }
    const associate = await prisma.associate.create({
      data: {
        name: name.trim(),
        phone: phone != null ? String(phone).trim() || null : null,
        email: email != null ? String(email).trim() || null : null,
        workType: workType != null ? String(workType).trim() || null : null,
      },
    });
    return success(res, associate, 201);
  } catch (err) {
    console.error('Associate create error:', err);
    return error(res, 'Failed to create associate', 500);
  }
}

export async function listProjectAssociates(req, res) {
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
    const payments = await prisma.associatePayment.findMany({
      where: { projectId },
      include: { associate: true, transactions: { orderBy: { paidDate: 'desc' } } },
    });
    return success(res, payments);
  } catch (err) {
    console.error('List project associates error:', err);
    return error(res, 'Failed to list associate payments', 500);
  }
}

export async function createProjectAssociate(req, res) {
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
    const { associateId, scopeOfWork, agreedAmount } = req.body;
    const associateIdNum = Number(associateId);
    if (Number.isNaN(associateIdNum)) return error(res, 'Valid associate is required', 400);
    const agreed = agreedAmount != null ? Number(agreedAmount) : 0;
    if (Number.isNaN(agreed) || agreed < 0) return error(res, 'Valid agreed amount is required', 400);
    const associate = await prisma.associate.findUnique({ where: { id: associateIdNum } });
    if (!associate) return error(res, 'Associate not found', 404);
    const existing = await prisma.associatePayment.findFirst({
      where: { projectId, associateId: associateIdNum },
    });
    if (existing) return error(res, 'This associate is already assigned to the project', 400);
    const payment = await prisma.associatePayment.create({
      data: {
        projectId,
        associateId: associateIdNum,
        scopeOfWork: scopeOfWork != null ? String(scopeOfWork).trim() || null : null,
        agreedAmount: agreed,
      },
      include: { associate: true, transactions: true },
    });
    return success(res, payment, 201);
  } catch (err) {
    console.error('Create project associate error:', err);
    return error(res, 'Failed to assign associate', 500);
  }
}

export async function createTransaction(req, res) {
  try {
    const paymentId = Number(req.params.id);
    if (Number.isNaN(paymentId)) return error(res, 'Invalid associate payment id', 400);
    const payment = await prisma.associatePayment.findUnique({
      where: { id: paymentId },
      include: { project: true },
    });
    if (!payment) return error(res, 'Associate payment not found', 404);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    if (!isSuperAdmin && userBranchId != null && payment.project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    const { amount, paidDate, paymentMode, referenceNo, notes } = req.body;
    const amountNum = amount != null ? Number(amount) : NaN;
    if (Number.isNaN(amountNum) || amountNum <= 0) return error(res, 'Valid amount is required', 400);
    const validModes = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI'];
    if (!paymentMode || !validModes.includes(paymentMode)) {
      return error(res, 'Valid payment mode is required', 400);
    }
    const result = await prisma.$transaction(async (tx) => {
      await tx.associateTransaction.create({
        data: {
          associatePaymentId: paymentId,
          amount: amountNum,
          paidDate: paidDate ? new Date(paidDate) : new Date(),
          paymentMode,
          referenceNo: referenceNo != null ? String(referenceNo).trim() || null : null,
          notes: notes != null ? String(notes).trim() || null : null,
        },
      });
      const currentPaid = toNum(payment.paidAmount);
      const newPaid = currentPaid + amountNum;
      const agreed = toNum(payment.agreedAmount);
      const status = getStatus(newPaid, agreed);
      return tx.associatePayment.update({
        where: { id: paymentId },
        data: { paidAmount: newPaid, status },
        include: { associate: true, transactions: { orderBy: { paidDate: 'desc' } } },
      });
    });
    return success(res, result, 201);
  } catch (err) {
    console.error('Create associate transaction error:', err);
    return error(res, 'Failed to record payment', 500);
  }
}
