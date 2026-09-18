import type { Metadata } from 'next';
import { CartView } from '@/components/cart-view';

export const metadata: Metadata = {
  title: 'Your bag',
  description: 'Review the pieces in your bag before checkout.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-12 text-center lg:py-16">
          <span className="label">Almost yours</span>
          <h1 className="display-lg mt-3">Your bag</h1>
          <span className="mx-auto mt-5 block h-px w-14 bg-gold-soft" />
        </div>
      </header>

      <div className="container-lux py-12 lg:py-16">
        <CartView />
      </div>
    </>
  );
}
