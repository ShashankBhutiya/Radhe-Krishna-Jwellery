import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { CheckoutForm } from '@/components/checkout-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order securely.',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await getSession();

  const [user, addresses] = await Promise.all([
    session
      ? prisma.user.findUnique({
          where: { id: session.id },
          select: { name: true, email: true, phone: true },
        })
      : null,
    session
      ? prisma.address.findMany({
          where: { userId: session.id },
          orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
        })
      : [],
  ]);

  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-12 text-center lg:py-16">
          <span className="label">One last step</span>
          <h1 className="display-lg mt-3">Checkout</h1>
          <span className="mx-auto mt-5 block h-px w-14 bg-gold-soft" />
        </div>
      </header>

      <div className="container-lux py-12 lg:py-16">
        <CheckoutForm user={user} addresses={addresses} />
      </div>
    </>
  );
}
