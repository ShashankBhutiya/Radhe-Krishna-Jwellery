import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * Serves an uploaded photo. Public on purpose — these are product images shown
 * on the storefront. Rows are immutable, so the id doubles as a cache key.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const upload = await prisma.upload.findUnique({
    where: { id },
    select: { data: true, mimeType: true },
  });
  if (!upload) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = new Uint8Array(upload.data);
  return new NextResponse(body, {
    headers: {
      'Content-Type': upload.mimeType,
      'Content-Length': String(body.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
