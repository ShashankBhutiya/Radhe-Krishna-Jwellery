import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, uploadUrl } from '@/lib/uploads';

export const runtime = 'nodejs';

/**
 * Receives photos picked from the gallery or shot on the camera by the admin
 * product form. Multipart rather than JSON so the browser streams the binary
 * straight through instead of paying the base64 tax.
 */
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorised' }, { status: 403 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Could not read the upload' }, { status: 400 });
  }

  const files = form.getAll('file').filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: 'No photo was attached' }, { status: 400 });

  const urls: string[] = [];

  for (const file of files) {
    const type = file.type.toLowerCase();
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json(
        { error: `${file.name || 'That file'} is not a supported image (JPEG, PNG, WebP, AVIF or GIF).` },
        { status: 415 },
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `${file.name || 'That photo'} is over ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.` },
        { status: 413 },
      );
    }

    const data = Buffer.from(await file.arrayBuffer());
    const row = await prisma.upload.create({
      data: { mimeType: type, size: data.byteLength, data },
      select: { id: true },
    });
    urls.push(uploadUrl(row.id));
  }

  return NextResponse.json({ ok: true, urls });
}
