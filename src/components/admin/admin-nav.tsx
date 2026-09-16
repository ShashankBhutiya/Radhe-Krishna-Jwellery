'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Ticket, Users, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b border-line px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:border-b-0 lg:px-0"
      aria-label="Admin"
    >
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              // Active edge sits under the item on the mobile strip, beside it in the sidebar.
              'flex shrink-0 items-center gap-2.5 border-b-2 px-3 py-3 text-[13px] transition-colors lg:gap-3 lg:border-b-0 lg:border-l-2 lg:px-4',
              active
                ? 'border-gold text-ink lg:bg-white'
                : 'border-transparent text-ink-2 hover:border-gold-soft hover:text-ink',
            )}
          >
            <l.icon size={15} strokeWidth={1.6} className={active ? 'text-gold-deep' : 'text-ink-3'} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
