'use client';

import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { Spinner } from '@/components/ui';

const SUBJECTS = [
  'Question about an order',
  'Bulk / wedding enquiry',
  'Custom commission',
  'Return or exchange',
  'Something else',
];

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send your message');

      setConfirmation(data.message);
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div className="flex flex-col items-start gap-4 border border-gold/40 bg-gold-pale px-8 py-14">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-gold bg-white">
          <Check size={20} strokeWidth={1.6} className="text-gold-deep" />
        </span>
        <h2 className="display-md">Message sent</h2>
        <p className="max-w-md text-[15px] leading-relaxed text-ink-2">{confirmation}</p>
        <button
          type="button"
          onClick={() => {
            setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
            setState('idle');
          }}
          className="btn-outline btn-sm mt-2"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <h2 className="display-md">Send a message</h2>

      {error ? (
        <p className="mt-5 border border-wine/30 bg-wine/5 px-4 py-3 text-[13px] text-wine">{error}</p>
      ) : null}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="ct-name">Your name</label>
          <input id="ct-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="Ananya Sharma" />
        </div>
        <div>
          <label className="field-label" htmlFor="ct-phone">Phone <span className="ml-1 normal-case tracking-normal text-ink-3">(optional)</span></label>
          <input id="ct-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" placeholder="10-digit mobile number" />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="ct-email">Email address</label>
          <input id="ct-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" placeholder="you@example.com" />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="ct-subject">What is this about?</label>
          <select id="ct-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="field cursor-pointer">
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="ct-message">Your message</label>
          <textarea id="ct-message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="field resize-none" placeholder="Tell us what you need. Include an order number if you have one." />
        </div>
      </div>

      <button type="submit" disabled={state === 'loading'} className="btn-primary mt-7">
        {state === 'loading' ? <Spinner /> : <><Send size={13} strokeWidth={1.8} /> Send message</>}
      </button>
    </form>
  );
}
