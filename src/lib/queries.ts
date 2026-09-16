import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

export const productCard = {
  id: true,
  name: true,
  slug: true,
  price: true,
  mrp: true,
  stock: true,
  material: true,
  color: true,
  occasion: true,
  isNew: true,
  isBestseller: true,
  isFeatured: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  images: { select: { url: true, alt: true }, orderBy: { sortOrder: 'asc' as const }, take: 2 },
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductSelect;

export type ProductCard = Prisma.ProductGetPayload<{ select: typeof productCard }>;

/** Collapses the review rows a card query returns into an average + count. */
export function withRating<T extends { reviews: { rating: number }[] }>(p: T) {
  const count = p.reviews.length;
  const avg = count ? p.reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const { reviews, ...rest } = p;
  return { ...rest, rating: Math.round(avg * 10) / 10, reviewCount: count };
}

export type CardProduct = ReturnType<typeof withRating<ProductCard>>;

export type ShopFilters = {
  category?: string;
  q?: string;
  materials?: string[];
  colors?: string[];
  occasions?: string[];
  min?: number;
  max?: number;
  sort?: string;
  page?: number;
  perPage?: number;
  inStockOnly?: boolean;
};

export async function getProducts(f: ShopFilters = {}) {
  const perPage = f.perPage ?? 12;
  const page = Math.max(1, f.page ?? 1);

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (f.category) where.category = { slug: f.category };
  if (f.materials?.length) where.material = { in: f.materials };
  if (f.colors?.length) where.color = { in: f.colors };
  if (f.occasions?.length) where.occasion = { in: f.occasions };
  if (f.inStockOnly) where.stock = { gt: 0 };
  if (f.min != null || f.max != null) {
    where.price = {};
    if (f.min != null) where.price.gte = f.min;
    if (f.max != null) where.price.lte = f.max;
  }
  if (f.q) {
    const q = f.q.trim();
    const ci = { mode: 'insensitive' } as const;
    where.OR = [
      { name: { contains: q, ...ci } },
      { shortDesc: { contains: q, ...ci } },
      { description: { contains: q, ...ci } },
      { material: { contains: q, ...ci } },
      { occasion: { contains: q, ...ci } },
      { sku: { contains: q, ...ci } },
      { category: { is: { name: { contains: q, ...ci } } } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
  if (f.sort === 'new') orderBy = [{ createdAt: 'desc' }];
  if (f.sort === 'price-asc') orderBy = [{ price: 'asc' }];
  if (f.sort === 'price-desc') orderBy = [{ price: 'desc' }];
  if (f.sort === 'rating') orderBy = [{ reviews: { _count: 'desc' } }, { createdAt: 'desc' }];

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCard,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  let items = rows.map(withRating);
  // Discount ordering needs the computed field, so it is applied after fetch.
  if (f.sort === 'discount') {
    items = items.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
  }

  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      reviews: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!p || !p.isActive) return null;
  const count = p.reviews.length;
  const avg = count ? p.reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { ...p, rating: Math.round(avg * 10) / 10, reviewCount: count };
}

export async function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
  const rows = await prisma.product.findMany({
    where: { categoryId, id: { not: excludeId }, isActive: true },
    select: productCard,
    take,
    orderBy: { isBestseller: 'desc' },
  });
  return rows.map(withRating);
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    select: productCard,
  });
  const byId = new Map(rows.map((r) => [r.id, withRating(r)]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as CardProduct[];
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
}

export async function getHomeSections() {
  const [featured, newest, bestsellers] = await Promise.all([
    prisma.product.findMany({ where: { isFeatured: true, isActive: true }, select: productCard, take: 8 }),
    prisma.product.findMany({ where: { isActive: true }, select: productCard, orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.product.findMany({ where: { isBestseller: true, isActive: true }, select: productCard, take: 8 }),
  ]);
  return {
    featured: featured.map(withRating),
    newest: newest.map(withRating),
    bestsellers: bestsellers.map(withRating),
  };
}
