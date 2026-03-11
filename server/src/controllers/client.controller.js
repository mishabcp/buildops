import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';

export async function list(req, res) {
  try {
    const { search } = req.query;
    const where = {};
    if (search != null && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }
    const clients = await prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 100,
      include: { _count: { select: { projects: true } } },
    });
    return success(res, clients);
  } catch (err) {
    console.error('Client list error:', err);
    return error(res, 'Failed to list clients', 500);
  }
}

export async function create(req, res) {
  try {
    const { name, phone, email, address } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return error(res, 'Client name is required', 400);
    }
    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        phone: phone != null && String(phone).trim() ? String(phone).trim() : null,
        email: email != null && String(email).trim() ? String(email).trim() : null,
        address: address != null && String(address).trim() ? String(address).trim() : null,
      },
    });
    return success(res, client, 201);
  } catch (err) {
    console.error('Client create error:', err);
    return error(res, 'Failed to create client', 500);
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid client id', 400);
    const { name, phone, email, address } = req.body;
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return error(res, 'Client not found', 404);
    const data = {};
    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return error(res, 'Client name cannot be empty', 400);
      data.name = trimmed;
    }
    if (phone !== undefined) data.phone = phone === '' || phone == null ? null : String(phone).trim();
    if (email !== undefined) data.email = email === '' || email == null ? null : String(email).trim();
    if (address !== undefined) data.address = address === '' || address == null ? null : String(address).trim();
    const updated = await prisma.client.update({
      where: { id },
      data,
      include: { _count: { select: { projects: true } } },
    });
    return success(res, updated);
  } catch (err) {
    console.error('Client update error:', err);
    return error(res, 'Failed to update client', 500);
  }
}

export async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid client id', 400);
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return error(res, 'Client not found', 404);
    const projectCount = await prisma.project.count({ where: { clientId: id } });
    if (projectCount > 0) {
      return error(res, 'Cannot delete client that has projects', 400);
    }
    await prisma.client.delete({ where: { id } });
    return success(res, { deleted: true });
  } catch (err) {
    console.error('Client delete error:', err);
    return error(res, 'Failed to delete client', 500);
  }
}
