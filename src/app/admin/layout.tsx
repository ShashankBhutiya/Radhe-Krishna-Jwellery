import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';
import { SignOutButton } from '@/components/account-nav';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Store dashboard',
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect('/login?next=/admin');

  return (
    <div className="min-h-screen bg-canvas-2">
      <div className="container-lux grid gap-6 py-8 lg:grid-cols-[220px_1fr] lg:gap-12 lg:py-10">
        <aside className="min-w-0">
          <div className="lg:sticky lg:top-28">
            <div className="mb-4 lg:mb-6">
              <span className="label">Radhe Krishna</span>
              <p className="font-display text-2xl font-light">Dashboard</p>
              <p className="mt-1 truncate text-[11.5px] text-ink-3">{admin.email}</p>
            </div>

            <AdminNav />

            {/* Sits as a row under the mobile nav strip, as a list in the sidebar. */}
            <div className="mt-2 flex items-center gap-1 border-line pt-1 lg:mt-6 lg:block lg:border-t lg:pt-4">
              <Link href="/" className="block px-3 py-2.5 text-[13px] text-ink-2 hover:text-gold-deep lg:px-4">
                View storefront
              </Link>
              <SignOutButton />
            </div>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
