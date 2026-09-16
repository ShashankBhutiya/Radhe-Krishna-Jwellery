'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui';
import { StatusPill } from '@/components/status-pill';
import { useUI } from '@/store/ui';
import { ORDER_STATUSES } from '@/lib/site';

export function OrderStatusControls({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const toast = useUI((s) => s.toast);
  const [busy, setBusy] = useState(false);

  async function update(patch: Record<string, string>) {
    setBusy(true);
    const res = await fetch('/api/admin/orders/' + orderId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) toast('Order updated');
    else toast('Could not update the order', 'error');
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="card-surface p-6">
      <h2 className="flex items-center justify-between font-display text-xl font-light">
        Status
        {busy ? <Spinner className="text-ink-3" /> : <StatusPill status={status} />}
      </h2>

      <div className="mt-5">
        <label className="field-label" htmlFor="o-status">Fulfilment</label>
        <select
          id="o-status"
          value={status}
          disabled={busy}
          onChange={(e) => update({ status: e.target.value })}
          className="field cursor-pointer"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <p className="mt-2 text-[11.5px] text-ink-3">
          Marking an order cancelled returns its items to stock.
        </p>
      </div>

      <div className="mt-5">
        <label className="field-label" htmlFor="o-payment">Payment</label>
        <select
          id="o-payment"
          value={paymentStatus}
          disabled={busy}
          onChange={(e) => update({ paymentStatus: e.target.value })}
          className="field cursor-pointer"
        >
          {['PENDING', 'PAID', 'FAILED'].map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>
    </section>
  );
}
