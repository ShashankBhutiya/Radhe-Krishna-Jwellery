'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Ticket } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { useUI } from '@/store/ui';
import { inr, cn } from '@/lib/utils';

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  description: string;
  active: boolean;
  usedCount: number;
};

const BLANK = { code: '', type: 'PERCENT', value: 10, minOrder: 0, maxDiscount: 0, description: '', active: true };

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const toast = useUI((s) => s.toast);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          minOrder: Number(form.minOrder),
          maxDiscount: Number(form.maxDiscount) || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create the coupon');

      toast('Coupon created');
      setForm(BLANK);
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: Coupon) {
    await fetch('/api/admin/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    toast(c.active ? 'Coupon paused' : 'Coupon is live');
    router.refresh();
  }

  async function remove(c: Coupon) {
    if (!confirm('Delete ' + c.code + '?')) return;
    await fetch('/api/admin/coupons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id }),
    });
    toast('Coupon deleted');
    router.refresh();
  }

  return (
    <div>
      <div className="mt-6 flex justify-end">
        {!showForm ? (
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary btn-sm">
            <Plus size={13} strokeWidth={2} /> New coupon
          </button>
        ) : null}
      </div>

      {showForm ? (
        <form onSubmit={create} className="card-surface mt-4 p-6 animate-rise">
          <h2 className="font-display text-xl font-light">New coupon</h2>
          {error ? <p className="mt-4 border border-wine/30 bg-wine/5 px-4 py-3 text-[13px] text-wine">{error}</p> : null}

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label" htmlFor="c-code">Code</label>
              <input id="c-code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="field uppercase tracking-wider" placeholder="DIWALI20" />
            </div>
            <div>
              <label className="field-label" htmlFor="c-type">Type</label>
              <select id="c-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="field cursor-pointer">
                <option value="PERCENT">Percentage off</option>
                <option value="FLAT">Flat amount off</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="c-value">{form.type === 'PERCENT' ? 'Percent off' : 'Amount off (₹)'}</label>
              <input id="c-value" type="number" min={1} required value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="c-min">Minimum order (₹)</label>
              <input id="c-min" type="number" min={0} value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="c-max">Max discount (₹) <span className="ml-1 normal-case tracking-normal text-ink-3">(0 = none)</span></label>
              <input id="c-max" type="number" min={0} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="c-desc">Description</label>
              <input id="c-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field" placeholder="20% off during Diwali" />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={busy} className="btn-primary">{busy ? <Spinner /> : 'Create coupon'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      ) : null}

      {coupons.length === 0 ? (
        <div className="mt-6 border border-dashed border-line bg-white/50 px-6 py-16 text-center">
          <Ticket size={26} strokeWidth={1} className="mx-auto text-gold-soft" />
          <p className="mt-4 font-display text-2xl font-light">No coupons yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">Create one and customers can apply it at checkout.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {coupons.map((c) => (
            <li key={c.id} className="card-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="flex items-center gap-2.5">
                    <span className="font-display text-2xl tracking-wide">{c.code}</span>
                    <span
                      className={cn(
                        'border px-2 py-0.5 text-[9px] uppercase tracking-label',
                        c.active ? 'border-forest/30 bg-forest/8 text-forest' : 'border-line bg-canvas-2 text-ink-3',
                      )}
                    >
                      {c.active ? 'Live' : 'Paused'}
                    </span>
                  </span>
                  <p className="mt-1.5 text-[13px] text-ink-2">{c.description || 'No description'}</p>
                </div>

                <button type="button" onClick={() => remove(c)} aria-label={'Delete ' + c.code} className="shrink-0 text-ink-3 hover:text-wine">
                  <Trash2 size={14} strokeWidth={1.6} />
                </button>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-line pt-4 text-[12.5px] sm:grid-cols-4">
                <div>
                  <dt className="text-ink-3">Discount</dt>
                  <dd className="mt-0.5 text-ink">{c.type === 'PERCENT' ? c.value + '%' : inr(c.value)}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Min. order</dt>
                  <dd className="mt-0.5 text-ink">{c.minOrder ? inr(c.minOrder) : 'None'}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Cap</dt>
                  <dd className="mt-0.5 text-ink">{c.maxDiscount ? inr(c.maxDiscount) : 'None'}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Redeemed</dt>
                  <dd className="mt-0.5 text-ink">{c.usedCount}×</dd>
                </div>
              </dl>

              <button type="button" onClick={() => toggle(c)} className="btn-outline btn-sm mt-4 w-full">
                {c.active ? 'Pause coupon' : 'Make live'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
