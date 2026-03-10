import bcrypt from 'bcrypt';
import prisma from '../utils/prisma.js';
import { success, error } from '../utils/response.js';

function omitPassword(user) {
  if (!user) return user;
  const { passwordHash: _, ...rest } = user;
  return rest;
}

export async function list(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: { branch: true },
      orderBy: { name: 'asc' },
    });
    return success(res, users.map(omitPassword));
  } catch (err) {
    console.error('User list error:', err);
    return error(res, 'Failed to list users', 500);
  }
}

export async function create(req, res) {
  try {
    const { name, email, password, role, branchId } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return error(res, 'Name is required', 400);
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return error(res, 'Email is required', 400);
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return error(res, 'Password must be at least 6 characters', 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return error(res, 'Email already in use', 400);
    const validRoles = ['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF'];
    const userRole = role && validRoles.includes(role) ? role : 'STAFF';
    const branchIdNum = branchId != null ? Number(branchId) : null;
    if (branchIdNum != null && Number.isNaN(branchIdNum)) {
      return error(res, 'Invalid branch', 400);
    }
    if (branchIdNum != null) {
      const branch = await prisma.branch.findUnique({ where: { id: branchIdNum } });
      if (!branch) return error(res, 'Branch not found', 400);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: userRole,
        branchId: branchIdNum,
      },
      include: { branch: true },
    });
    return success(res, omitPassword(user), 201);
  } catch (err) {
    console.error('User create error:', err);
    return error(res, 'Failed to create user', 500);
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid user id', 400);
    const currentUserId = req.user.userId;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const isSelf = id === currentUserId;
    if (!isSelf && !isSuperAdmin) {
      return error(res, 'Forbidden', 403);
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return error(res, 'User not found', 404);
    const { name, email, role, branchId, isActive } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findFirst({
        where: { email: normalizedEmail, NOT: { id } },
      });
      if (existing) return error(res, 'Email already in use', 400);
      updates.email = normalizedEmail;
    }
    if (isSuperAdmin) {
      if (role !== undefined) {
        const validRoles = ['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF'];
        if (validRoles.includes(role)) updates.role = role;
      }
      if (branchId !== undefined) {
        const branchIdNum = branchId === '' || branchId == null ? null : Number(branchId);
        if (!Number.isNaN(branchIdNum)) {
          if (branchIdNum !== null) {
            const branch = await prisma.branch.findUnique({ where: { id: branchIdNum } });
            if (!branch) return error(res, 'Branch not found', 400);
          }
          updates.branchId = branchIdNum;
        }
      }
      if (typeof isActive === 'boolean') updates.isActive = isActive;
    }
    if (req.body.password && (isSelf || isSuperAdmin)) {
      const password = String(req.body.password).trim();
      if (password.length >= 6) {
        updates.passwordHash = await bcrypt.hash(password, 10);
      }
    }
    const updated = await prisma.user.update({
      where: { id },
      data: updates,
      include: { branch: true },
    });
    return success(res, omitPassword(updated));
  } catch (err) {
    console.error('User update error:', err);
    return error(res, 'Failed to update user', 500);
  }
}

export async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 'Invalid user id', 400);
    if (id === req.user.userId) {
      return error(res, 'Cannot deactivate your own account', 400);
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return error(res, 'User not found', 404);
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return success(res, { id, deactivated: true });
  } catch (err) {
    console.error('User remove error:', err);
    return error(res, 'Failed to deactivate user', 500);
  }
}
