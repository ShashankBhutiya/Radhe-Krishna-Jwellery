import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package, MapPin, Heart, User, LayoutDashboard } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { AccountNav, SignOutButton } from '@/components/account-nav';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  const links = [
    { href: '/account', label: 'Overview', icon: 'user' as const },
    { href: '/account/orders', label: 'Orders', icon: 'package' as const },
    { href: '/account/addresses', label: 'Addresses', icon: 'pin' as const },
    { href: '/wishlist', label: 'Wishlist', icon: 'heart' as const },
  ];

  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-12 lg:py-16">
          <span className="label">Your account</span>
          <h1 className="display-lg mt-3">Hello, {user.name.split(' ')[0]}</h1>
          <p className="mt-3 text-[14px] text-ink-2">{user.email}</p>
        </div>
      </header>

      {/* min-w-0 lets the columns shrink; without it their content sets the floor. */}
      <div className="container-lux grid gap-10 py-12 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-16">
        <aside className="min-w-0">
          <div className="lg:sticky lg:top-32">
            <AccountNav links={links} />

            {user.role === 'ADMIN' ? (
              <Link
                href="/admin"
                className="mt-6 flex items-center gap-3 border border-gold bg-gold-pale px-4 py-3 text-[12.5px] text-gold-deep transition-colors hover:bg-gold hover:text-white"
              >
                <LayoutDashboard size={15} strokeWidth={1.6} />
                Store dashboard
              </Link>
            ) : null}

            <div className="mt-6 border-t border-line pt-6">
              <SignOutButton />
            </div>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
