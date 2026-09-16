import { z } from 'zod';
import { prisma } from './prisma';

/** Formats a phone camera or gallery can realistically hand us. */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const;

/**
 * Ceiling for a single upload request. The browser downscales before sending,
 * so this only catches pathological files — and it stays under the 4.5 MB body
 * limit serverless functions enforce.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const UPLOAD_PATH_PREFIX = '/api/uploads/';

export function uploadUrl(id: string) {
  return UPLOAD_PATH_PREFIX + id;
}

/** True for the app-relative paths POST /api/admin/uploads hands back. */
export function isUploadUrl(url: string) {
  return url.startsWith(UPLOAD_PATH_PREFIX) && /^[a-z0-9]+$/i.test(url.slice(UPLOAD_PATH_PREFIX.length));
}

function uploadIds(urls: string[]) {
  return urls.filter(isUploadUrl).map((u) => u.slice(UPLOAD_PATH_PREFIX.length));
}

/**
 * A product image is either an external URL an admin pasted or one of our own
 * upload paths. `z.string().url()` rejects the latter, so both are checked here.
 */
export const productImageUrl = z
  .string()
  .refine((v) => isUploadUrl(v) || /^https?:\/\/\S+$/.test(v), 'Image URLs must start with http:// or https://');

export const imageExtension: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

/**
 * Drops upload rows that no product still points at. Called after a save
 * replaces a product's images, so photos removed in the form do not sit in the
 * database forever. External URLs are ignored — we never owned those bytes.
 */
export async function pruneOrphanUploads(removedUrls: string[]) {
  const ids = uploadIds(removedUrls);
  if (!ids.length) return;

  const stillUsed = await prisma.productImage.findMany({
    where: { url: { in: ids.map(uploadUrl) } },
    select: { url: true },
  });
  const keep = new Set(uploadIds(stillUsed.map((i) => i.url)));

  const orphans = ids.filter((id) => !keep.has(id));
  if (orphans.length) await prisma.upload.deleteMany({ where: { id: { in: orphans } } });
}
