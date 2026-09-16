import { prisma } from '@/lib/prisma';
import { CouponManager } from '@/components/admin/coupon-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCoupons() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <h1 className="display-md">Coupons</h1>
      <p className="mt-2 text-[14px] text-ink-2">Discount codes customers can apply at checkout.</p>
      <CouponManager
        coupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          minOrder: c.minOrder,
          maxDiscount: c.maxDiscount,
          description: c.description,
          active: c.active,
          usedCount: c.usedCount,
        }))}
      />
    </div>
  );
}
