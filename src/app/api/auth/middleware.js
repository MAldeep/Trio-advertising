import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../utils/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  // Protect only /api/posts POST and DELETE
  if (pathname === '/api/posts' && (request.method === 'POST' || request.method === 'DELETE')) {
    const isAdmin = await verifyAdminToken(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/posts'],
}; 