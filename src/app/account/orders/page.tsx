import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { inr, formatDate } from '@/lib/utils';
import { StatusPill } from '@/components/status-pill';

export const dynamic = 'force-dynamic';

export default async function AccountOrders() {
  const session = await getSession();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div>
      <h2 className="display-md">Your orders</h2>

      {orders.length === 0 ? (
        <div className="mt-8 border border-dashed border-line bg-white/50 px-6 py-16 text-center">
          <p className="font-display text-2xl font-light">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">
            Your order history will appear here the moment you place one.
          </p>
          <Link href="/shop" className="btn-outline mt-6">Browse the collection</Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {orders.map((o) => (
            <li key={o.id} className="card-surface">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                  <span>
                    <span className="label-muted block">Order</span>
                    <span className="font-display text-lg">{o.orderNumber}</span>
                  </span>
                  <span>
                    <span className="label-muted block">Placed</span>
                    <span className="text-[13.5px]">{formatDate(o.createdAt)}</span>
                  </span>
                  <span>
                    <span className="label-muted block">Total</span>
                    <span className="font-display text-lg">{inr(o.total)}</span>
                  </span>
                </div>
                <StatusPill status={o.status} />
              </div>

              <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                {o.items.map((it) => (
                  <Link key={it.id} href={'/product/' + it.slug} className="group flex items-center gap-3">
                    <span className="relative h-16 w-[52px] shrink-0 overflow-hidden bg-canvas-2">
                      {it.image ? <Image src={it.image} alt={it.name} fill sizes="52px" className="object-cover" /> : null}
                    </span>
                    <span className="max-w-[160px]">
                      <span className="block truncate font-display text-[15px] group-hover:text-gold-deep">{it.name}</span>
                      <span className="block text-[12px] text-ink-3">Qty {it.qty}</span>
                    </span>
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
                <span className="text-[12.5px] text-ink-3">
                  {o.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online'} · Delivering to {o.city}, {o.state}
                </span>
                <Link href={'/order/' + o.orderNumber} className="label link-underline text-ink hover:text-gold-deep">
                  Track order
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
