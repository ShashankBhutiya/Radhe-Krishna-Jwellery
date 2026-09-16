'use client';

import { useRouter } from 'next/navigation';
import { Mail, MailOpen, Trash2, Phone } from 'lucide-react';
import { formatDateTime, cn } from '@/lib/utils';
import { useUI } from '@/store/ui';

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export function MessageList({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const toast = useUI((s) => s.toast);

  async function toggleRead(m: Message) {
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: m.id, isRead: !m.isRead }),
    });
    router.refresh();
  }

  async function remove(m: Message) {
    if (!confirm('Delete this message from ' + m.name + '?')) return;
    await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: m.id }),
    });
    toast('Message deleted');
    router.refresh();
  }

  if (messages.length === 0) {
    return (
      <div className="mt-6 border border-dashed border-line bg-white/50 px-6 py-16 text-center">
        <Mail size={26} strokeWidth={1} className="mx-auto text-gold-soft" />
        <p className="mt-4 font-display text-2xl font-light">No messages</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">Enquiries from the contact page land here.</p>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-4">
      {messages.map((m) => (
        <li key={m.id} className={cn('card-surface p-5', !m.isRead && 'border-gold/40 bg-gold-pale/40')}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-display text-xl">{m.subject}</span>
                {!m.isRead ? (
                  <span className="border border-gold/40 bg-gold px-2 py-0.5 text-[9px] uppercase tracking-label text-white">
                    New
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[12.5px] text-ink-3">
                {m.name} · {formatDateTime(m.createdAt)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => toggleRead(m)}
                aria-label={m.isRead ? 'Mark unread' : 'Mark read'}
                className="grid h-8 w-8 place-items-center text-ink-3 hover:text-gold-deep"
              >
                {m.isRead ? <MailOpen size={15} strokeWidth={1.6} /> : <Mail size={15} strokeWidth={1.6} />}
              </button>
              <button
                type="button"
                onClick={() => remove(m)}
                aria-label="Delete message"
                className="grid h-8 w-8 place-items-center text-ink-3 hover:text-wine"
              >
                <Trash2 size={15} strokeWidth={1.6} />
              </button>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-ink-2">{m.message}</p>

          <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3.5 text-[12.5px]">
            <a href={'mailto:' + m.email + '?subject=Re: ' + encodeURIComponent(m.subject)} className="flex items-center gap-2 text-gold-deep hover:text-ink">
              <Mail size={13} strokeWidth={1.6} /> {m.email}
            </a>
            {m.phone ? (
              <a href={'tel:' + m.phone} className="flex items-center gap-2 text-gold-deep hover:text-ink">
                <Phone size={13} strokeWidth={1.6} /> {m.phone}
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
