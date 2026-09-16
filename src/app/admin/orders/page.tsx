import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { inr, formatDate } from '@/lib/utils';
import { StatusPill } from '@/components/status-pill';
import { ORDER_STATUSES } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="display-md">Orders</h1>
      <p className="mt-2 text-[14px] text-ink-2">{orders.length} orders{status ? ' with status ' + status.toLowerCase() : ''}.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={
            'border px-3.5 py-2 text-[11px] uppercase tracking-label transition-colors ' +
            (!status ? 'border-ink bg-ink text-canvas' : 'border-line text-ink-2 hover:border-gold')
          }
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={'/admin/orders?status=' + s}
            className={
              'border px-3.5 py-2 text-[11px] uppercase tracking-label transition-colors ' +
              (status === s ? 'border-ink bg-ink text-canvas' : 'border-line text-ink-2 hover:border-gold')
            }
          >
            {s.toLowerCase()}
          </Link>
        ))}
      </div>

      <div className="card-surface mt-6 lg:overflow-x-auto">
        <table className="table-stack lg:min-w-[760px]">
          <thead>
            <tr className="border-b border-line">
              <th className="px-5 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Order</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Customer</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Placed</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Items</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Payment</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Status</th>
              <th className="px-5 py-3.5 text-right text-[10.5px] uppercase tracking-label text-ink-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center text-sm text-ink-2">No orders here yet.</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0 hover:bg-canvas-2">
                  <td className="px-5 py-3.5">
                    <Link href={'/admin/orders/' + o.id} className="font-display text-[17px] hover:text-gold-deep">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td data-label="Customer" className="px-3 py-3.5">
                    <span>
                      <span className="block text-[13.5px]">{o.customerName}</span>
                      <span className="block text-[11.5px] text-ink-3">{o.city}, {o.state}</span>
                    </span>
                  </td>
                  <td data-label="Placed" className="px-3 py-3.5 text-[13px] text-ink-2">{formatDate(o.createdAt)}</td>
                  <td data-label="Items" className="px-3 py-3.5 text-[13px] text-ink-2">{o.items.length}</td>
                  <td data-label="Payment" className="px-3 py-3.5">
                    <span>
                      <span className="block text-[12.5px]">{o.paymentMethod === 'COD' ? 'COD' : 'Online'}</span>
                      <span className="block text-[11px] text-ink-3">{o.paymentStatus.toLowerCase()}</span>
                    </span>
                  </td>
                  <td data-label="Status" className="px-3 py-3.5"><StatusPill status={o.status} /></td>
                  <td data-label="Total" className="px-5 py-3.5 text-right font-display text-lg">{inr(o.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
