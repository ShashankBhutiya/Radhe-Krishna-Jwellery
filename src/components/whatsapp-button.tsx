'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useCart } from '@/store/cart';
import { SITE } from '@/lib/site';
import { cn, inr } from '@/lib/utils';

/**
 * Floating WhatsApp enquiry button. When the bag has items it pre-fills the
 * message with the order so the shop can quote directly on chat.
 */
export function WhatsAppButton() {
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!mounted) return null;

  const lines = items.map((i) => `• ${i.name} × ${i.qty} — ${inr(i.price * i.qty)}`);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const message = items.length
    ? `Hello ${SITE.shortName}! I would like to order:\n\n${lines.join('\n')}\n\nTotal: ${inr(total)}\n\nPlease confirm availability.`
    : `Hello ${SITE.shortName}! I have a question about your collection.`;

  return (
    <a
      href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        'group fixed bottom-6 left-6 z-40 flex items-center gap-3 rounded-full bg-[#1f8f4e] py-3.5 pl-4 pr-5 text-white shadow-lift transition-all duration-500 hover:bg-[#177a41]',
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
      )}
    >
      <MessageCircle size={19} strokeWidth={1.7} />
      <span className="hidden text-[11px] font-medium uppercase tracking-wider2 sm:inline">
        {items.length ? `Order on WhatsApp (${items.length})` : 'Chat with us'}
      </span>
    </a>
  );
}
