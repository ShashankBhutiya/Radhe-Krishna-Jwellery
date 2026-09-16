import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, StickyNote } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { inr, formatDateTime } from '@/lib/utils';
import { OrderStatusControls } from '@/components/admin/order-status-controls';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-label text-ink-2 hover:text-gold-deep">
        <ArrowLeft size={13} strokeWidth={1.8} /> All orders
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-md">{order.orderNumber}</h1>
          <p className="mt-2 text-[13.5px] text-ink-2">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <Link href={'/order/' + order.orderNumber} className="btn-outline btn-sm">
          Customer view
        </Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card-surface p-6">
            <h2 className="font-display text-xl font-light">Items</h2>
            <ul className="mt-4 divide-y divide-line">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <Link href={'/product/' + it.slug} className="relative h-[76px] w-[60px] shrink-0 overflow-hidden bg-canvas-2">
                    {it.image ? <Image src={it.image} alt={it.name} fill sizes="60px" className="object-cover" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={'/product/' + it.slug} className="block font-display text-[17px] hover:text-gold-deep">
                      {it.name}
                    </Link>
                    <span className="text-[12.5px] text-ink-3">{inr(it.price)} × {it.qty}</span>
                  </div>
                  <span className="font-display text-lg">{inr(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-ink-2">Subtotal</dt>
                <dd>{inr(order.subtotal)}</dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-gold-deep">
                  <dt>Discount {order.couponCode ? '(' + order.couponCode + ')' : ''}</dt>
                  <dd>&minus; {inr(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-ink-2">Shipping</dt>
                <dd>{order.shipping === 0 ? 'Complimentary' : inr(order.shipping)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="label text-ink">Total</dt>
                <dd className="font-display text-2xl">{inr(order.total)}</dd>
              </div>
            </dl>
          </section>

          {order.notes ? (
            <section className="card-surface p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-light">
                <StickyNote size={16} strokeWidth={1.5} className="text-gold" />
                Customer note
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{order.notes}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <OrderStatusControls
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
          />

          <section className="card-surface p-6">
            <h2 className="font-display text-xl font-light">Customer</h2>
            <p className="mt-3 font-display text-lg">{order.customerName}</p>
            <address className="mt-2 space-y-2 not-italic text-[13px] leading-relaxed text-ink-2">
              <span className="flex items-start gap-2.5">
                <MapPin size={13} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
                <span>
                  {order.addressLine1}
                  {order.addressLine2 ? <>, {order.addressLine2}</> : null}
                  <br />
                  {order.city}, {order.state} {order.pincode}
                </span>
              </span>
              <a href={'tel:' + order.phone} className="flex items-center gap-2.5 hover:text-gold-deep">
                <Phone size={13} strokeWidth={1.5} className="shrink-0 text-gold" />
                {order.phone}
              </a>
              <a href={'mailto:' + order.email} className="flex items-center gap-2.5 hover:text-gold-deep">
                <Mail size={13} strokeWidth={1.5} className="shrink-0 text-gold" />
                {order.email}
              </a>
            </address>
          </section>
        </aside>
      </div>
    </div>
  );
}
