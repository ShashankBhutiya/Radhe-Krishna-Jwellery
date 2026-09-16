import { prisma } from '@/lib/prisma';
import { inr, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminCustomers() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      orders: { select: { total: true, status: true } },
      _count: { select: { wishlist: true, reviews: true } },
    },
  });

  return (
    <div>
      <h1 className="display-md">Customers</h1>
      <p className="mt-2 text-[14px] text-ink-2">{customers.length} registered accounts.</p>

      <div className="card-surface mt-6 lg:overflow-x-auto">
        <table className="table-stack lg:min-w-[700px]">
          <thead>
            <tr className="border-b border-line">
              <th className="px-5 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Customer</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Joined</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Orders</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Wishlist</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Reviews</th>
              <th className="px-5 py-3.5 text-right text-[10.5px] uppercase tracking-label text-ink-3">Lifetime value</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center text-sm text-ink-2">No registered customers yet.</td>
              </tr>
            ) : (
              customers.map((c) => {
                const ltv = c.orders
                  .filter((o) => o.status !== 'CANCELLED')
                  .reduce((s, o) => s + o.total, 0);
                return (
                  <tr key={c.id} className="border-b border-line last:border-0 hover:bg-canvas-2">
                    <td className="px-5 py-3.5">
                      <span className="block font-display text-[17px]">{c.name}</span>
                      <span className="block break-words text-[11.5px] text-ink-3">{c.email}{c.phone ? ' · ' + c.phone : ''}</span>
                    </td>
                    <td data-label="Joined" className="px-3 py-3.5 text-[13px] text-ink-2">{formatDate(c.createdAt)}</td>
                    <td data-label="Orders" className="px-3 py-3.5 text-[13px] text-ink-2">{c.orders.length}</td>
                    <td data-label="Wishlist" className="px-3 py-3.5 text-[13px] text-ink-2">{c._count.wishlist}</td>
                    <td data-label="Reviews" className="px-3 py-3.5 text-[13px] text-ink-2">{c._count.reviews}</td>
                    <td data-label="Lifetime value" className="px-5 py-3.5 text-right font-display text-lg">{inr(ltv)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
