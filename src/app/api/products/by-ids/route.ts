import { NextResponse } from 'next/server';
import { getProductsByIds } from '@/lib/queries';

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get('ids') ?? '';
  const ids = raw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12);
  if (!ids.length) return NextResponse.json({ products: [] });

  const products = await getProductsByIds(ids);
  return NextResponse.json({ products });
}
