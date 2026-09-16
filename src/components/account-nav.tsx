'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, MapPin, Heart, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/store/wishlist';

const ICONS = { user: User, package: Package, pin: MapPin, heart: Heart };

type Link = { href: string; label: string; icon: keyof typeof ICONS };

export function AccountNav({ links }: { links: Link[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b border-line px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:border-b-0 lg:px-0"
      aria-label="Account"
    >
      {links.map((l) => {
        const Icon = ICONS[l.icon];
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              // Active edge sits under the item on the mobile strip, beside it in the sidebar.
              'flex shrink-0 items-center gap-2.5 border-b-2 px-3 py-3 text-[13px] transition-colors lg:gap-3 lg:border-b-0 lg:border-l-2 lg:px-4',
              active
                ? 'border-gold text-ink lg:bg-gold-pale'
                : 'border-transparent text-ink-2 hover:border-gold-soft hover:text-ink',
            )}
          >
            <Icon size={15} strokeWidth={1.6} className={active ? 'text-gold-deep' : 'text-ink-3'} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const clearWishlist = useWishlist((s) => s.clear);

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearWishlist();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="flex w-auto items-center gap-2.5 px-3 py-3 text-[13px] text-ink-2 transition-colors hover:text-wine lg:w-full lg:gap-3 lg:px-4"
    >
      <LogOut size={15} strokeWidth={1.6} />
      Sign out
    </button>
  );
}
