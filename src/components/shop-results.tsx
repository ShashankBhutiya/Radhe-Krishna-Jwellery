import { getProducts } from '@/lib/queries';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/product-card';
import { FilterPanel, SortBar, ActiveChips, Pagination } from '@/components/shop-filters';
import { Empty } from '@/components/ui';
import { PRICE_BANDS } from '@/lib/site';
import { catalogPage, type CatalogParams as SP } from '@/lib/catalog-seo';

const asArray = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

/** Shared by /shop and /category/[slug]. */
export async function ShopResults({
  searchParams,
  categorySlug,
}: {
  searchParams: SP;
  categorySlug?: string;
}) {
  const bandLabel = typeof searchParams.band === 'string' ? searchParams.band : undefined;
  const band = PRICE_BANDS.find((b) => b.label === bandLabel);

  const { items, total, page, pages } = await getProducts({
    category: categorySlug,
    q: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    materials: asArray(searchParams.material),
    occasions: asArray(searchParams.occasion),
    colors: asArray(searchParams.colour),
    min: band?.min,
    max: band?.max,
    sort: typeof searchParams.sort === 'string' ? searchParams.sort : 'featured',
    page: catalogPage(searchParams.page),
    perPage: 12,
    inStockOnly: searchParams.stock === 'in',
  });

  if (page > pages) notFound();

  return (
    <div className="grid gap-10 lg:grid-cols-[248px_1fr] lg:gap-14">
      <aside className="hidden lg:block">
        <div className="sticky top-32">
          <FilterPanel />
        </div>
      </aside>

      <div>
        <SortBar total={total} showing={items.length} />
        <ActiveChips />

        <div className="mt-10">
          {items.length === 0 ? (
            <Empty
              title="Nothing matches those filters"
              copy="Try widening the price band or clearing a material — the collection changes weekly."
              action={{ href: '/shop', label: 'View all pieces' }}
            />
          ) : (
            <ProductGrid products={items} cols={3} />
          )}
        </div>

        <Pagination page={page} pages={pages} />
      </div>
    </div>
  );
}
