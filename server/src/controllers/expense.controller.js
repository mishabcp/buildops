import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';

const PAYMENT_MODES = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI'];

async function checkProjectAccess(req, projectId) {
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const userBranchId = req.user.branchId;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { project: null, forbidden: false, notFound: true };
  if (!isSuperAdmin && userBranchId != null && project.branchId !== userBranchId) {
    return { project, forbidden: true, notFound: false };
  }
  return { project, forbidden: false, notFound: false };
}

export async function listByProject(req, res) {
  try {
    const projectId = Number(req.params.id);
    if (Number.isNaN(projectId)) return error(res, 'Invalid project id', 400);
    const { notFound, forbidden } = await checkProjectAccess(req, projectId);
    if (notFound) return error(res, 'Project not found', 404);
    if (forbidden) return error(res, 'Forbidden', 403);
    const expenses = await prisma.otherExpense.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
    });
    return success(res, expenses);
  } catch (err) {
    console.error('List expenses error:', err);
    return error(res, 'Failed to list expenses', 500);
  }
}

export async function create(req, res) {
  try {
    const projectId = Number(req.params.id);
    if (Number.isNaN(projectId)) return error(res, 'Invalid project id', 400);
    const { notFound, forbidden } = await checkProjectAccess(req, projectId);
    if (notFound) return error(res, 'Project not found', 404);
    if (forbidden) return error(res, 'Forbidden', 403);
    const { description, amount, date, paymentMode } = req.body;
    if (!description || typeof description !== 'string' || !description.trim()) {
      return error(res, 'Description is required', 400);
    }
    const amt = amount != null ? Number(amount) : 0;
    if (Number.isNaN(amt) || amt < 0) return error(res, 'Valid amount is required', 400);
    const mode = paymentMode && PAYMENT_MODES.includes(paymentMode) ? paymentMode : null;
    const expense = await prisma.otherExpense.create({
      data: {
        projectId,
        description: description.trim(),
        amount: amt,
        date: date ? new Date(date) : new Date(),
        paymentMode: mode,
      },
    });
    return success(res, expense, 201);
  } catch (err) {
    console.error('Create expense error:', err);
    return error(res, 'Failed to create expense', 500);
  }
}

export async function remove(req, res) {
  try {
    if (req.user.role === 'STAFF') return error(res, 'Staff cannot delete records', 403);
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid expense id', 400);
    const expense = await prisma.otherExpense.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!expense) return error(res, 'Expense not found', 404);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    if (!isSuperAdmin && userBranchId != null && expense.project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    await prisma.otherExpense.delete({ where: { id } });
    return success(res, { deleted: true });
  } catch (err) {
    console.error('Delete expense error:', err);
    return error(res, 'Failed to delete expense', 500);
  }
}
