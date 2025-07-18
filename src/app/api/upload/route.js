import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs'; // Required for file system access

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
  }
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filepath, Buffer.from(arrayBuffer));
  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
} 