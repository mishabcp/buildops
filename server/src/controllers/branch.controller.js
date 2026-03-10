import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';

export async function list(req, res) {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' },
    });
    return success(res, branches);
  } catch (err) {
    console.error('Branch list error:', err);
    return error(res, 'Failed to list branches', 500);
  }
}

export async function create(req, res) {
  try {
    const { name, location } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return error(res, 'Branch name is required', 400);
    }
    const branch = await prisma.branch.create({
      data: {
        name: name.trim(),
        location: location != null ? String(location).trim() || null : null,
      },
    });
    return success(res, branch, 201);
  } catch (err) {
    console.error('Branch create error:', err);
    return error(res, 'Failed to create branch', 500);
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid branch id', 400);
    const { name, location } = req.body;
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) return error(res, 'Branch not found', 404);
    const updated = await prisma.branch.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(location !== undefined && { location: location === '' || location == null ? null : String(location).trim() }),
      },
    });
    return success(res, updated);
  } catch (err) {
    console.error('Branch update error:', err);
    return error(res, 'Failed to update branch', 500);
  }
}
