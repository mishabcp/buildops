import bcrypt from 'bcrypt';
import prisma from '../utils/prisma.js';
import { sign } from '../utils/jwt.js';
import { success, error } from '../utils/response.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, 'Email and password required', 400);
    }
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { branch: true },
    });
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }
    if (!user.isActive) {
      return error(res, 'Account is deactivated', 403);
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return error(res, 'Invalid email or password', 401);
    }
    const token = sign({ userId: user.id, email: user.email });
    const { passwordHash: _, ...safeUser } = user;
    return success(res, { token, user: safeUser }, 200);
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Login failed', 500);
  }
}

export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { branch: true },
    });
    if (!user || !user.isActive) {
      return error(res, 'User not found or inactive', 404);
    }
    const { passwordHash: _, ...safeUser } = user;
    return success(res, safeUser, 200);
  } catch (err) {
    console.error('Me error:', err);
    return error(res, 'Failed to get user', 500);
  }
}
