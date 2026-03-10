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
    });
    return success(res, clients);
  } catch (err) {
    console.error('Client list error:', err);
    return error(res, 'Failed to list clients', 500);
  }
}
