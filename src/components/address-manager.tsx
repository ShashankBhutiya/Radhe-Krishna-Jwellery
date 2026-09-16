'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Star } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { useUI } from '@/store/ui';

type Address = {
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

const EMPTY = {
  label: 'Home', name: '', phone: '', line1: '', line2: '',
  city: '', state: '', pincode: '', isDefault: false,
};

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const toast = useUI((s) => s.toast);

  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save the address');

      toast('Address saved');
      setForm(EMPTY);
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await fetch('/api/account/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    toast('Address removed');
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="display-md">Saved addresses</h2>
        {!showForm ? (
          <button type="button" onClick={() => setShowForm(true)} className="btn-outline btn-sm">
            <Plus size={13} strokeWidth={1.8} /> Add address
          </button>
        ) : null}
      </div>

      {addresses.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="card-surface relative p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="label text-ink">{a.label}</span>
                  {a.isDefault ? (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-label text-gold-deep">
                      <Star size={10} strokeWidth={2} className="fill-gold text-gold" /> Default
                    </span>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  aria-label={'Remove ' + a.label + ' address'}
                  className="text-ink-3 transition-colors hover:text-wine"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>

              <p className="mt-3 font-display text-lg">{a.name}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                {a.line1}
                {a.line2 ? ', ' + a.line2 : ''}
                <br />
                {a.city}, {a.state} {a.pincode}
              </p>
              <p className="mt-1.5 text-[13px] text-ink-3">{a.phone}</p>
            </li>
          ))}
        </ul>
      ) : !showForm ? (
        <div className="mt-8 border border-dashed border-line bg-white/50 px-6 py-14 text-center">
          <p className="font-display text-2xl font-light">No addresses saved</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">
            Save an address to check out in one tap next time.
          </p>
        </div>
      ) : null}

      {showForm ? (
        <form onSubmit={save} className="card-surface mt-8 p-6 animate-rise">
          <h3 className="font-display text-2xl font-light">New address</h3>

          {error ? <p className="mt-4 border border-wine/30 bg-wine/5 px-4 py-3 text-[13px] text-wine">{error}</p> : null}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="ad-label">Label</label>
              <select
                id="ad-label"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="field cursor-pointer"
              >
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="ad-name">Full name</label>
              <input id="ad-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="ad-phone">Phone</label>
              <input id="ad-phone" required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="ad-l1">Address</label>
              <input id="ad-l1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="field" placeholder="House / flat, building, street" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="ad-l2">Landmark <span className="ml-1 normal-case tracking-normal text-ink-3">(optional)</span></label>
              <input id="ad-l2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="ad-city">City</label>
              <input id="ad-city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="ad-state">State</label>
              <input id="ad-state" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="ad-pin">PIN code</label>
              <input id="ad-pin" required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="field" placeholder="110070" />
            </div>
            <label className="flex items-center gap-3 self-end pb-3 text-[13px] text-ink-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="h-4 w-4 accent-[#B08D57]"
              />
              Make this my default address
            </label>
          </div>

          <div className="mt-7 flex gap-3">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? <Spinner /> : 'Save address'}
            </button>
            {addresses.length > 0 ? (
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
