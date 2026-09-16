import Link from 'next/link';
import { Package, MapPin, Heart, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { inr, formatDate } from '@/lib/utils';
import { StatusPill } from '@/components/status-pill';

export const dynamic = 'force-dynamic';

export default async function AccountOverview() {
  const session = await getSession();
  if (!session) return null;

  const [orders, addressCount, wishCount, recent] = await Promise.all([
    prisma.order.count({ where: { userId: session.id } }),
    prisma.address.count({ where: { userId: session.id } }),
    prisma.wishlistItem.count({ where: { userId: session.id } }),
    prisma.order.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { items: { take: 4 } },
    }),
  ]);

  const stats = [
    { label: 'Orders placed', value: orders, href: '/account/orders', icon: Package },
    { label: 'Saved addresses', value: addressCount, href: '/account/addresses', icon: MapPin },
    { label: 'Wishlist pieces', value: wishCount, href: '/wishlist', icon: Heart },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group card-surface p-6 transition-colors hover:border-gold">
            <s.icon size={18} strokeWidth={1.3} className="text-gold" />
            <span className="mt-4 block font-display text-4xl font-light">{s.value}</span>
            <span className="mt-1 flex items-center gap-1.5 text-[11px] uppercase tracking-label text-ink-3">
              {s.label}
              <ArrowRight size={11} strokeWidth={1.8} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="display-md">Recent orders</h2>
          {orders > 0 ? (
            <Link href="/account/orders" className="label link-underline text-ink hover:text-gold-deep">
              View all
            </Link>
          ) : null}
        </div>

        {recent.length === 0 ? (
          <div className="mt-6 border border-dashed border-line bg-white/50 px-6 py-14 text-center">
            <p className="font-display text-2xl font-light">No orders yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">
              When you place an order it will appear here with live tracking.
            </p>
            <Link href="/shop" className="btn-outline mt-6">Start shopping</Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {recent.map((o) => (
              <li key={o.id}>
                <Link
                  href={'/order/' + o.orderNumber}
                  className="card-surface flex flex-wrap items-center justify-between gap-4 p-5 transition-colors hover:border-gold"
                >
                  <div>
                    <span className="block font-display text-xl">{o.orderNumber}</span>
                    <span className="mt-0.5 block text-[12.5px] text-ink-3">
                      {formatDate(o.createdAt)} · {o.items.length} {o.items.length === 1 ? 'piece' : 'pieces'}
                    </span>
                  </div>
                  <div className="flex items-center gap-5">
                    <StatusPill status={o.status} />
                    <span className="font-display text-xl">{inr(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
