import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminToken } from '../../utils/auth';

const prisma = new PrismaClient();

export async function GET() {
  const posts = await prisma.blogPost.findMany({ orderBy: { date: 'desc' } });
  return NextResponse.json(posts);
}

export async function POST(request) {
  try {
    const isAdmin = await verifyAdminToken(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const newPost = await prisma.blogPost.create({
      data: {
        title: body.title,
        content: body.content,
        image: body.image || null,
      },
    });
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('POST /api/blog-posts error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const isAdmin = await verifyAdminToken(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await request.json();
  await prisma.blogPost.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
} 