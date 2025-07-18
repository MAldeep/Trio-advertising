import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminToken } from '../../utils/auth';

const prisma = new PrismaClient();

export async function GET() {
  // Public: return all posts
  const posts = await prisma.post.findMany({ orderBy: { date: 'desc' } });
  return NextResponse.json(posts);
}

export async function POST(request) {
  const isAdmin = await verifyAdminToken(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const newPost = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      image: body.image || null,
      type: body.type || 'blog',
    },
  });
  return NextResponse.json(newPost, { status: 201 });
}

export async function DELETE(request) {
  const isAdmin = await verifyAdminToken(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await request.json();
  await prisma.post.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
} 