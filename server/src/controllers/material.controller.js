import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';
import { unlinkProjectMediaForEntity } from '../utils/unlinkProjectMedia.js';

function toNum(d) {
  if (d == null) return 0;
  return Number(d);
}

export async function list(req, res) {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { name: 'asc' },
    });
    return success(res, materials);
  } catch (err) {
    console.error('Material list error:', err);
    return error(res, 'Failed to list materials', 500);
  }
}

export async function create(req, res) {
  try {
    const { name, unit, currentStock, minThreshold } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return error(res, 'Material name is required', 400);
    }
    if (!unit || typeof unit !== 'string' || !unit.trim()) {
      return error(res, 'Unit is required', 400);
    }
    const stock = currentStock != null ? Number(currentStock) : 0;
    const threshold = minThreshold != null ? Number(minThreshold) : 0;
    if (Number.isNaN(stock) || stock < 0) return error(res, 'Valid current stock is required', 400);
    if (Number.isNaN(threshold) || threshold < 0) return error(res, 'Valid min threshold is required', 400);
    const existing = await prisma.material.findUnique({ where: { name: name.trim() } });
    if (existing) return error(res, 'Material with this name already exists', 400);
    const material = await prisma.material.create({
      data: {
        name: name.trim(),
        unit: unit.trim(),
        currentStock: stock,
        minThreshold: threshold,
      },
    });
    return success(res, material, 201);
  } catch (err) {
    console.error('Material create error:', err);
    return error(res, 'Failed to create material', 500);
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid material id', 400);
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) return error(res, 'Material not found', 404);
    const { name, unit, minThreshold } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (unit !== undefined) updates.unit = String(unit).trim();
    if (minThreshold !== undefined) {
      const n = Number(minThreshold);
      if (!Number.isNaN(n) && n >= 0) updates.minThreshold = n;
    }
    const updated = await prisma.material.update({
      where: { id },
      data: updates,
    });
    return success(res, updated);
  } catch (err) {
    console.error('Material update error:', err);
    return error(res, 'Failed to update material', 500);
  }
}

export async function listProjectMaterials(req, res) {
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
    const items = await prisma.materialItem.findMany({
      where: { projectId },
      include: { material: true },
      orderBy: { date: 'desc' },
    });
    return success(res, items);
  } catch (err) {
    console.error('List project materials error:', err);
    return error(res, 'Failed to list material items', 500);
  }
}

export async function createMaterialItem(req, res) {
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
    const { materialId, type, quantity, ratePerUnit, totalCost, supplierName, date, notes } = req.body;
    if (!materialId || !type) return error(res, 'Material and type (PURCHASE/USAGE) are required', 400);
    if (type !== 'PURCHASE' && type !== 'USAGE') return error(res, 'Type must be PURCHASE or USAGE', 400);
    const materialIdNum = Number(materialId);
    const qty = Number(quantity);
    if (Number.isNaN(materialIdNum) || Number.isNaN(qty) || qty <= 0) {
      return error(res, 'Valid material and quantity are required', 400);
    }
    const material = await prisma.material.findUnique({ where: { id: materialIdNum } });
    if (!material) return error(res, 'Material not found', 404);
    if (type === 'USAGE') {
      const current = toNum(material.currentStock);
      if (current < qty) return error(res, 'Insufficient stock. Current: ' + current, 400);
    }
    const rate = ratePerUnit != null ? Number(ratePerUnit) : null;
    const cost = totalCost != null ? Number(totalCost) : (rate != null && !Number.isNaN(rate) ? rate * qty : null);
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.materialItem.create({
        data: {
          projectId,
          materialId: materialIdNum,
          type,
          quantity: qty,
          ratePerUnit: rate,
          totalCost: cost,
          supplierName: supplierName != null ? String(supplierName).trim() || null : null,
          date: date ? new Date(date) : new Date(),
          notes: notes != null ? String(notes).trim() || null : null,
        },
        include: { material: true },
      });
      const delta = type === 'PURCHASE' ? qty : -qty;
      await tx.material.update({
        where: { id: materialIdNum },
        data: { currentStock: { increment: delta } },
      });
      return created;
    });
    return success(res, item, 201);
  } catch (err) {
    console.error('Create material item error:', err);
    return error(res, err.message?.startsWith('Insufficient') ? err.message : 'Failed to add material entry', 500);
  }
}

export async function deleteMaterialItem(req, res) {
  try {
    const itemId = Number(req.params.id);
    if (Number.isNaN(itemId)) return error(res, 'Invalid item id', 400);
    const item = await prisma.materialItem.findUnique({
      where: { id: itemId },
      include: { project: true, material: true },
    });
    if (!item) return error(res, 'Material item not found', 404);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const userBranchId = req.user.branchId;
    const isStaff = req.user.role === 'STAFF';
    if (isStaff) return error(res, 'Staff cannot delete records', 403);
    if (!isSuperAdmin && userBranchId != null && item.project.branchId !== userBranchId) {
      return error(res, 'Forbidden', 403);
    }
    const qty = toNum(item.quantity);
    const delta = item.type === 'PURCHASE' ? -qty : qty;
    await unlinkProjectMediaForEntity('MATERIAL_ITEM', itemId);
    await prisma.$transaction(async (tx) => {
      await tx.materialItem.delete({ where: { id: itemId } });
      await tx.material.update({
        where: { id: item.materialId },
        data: { currentStock: { increment: delta } },
      });
    });
    return success(res, { id: itemId, deleted: true });
  } catch (err) {
    console.error('Delete material item error:', err);
    return error(res, 'Failed to delete material item', 500);
  }
}
