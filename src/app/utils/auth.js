import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'trio-super-secret';

export async function findAdminUser(username) {
  return prisma.adminUser.findUnique({ where: { username } });
}

export async function createAdminUser(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.adminUser.create({ data: { username, passwordHash } });
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signAdminToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function verifyAdminToken(request) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.replace('Bearer ', '');
  const payload = verifyToken(token);
  if (!payload) return false;
  // Optionally, check user still exists
  const user = await prisma.adminUser.findUnique({ where: { id: payload.id } });
  return !!user;
} 