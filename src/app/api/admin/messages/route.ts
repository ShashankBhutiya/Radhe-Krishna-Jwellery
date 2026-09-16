import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorised' }, { status: 403 });

  const { id, isRead } = await req.json().catch(() => ({ id: null, isRead: null }));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.contactMessage.update({ where: { id }, data: { isRead: !!isRead } });
  revalidatePath('/admin/messages');
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorised' }, { status: 403 });

  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath('/admin/messages');
  return NextResponse.json({ ok: true });
}
