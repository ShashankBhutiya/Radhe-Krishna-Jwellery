import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { ORDER_STATUSES } from '@/lib/site';

const schema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED']).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorised' }, { status: 403 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Cancelling returns the reserved stock to the shelf, once.
  if (parsed.data.status === 'CANCELLED' && order.status !== 'CANCELLED') {
    for (const item of order.items) {
      await prisma.product.updateMany({
        where: { id: item.productId },
        data: { stock: { increment: item.qty } },
      });
    }
  }

  await prisma.order.update({ where: { id }, data: parsed.data });

  revalidatePath('/admin/orders');
  revalidatePath('/admin/orders/' + id);
  revalidatePath('/order/' + order.orderNumber);
  return NextResponse.json({ ok: true });
}
