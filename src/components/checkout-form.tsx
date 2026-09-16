'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Truck, CreditCard, Smartphone, Banknote, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useCoupon, CouponBox, OrderSummary } from '@/components/cart-view';
import { Empty, Spinner } from '@/components/ui';
import { cn, inr } from '@/lib/utils';
import { SITE } from '@/lib/site';

type SavedAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

type Props = {
  user: { name: string; email: string; phone: string | null } | null;
  addresses: SavedAddress[];
};

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Jammu & Kashmir', 'Chandigarh', 'Puducherry',
];

export function CheckoutForm({ user, addresses }: Props) {
  const router = useRouter();
  const { items, subtotal, savings, clear } = useCart();

  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<'COD' | 'ONLINE'>('COD');
  const [onlineMode, setOnlineMode] = useState<'UPI' | 'CARD'>('UPI');
  const [selectedAddress, setSelectedAddress] = useState<string>('new');

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [form, setForm] = useState({
    customerName: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  useEffect(() => {
    setMounted(true);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.id);
      fillFrom(defaultAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fillFrom(a: SavedAddress) {
    setForm((f) => ({
      ...f,
      customerName: a.name,
      phone: a.phone,
      addressLine1: a.line1,
      addressLine2: a.line2 ?? '',
      city: a.city,
      state: a.state,
      pincode: a.pincode,
    }));
  }

  const sub = subtotal();
  const { coupon, apply } = useCoupon(sub);
  const discount = coupon?.discount ?? 0;
  const shipping = coupon?.freeShipping || sub - discount >= SITE.freeShippingAbove ? 0 : SITE.shippingFlat;
  const total = sub - discount + shipping;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      // The "online" path is a simulated gateway — no real money moves.
      if (payment === 'ONLINE') {
        await new Promise((r) => setTimeout(r, 1400));
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          paymentMethod: payment,
          couponCode: coupon?.code ?? '',
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not place the order');

      clear();
      apply(null);
      router.push(`/order/${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (!mounted) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_390px]">
        <div className="skeleton h-[540px] w-full" />
        <div className="skeleton h-80 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty
        title="Nothing to check out"
        copy="Your bag is empty. Add a piece you love and come back — we will hold your coupon."
        action={{ href: '/shop', label: 'Browse the collection' }}
      />
    );
  }

  const field = (
    name: keyof typeof form,
    label: string,
    opts: { type?: string; required?: boolean; placeholder?: string; className?: string } = {},
  ) => (
    <div className={opts.className}>
      <label className="field-label" htmlFor={name}>
        {label}
        {opts.required === false ? <span className="ml-1 normal-case tracking-normal text-ink-3">(optional)</span> : null}
      </label>
      <input
        id={name}
        type={opts.type ?? 'text'}
        required={opts.required !== false}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        placeholder={opts.placeholder}
        className="field"
      />
    </div>
  );

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_390px] lg:gap-14">
      <div>
        {error ? (
          <p className="mb-6 border border-wine/30 bg-wine/5 px-4 py-3 text-[13.5px] text-wine">{error}</p>
        ) : null}

        {!user ? (
          <p className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 border border-line bg-canvas-2 px-4 py-3 text-[13px] text-ink-2">
            Already have an account?
            <Link href="/login?next=/checkout" className="text-gold-deep underline underline-offset-4">
              Sign in
            </Link>
            to use your saved addresses and track this order.
          </p>
        ) : null}

        {/* Saved addresses */}
        {addresses.length > 0 ? (
          <section className="mb-10">
            <h2 className="flex items-center gap-3 font-display text-2xl font-light">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[11px] text-canvas">1</span>
              Delivery address
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setSelectedAddress(a.id);
                    fillFrom(a);
                  }}
                  className={cn(
                    'border p-4 text-left transition-colors',
                    selectedAddress === a.id ? 'border-gold bg-gold-pale' : 'border-line bg-white hover:border-gold-soft',
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span className="label text-ink">{a.label}</span>
                    {selectedAddress === a.id ? <Check size={14} strokeWidth={2} className="text-gold-deep" /> : null}
                  </span>
                  <span className="mt-2 block text-[13.5px] text-ink">{a.name}</span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-2">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}
                  </span>
                  <span className="mt-1 block text-[12.5px] text-ink-3">{a.phone}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setSelectedAddress('new');
                  setForm((f) => ({
                    ...f,
                    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
                  }));
                }}
                className={cn(
                  'border border-dashed p-4 text-left text-[13.5px] transition-colors',
                  selectedAddress === 'new' ? 'border-gold bg-gold-pale text-ink' : 'border-line text-ink-2 hover:border-gold',
                )}
              >
                + Deliver to a new address
              </button>
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="flex items-center gap-3 font-display text-2xl font-light">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[11px] text-canvas">
              {addresses.length > 0 ? '2' : '1'}
            </span>
            {addresses.length > 0 ? 'Confirm details' : 'Delivery details'}
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {field('customerName', 'Full name', { placeholder: 'Ananya Sharma' })}
            {field('phone', 'Phone number', { type: 'tel', placeholder: '10-digit mobile number' })}
            {field('email', 'Email address', { type: 'email', placeholder: 'you@example.com', className: 'sm:col-span-2' })}
            {field('addressLine1', 'Address', { placeholder: 'House / flat, building, street', className: 'sm:col-span-2' })}
            {field('addressLine2', 'Landmark / area', { required: false, placeholder: 'Near…', className: 'sm:col-span-2' })}
            {field('city', 'City', { placeholder: 'New Delhi' })}

            <div>
              <label className="field-label" htmlFor="state">State</label>
              <select
                id="state"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="field cursor-pointer"
              >
                <option value="">Select a state</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {field('pincode', 'PIN code', { placeholder: '110070' })}

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="notes">
                Order notes <span className="ml-1 normal-case tracking-normal text-ink-3">(optional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Gift wrap, delivery timing, anything we should know."
                className="field resize-none"
              />
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="flex items-center gap-3 font-display text-2xl font-light">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[11px] text-canvas">
              {addresses.length > 0 ? '3' : '2'}
            </span>
            Payment
          </h2>

          <div className="mt-6 space-y-3">
            <label
              className={cn(
                'flex cursor-pointer items-start gap-4 border p-5 transition-colors',
                payment === 'COD' ? 'border-gold bg-gold-pale' : 'border-line bg-white hover:border-gold-soft',
              )}
            >
              <input
                type="radio"
                name="payment"
                checked={payment === 'COD'}
                onChange={() => setPayment('COD')}
                className="sr-only"
              />
              <span
                className={cn(
                  'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                  payment === 'COD' ? 'border-gold' : 'border-ink-3',
                )}
              >
                {payment === 'COD' ? <span className="h-2 w-2 rounded-full bg-gold" /> : null}
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 font-display text-lg">
                  <Banknote size={16} strokeWidth={1.5} className="text-gold-deep" />
                  Cash on delivery
                </span>
                <span className="mt-1 block text-[13px] text-ink-2">
                  Pay the courier when the parcel arrives. No extra charge, available nationwide.
                </span>
              </span>
            </label>

            <label
              className={cn(
                'flex cursor-pointer items-start gap-4 border p-5 transition-colors',
                payment === 'ONLINE' ? 'border-gold bg-gold-pale' : 'border-line bg-white hover:border-gold-soft',
              )}
            >
              <input
                type="radio"
                name="payment"
                checked={payment === 'ONLINE'}
                onChange={() => setPayment('ONLINE')}
                className="sr-only"
              />
              <span
                className={cn(
                  'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                  payment === 'ONLINE' ? 'border-gold' : 'border-ink-3',
                )}
              >
                {payment === 'ONLINE' ? <span className="h-2 w-2 rounded-full bg-gold" /> : null}
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 font-display text-lg">
                  <CreditCard size={16} strokeWidth={1.5} className="text-gold-deep" />
                  Pay online — UPI, card or netbanking
                </span>
                <span className="mt-1 block text-[13px] text-ink-2">
                  Demonstration mode: no gateway is connected, so no money moves and no card details are collected.
                </span>

                {payment === 'ONLINE' ? (
                  <span className="mt-4 block border-t border-gold/25 pt-4">
                    <span className="flex gap-2">
                      {(['UPI', 'CARD'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setOnlineMode(m);
                          }}
                          className={cn(
                            'flex items-center gap-2 border px-4 py-2 text-[11px] uppercase tracking-label transition-colors',
                            onlineMode === m ? 'border-gold bg-white text-ink' : 'border-line text-ink-2',
                          )}
                        >
                          {m === 'UPI' ? <Smartphone size={12} strokeWidth={1.7} /> : <CreditCard size={12} strokeWidth={1.7} />}
                          {m === 'UPI' ? 'UPI' : 'Card'}
                        </button>
                      ))}
                    </span>
                    <span className="mt-3 flex items-center gap-2 text-[12px] text-ink-3">
                      <ShieldCheck size={13} strokeWidth={1.5} className="text-gold" />
                      Placing the order will simulate a successful {onlineMode === 'UPI' ? 'UPI' : 'card'} payment.
                    </span>
                  </span>
                ) : null}
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="card-surface mb-5 max-h-72 overflow-y-auto p-5">
          <span className="label">In your bag ({items.length})</span>
          <ul className="mt-4 space-y-4">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3.5">
                <span className="relative h-[68px] w-14 shrink-0 overflow-hidden bg-canvas-2">
                  {i.image ? <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" /> : null}
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-canvas">
                    {i.qty}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[16px]">{i.name}</span>
                  <span className="block text-[12.5px] text-ink-2">{inr(i.price * i.qty)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-5">
          <CouponBox subtotal={sub} coupon={coupon} onApply={apply} />
        </div>

        <OrderSummary subtotal={sub} discount={discount} shipping={shipping} savings={savings()}>
          <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">
            {busy ? (
              <>
                <Spinner /> {payment === 'ONLINE' ? 'Processing payment…' : 'Placing order…'}
              </>
            ) : (
              <>
                <Lock size={13} strokeWidth={1.8} />
                {payment === 'COD' ? `Place order · ${inr(total)}` : `Pay ${inr(total)}`}
              </>
            )}
          </button>

          <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11.5px] text-ink-3">
            <Truck size={13} strokeWidth={1.5} className="text-gold" />
            Dispatched within 24 working hours
          </p>
        </OrderSummary>
      </aside>
    </form>
  );
}
