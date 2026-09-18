import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, Package, Truck, Home, MapPin, Phone, Mail } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { inr, formatDate, cn } from '@/lib/utils';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false },
};

const STEPS = [
  { key: 'PLACED', label: 'Order placed', icon: Check },
  { key: 'PACKED', label: 'Packed', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  const stepIndex = order.status === 'CONFIRMED' ? 0 : STEPS.findIndex((s) => s.key === order.status);
  const activeStep = order.status === 'CANCELLED' ? -1 : Math.max(0, stepIndex);

  return (
    <div className="container-lux py-14 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-gold bg-gold-pale">
            <Check size={22} strokeWidth={1.6} className="text-gold-deep" />
          </span>
          <span className="label mt-6">Thank you</span>
          <h1 className="display-lg mt-3">Your order is confirmed</h1>
          <span className="mt-5 h-px w-14 bg-gold-soft" />
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-2">
            We have emailed a copy to <strong className="font-medium text-ink">{order.email}</strong>. Your order number
            is <strong className="font-medium text-ink">{order.orderNumber}</strong> — keep it handy for any questions.
          </p>
        </div>

        {order.status !== 'CANCELLED' ? (
          <div className="mt-14 flex items-start justify-between gap-2">
            {STEPS.map((s, i) => (
              <div key={s.key} className="relative flex flex-1 flex-col items-center gap-3 text-center">
                {i < STEPS.length - 1 ? (
                  <span
                    className={cn(
                      'absolute left-1/2 top-5 h-px w-full',
                      i < activeStep ? 'bg-gold' : 'bg-line',
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    'relative z-10 grid h-10 w-10 place-items-center rounded-full border transition-colors',
                    i <= activeStep ? 'border-gold bg-gold text-white' : 'border-line bg-canvas text-ink-3',
                  )}
                >
                  <s.icon size={16} strokeWidth={1.6} />
                </span>
                <span className={cn('text-[10.5px] uppercase tracking-label', i <= activeStep ? 'text-ink' : 'text-ink-3')}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-12 border border-wine/30 bg-wine/5 px-5 py-4 text-center text-[14px] text-wine">
            This order was cancelled. Contact us if that was not intentional.
          </p>
        )}

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          <div className="card-surface p-6">
            <span className="label">Delivering to</span>
            <p className="mt-3 font-display text-xl">{order.customerName}</p>
            <address className="mt-2 space-y-2 not-italic text-[13.5px] leading-relaxed text-ink-2">
              <span className="flex items-start gap-2.5">
                <MapPin size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
                <span>
                  {order.addressLine1}
                  {order.addressLine2 ? <>, {order.addressLine2}</> : null}
                  <br />
                  {order.city}, {order.state} {order.pincode}
                </span>
              </span>
              <span className="flex items-center gap-2.5">
                <Phone size={14} strokeWidth={1.5} className="shrink-0 text-gold" />
                {order.phone}
              </span>
              <span className="flex items-center gap-2.5">
                <Mail size={14} strokeWidth={1.5} className="shrink-0 text-gold" />
                {order.email}
              </span>
            </address>
          </div>

          <div className="card-surface p-6">
            <span className="label">Order details</span>
            <dl className="mt-3 space-y-2.5 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-ink-2">Order number</dt>
                <dd className="font-medium">{order.orderNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">Placed on</dt>
                <dd>{formatDate(order.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">Payment</dt>
                <dd>{order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">Status</dt>
                <dd className="text-gold-deep">{order.paymentStatus === 'PAID' ? 'Payment received' : 'Due on delivery'}</dd>
              </div>
              {order.razorpayPaymentId ? (
                <div className="flex justify-between">
                  <dt className="text-ink-2">Payment ID</dt>
                  <dd className="font-mono text-xs text-ink">{order.razorpayPaymentId}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>

        <div className="card-surface mt-8 p-6">
          <span className="label">Your pieces</span>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <Link href={'/product/' + it.slug} className="relative h-[84px] w-[68px] shrink-0 overflow-hidden bg-canvas-2">
                  {it.image ? <Image src={it.image} alt={it.name} fill sizes="68px" className="object-cover" /> : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={'/product/' + it.slug} className="block font-display text-[18px] hover:text-gold-deep">
                    {it.name}
                  </Link>
                  <span className="text-[13px] text-ink-2">
                    {inr(it.price)} × {it.qty}
                  </span>
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
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="btn-primary">Continue shopping</Link>
          <Link href="/account/orders" className="btn-outline">View all orders</Link>
        </div>

        <p className="mt-8 text-center text-[12.5px] text-ink-3">
          Questions? Call{' '}
          <a href={SITE.phoneHref} className="text-gold-deep underline underline-offset-4">{SITE.phone}</a>
          {SITE.email ? (
            <>
              {' '}or email{' '}
              <a href={'mailto:' + SITE.email} className="text-gold-deep underline underline-offset-4">{SITE.email}</a>
            </>
          ) : null}.
        </p>
      </div>
    </div>
  );
}
