import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';

// Persistent upload directory — inside the volume-mounted /app/data/ in Docker
const UPLOAD_DIR = process.env.UPLOAD_DIR || (
  process.env.NODE_ENV === 'production'
    ? '/app/data/uploads'
    : join(process.cwd(), 'data', 'uploads')
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const profileId = formData.get('profileId') as string | null;

    if (!file || !profileId) {
      return NextResponse.json({ error: 'Missing file or profileId' }, { status: 400 });
    }

    // Sanitize profileId — prevent path traversal (e.g. "../../etc/passwd")
    const safeProfileId = profileId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safeProfileId || safeProfileId !== profileId) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado. Use JPG, PNG, WEBP ou GIF.' }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagem muito grande. Máximo 5MB.' }, { status: 400 });
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const filename = `profile-${safeProfileId}.${ext}`;

    // Ensure uploads directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(join(UPLOAD_DIR, filename), buffer);

    // URL served by /api/uploads/[filename] route handler
    const avatarUrl = `/api/uploads/${filename}`;

    // Update in Prisma
    await prisma.profile.update({
      where: { id: profileId },
      data: { avatarUrl }
    });

    return NextResponse.json({ success: true, avatarUrl });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
