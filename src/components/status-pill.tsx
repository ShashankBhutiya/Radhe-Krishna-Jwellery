import { cn } from '@/lib/utils';

const TONES: Record<string, string> = {
  PLACED: 'border-line bg-canvas-2 text-ink-2',
  CONFIRMED: 'border-gold/40 bg-gold-pale text-gold-deep',
  PACKED: 'border-gold/40 bg-gold-pale text-gold-deep',
  SHIPPED: 'border-forest/30 bg-forest/8 text-forest',
  DELIVERED: 'border-forest/40 bg-forest text-white',
  CANCELLED: 'border-wine/30 bg-wine/8 text-wine',
  PAID: 'border-forest/40 bg-forest/10 text-forest',
  PENDING: 'border-line bg-canvas-2 text-ink-2',
  FAILED: 'border-wine/30 bg-wine/8 text-wine',
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-label',
        TONES[status] ?? TONES.PLACED,
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}
