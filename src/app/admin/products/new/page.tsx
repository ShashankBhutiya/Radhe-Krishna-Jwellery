import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="display-md">New product</h1>
      <p className="mt-2 text-[14px] text-ink-2">Add a piece to the catalogue.</p>
      <ProductForm categories={categories} />
    </div>
  );
}
