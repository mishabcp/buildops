import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export function sign(payload, options = {}) {
  return jwt.sign(payload, secret, { expiresIn: '7d', ...options });
}

export function verify(token) {
  return jwt.verify(token, secret);
}
