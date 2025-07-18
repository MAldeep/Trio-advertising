import { NextResponse } from 'next/server';
import { findAdminUser, verifyPassword, signAdminToken } from '../../../utils/auth';

export async function POST(request) {
  const { username, password } = await request.json();
  const user = await findAdminUser(username);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = signAdminToken(user);
  return NextResponse.json({ token });
} 