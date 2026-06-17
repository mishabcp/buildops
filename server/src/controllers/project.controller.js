import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';
import { deleteAllMediaForProject } from './projectMedia.controller.js';

function toNum(d) {
  if (d == null) return 0;
  return Number(d);
}

export async function list(req, res) {
  try {
    const { branchId, status, search } = req.query;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;

    const where = {};
    if (!isSuperAdmin && userBranchId != null) {
      where.branchId = userBranchId;
    }
    if (branchId != null && branchId !== '') {
      const id = Number(branchId);
      if (!Number.isNaN(id)) where.branchId = id;
    }
    if (status != null && status !== '') {
      where.status = status;
    }
    if (search != null && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { client: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: true,
        branch: true,
        paymentStages: { include: { receipts: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const withTotals = projects.map((p) => {
      const totalReceived = p.paymentStages.reduce(
        (sum, stage) => sum + stage.receipts.reduce((s, r) => s + toNum(r.amount), 0),
        0
      );
      const contractValue = toNum(p.contractValue);
      return {
        ...p,
        contractValue,
        totalReceived,
        balance: contractValue - totalReceived,
      };
    });

    return success(res, withTotals);
  } catch (err) {
    console.error('Project list error:', err);
    return error(res, 'Failed to list projects', 500);
  }
}

export async function create(req, res) {
  try {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    const { name, clientId, branchId, location, status, contractValue, startDate, estimatedEndDate, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return error(res, 'Project name is required', 400);
    }
    const clientIdNum = Number(clientId);
    if (Number.isNaN(clientIdNum)) return error(res, 'Valid client is required', 400);
    const branchIdNum = Number(branchId);
    if (Number.isNaN(branchIdNum)) return error(res, 'Valid branch is required', 400);
    if (!isSuperAdmin && userBranchId !== branchIdNum) {
      return error(res, 'You can only create projects for your branch', 403);
    }

    const contractValueNum = Number(contractValue);
    if (Number.isNaN(contractValueNum) || contractValueNum < 0) {
      return error(res, 'Valid contract value is required', 400);
    }

    const [clientExists, branchExists] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientIdNum } }),
      prisma.branch.findUnique({ where: { id: branchIdNum } }),
    ]);
    if (!clientExists) return error(res, 'Client not found', 400);
    if (!branchExists) return error(res, 'Branch not found', 400);

    const validStatuses = ['ENQUIRY', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
    const projectStatus = status && validStatuses.includes(status) ? status : 'ENQUIRY';

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        clientId: clientIdNum,
        branchId: branchIdNum,
        location: location != null ? String(location).trim() || null : null,
        status: projectStatus,
        contractValue: contractValueNum,
        startDate: startDate ? new Date(startDate) : null,
        estimatedEndDate: estimatedEndDate ? new Date(estimatedEndDate) : null,
        description: description != null ? String(description).trim() || null : null,
      },
      include: { client: true, branch: true },
    });

    return success(res, project, 201);
  } catch (err) {
    console.error('Project create error:', err);
    return error(res, 'Failed to create project', 500);
  }
}

export async function getOne(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid project id', 400);

    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        branch: true,
        paymentStages: { include: { receipts: true }, orderBy: { stageNumber: 'asc' } },
        labourPayments: true,
        materialItems: { include: { material: true } },
        associatePayments: { include: { associate: true, transactions: true } },
        bills: true,
        otherExpenses: true,
      },
    });

    if (!project) return error(res, 'Project not found', 404);
    if (!isSuperAdmin && userBranchId != null && project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }

    return success(res, project);
  } catch (err) {
    console.error('Project getOne error:', err);
    return error(res, 'Failed to get project', 500);
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid project id', 400);

    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return error(res, 'Project not found', 404);
    if (!isSuperAdmin && userBranchId != null && project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }

    const { name, clientId, branchId, location, status, contractValue, startDate, estimatedEndDate, description } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (clientId !== undefined) {
      const n = Number(clientId);
      if (!Number.isNaN(n)) updates.clientId = n;
    }
    if (branchId !== undefined && isSuperAdmin) {
      const n = Number(branchId);
      if (!Number.isNaN(n)) updates.branchId = n;
    }
    if (location !== undefined) updates.location = location === '' || location == null ? null : String(location).trim();
    if (status !== undefined && ['ENQUIRY', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].includes(status)) {
      updates.status = status;
    }
    if (contractValue !== undefined) {
      const n = Number(contractValue);
      if (!Number.isNaN(n) && n >= 0) updates.contractValue = n;
    }
    if (startDate !== undefined) updates.startDate = startDate ? new Date(startDate) : null;
    if (estimatedEndDate !== undefined) updates.estimatedEndDate = estimatedEndDate ? new Date(estimatedEndDate) : null;
    if (description !== undefined) updates.description = description === '' || description == null ? null : String(description).trim();

    const updated = await prisma.project.update({
      where: { id },
      data: updates,
      include: { client: true, branch: true },
    });

    return success(res, updated);
  } catch (err) {
    console.error('Project update error:', err);
    return error(res, 'Failed to update project', 500);
  }
}

export async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid project id', 400);

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return error(res, 'Project not found', 404);

    await deleteAllMediaForProject(id);
    await prisma.project.delete({ where: { id } });
    return success(res, { id, deleted: true });
  } catch (err) {
    console.error('Project delete error:', err);
    return error(res, 'Failed to delete project', 500);
  }
}

export async function getSummary(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid project id', 400);

    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        paymentStages: { include: { receipts: true } },
        labourPayments: true,
        materialItems: true,
        associatePayments: true,
        bills: true,
        otherExpenses: true,
      },
    });

    if (!project) return error(res, 'Project not found', 404);
    if (!isSuperAdmin && userBranchId != null && project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }

    const totalContractValue = toNum(project.contractValue);
    const totalReceived = project.paymentStages.reduce(
      (sum, stage) => sum + stage.receipts.reduce((s, r) => s + toNum(r.amount), 0),
      0
    );
    const totalOutstanding = totalContractValue - totalReceived;
    const totalLabourCost = project.labourPayments.reduce((s, l) => s + toNum(l.totalAmount), 0);
    const totalMaterialCost = project.materialItems.reduce((s, i) => s + toNum(i.totalCost ?? 0), 0);
    const totalAssociateCost = project.associatePayments.reduce((s, a) => s + toNum(a.agreedAmount), 0);
    const totalBillsPayable = project.bills.filter((b) => b.type === 'PAYABLE').reduce((s, b) => s + toNum(b.totalAmount), 0);
    const totalOtherExpenses = project.otherExpenses.reduce((s, e) => s + toNum(e.amount), 0);
    const totalExpenses = totalLabourCost + totalMaterialCost + totalAssociateCost + totalBillsPayable + totalOtherExpenses;
    const totalReceivables = project.bills.filter((b) => b.type === 'RECEIVABLE').reduce((s, b) => s + toNum(b.totalAmount), 0);
    const totalIncome = totalContractValue + totalReceivables;
    const estimatedProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (estimatedProfit / totalIncome) * 100 : 0;

    return success(res, {
      totalContractValue,
      totalReceived,
      totalOutstanding,
      totalReceivables,
      totalIncome,
      totalLabourCost,
      totalMaterialCost,
      totalAssociateCost,
      totalBillsPayable,
      totalOtherExpenses,
      totalExpenses,
      estimatedProfit,
      profitMargin,
    });
  } catch (err) {
    console.error('Project summary error:', err);
    return error(res, 'Failed to get summary', 500);
  }
}
