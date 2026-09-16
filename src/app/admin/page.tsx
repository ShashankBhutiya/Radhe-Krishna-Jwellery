import Link from 'next/link';
import { IndianRupee, Package, ShoppingCart, Users, AlertTriangle, Mail } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { inr, formatDate } from '@/lib/utils';
import { StatusPill } from '@/components/status-pill';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const [orders, revenueAgg, productCount, customerCount, lowStock, recentOrders, unread, topSellers] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        orderBy: { stock: 'asc' },
        take: 6,
        select: { id: true, name: true, slug: true, stock: true, sku: true },
      }),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 6, include: { items: true } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.orderItem.groupBy({
        by: ['productId', 'name'],
        _sum: { qty: true },
        orderBy: { _sum: { qty: 'desc' } },
        take: 5,
      }),
    ]);

  const revenue = revenueAgg._sum.total ?? 0;
  const aov = orders > 0 ? Math.round(revenue / orders) : 0;

  const stats = [
    { label: 'Revenue', value: inr(revenue), icon: IndianRupee, href: '/admin/orders' },
    { label: 'Orders', value: String(orders), icon: ShoppingCart, href: '/admin/orders' },
    { label: 'Avg. order value', value: inr(aov), icon: IndianRupee, href: '/admin/orders' },
    { label: 'Live products', value: String(productCount), icon: Package, href: '/admin/products' },
    { label: 'Customers', value: String(customerCount), icon: Users, href: '/admin/customers' },
    { label: 'Unread messages', value: String(unread), icon: Mail, href: '/admin/messages' },
  ];

  return (
    <div>
      <h1 className="display-md">Overview</h1>
      <p className="mt-2 text-[14px] text-ink-2">A live snapshot of the store.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card-surface p-5 transition-colors hover:border-gold">
            <span className="flex items-center justify-between">
              <span className="label-muted">{s.label}</span>
              <s.icon size={15} strokeWidth={1.4} className="text-gold" />
            </span>
            <span className="mt-3 block font-display text-3xl font-light">{s.value}</span>
          </Link>
        ))}
      </div>

      {/* min-w-0 lets the grid children shrink; without it their content sets the floor. */}
      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section className="card-surface min-w-0 p-6">
          <h2 className="flex items-center justify-between font-display text-2xl font-light">
            Recent orders
            <Link href="/admin/orders" className="label link-underline text-ink hover:text-gold-deep">All</Link>
          </h2>

          {recentOrders.length === 0 ? (
            <p className="mt-6 text-sm text-ink-2">No orders yet.</p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={'/admin/orders/' + o.id} className="flex items-center justify-between gap-4 py-3.5 hover:text-gold-deep">
                    <span className="min-w-0">
                      <span className="block font-display text-lg">{o.orderNumber}</span>
                      <span className="block truncate text-[12px] text-ink-3">
                        {o.customerName} · {formatDate(o.createdAt)} · {o.items.length} items
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <StatusPill status={o.status} />
                      <span className="font-display text-lg">{inr(o.total)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="min-w-0 space-y-8">
          <section className="card-surface min-w-0 p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl font-light">
              <AlertTriangle size={17} strokeWidth={1.5} className="text-wine" />
              Low stock
            </h2>

            {lowStock.length === 0 ? (
              <p className="mt-5 text-sm text-ink-2">Everything is comfortably stocked.</p>
            ) : (
              <ul className="mt-5 divide-y divide-line">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                    <Link href={'/admin/products/' + p.id} className="min-w-0 hover:text-gold-deep">
                      <span className="block truncate font-display text-[17px]">{p.name}</span>
                      <span className="block text-[11.5px] text-ink-3">{p.sku}</span>
                    </Link>
                    <span className={p.stock === 0 ? 'text-[13px] text-wine' : 'text-[13px] text-ink-2'}>
                      {p.stock === 0 ? 'Sold out' : p.stock + ' left'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card-surface min-w-0 p-6">
            <h2 className="font-display text-2xl font-light">Best sellers</h2>
            {topSellers.length === 0 ? (
              <p className="mt-5 text-sm text-ink-2">No sales data yet.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {topSellers.map((t, i) => (
                  <li key={t.productId} className="flex items-center gap-4">
                    <span className="w-5 shrink-0 font-display text-xl text-gold-soft">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-[14px]">{t.name}</span>
                    <span className="shrink-0 text-[13px] text-ink-2">{t._sum.qty} sold</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
