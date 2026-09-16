'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { ImagePicker } from '@/components/admin/image-picker';
import { useUI } from '@/store/ui';
import { slugify, inr, discountPct } from '@/lib/utils';
import { MATERIALS, COLORS, OCCASIONS } from '@/lib/site';

type Category = { id: string; name: string };

export type ProductDraft = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  shortDesc: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  categoryId: string;
  material: string;
  color: string;
  occasion: string;
  weightGrams: number;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  isActive: boolean;
  images: string[];
};

const BLANK = (categoryId: string): ProductDraft => ({
  name: '', slug: '', sku: '', shortDesc: '', description: '',
  price: 0, mrp: 0, stock: 10, categoryId,
  material: MATERIALS[0], color: COLORS[0], occasion: OCCASIONS[0],
  weightGrams: 30, isFeatured: false, isNew: true, isBestseller: false, isActive: true,
  images: [],
});

export function ProductForm({ categories, product }: { categories: Category[]; product?: ProductDraft }) {
  const router = useRouter();
  const toast = useUI((s) => s.toast);

  const [form, setForm] = useState<ProductDraft>(product ?? BLANK(categories[0]?.id ?? ''));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!product?.id;

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const payload = {
      ...form,
      slug: form.slug.trim() || slugify(form.name),
      sku: form.sku.trim() || 'RK-' + Date.now().toString().slice(-6),
      price: Number(form.price),
      mrp: Number(form.mrp) || Number(form.price),
      stock: Number(form.stock),
      weightGrams: Number(form.weightGrams),
    };

    try {
      const res = await fetch(isEdit ? '/api/admin/products/' + product!.id : '/api/admin/products', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save the product');

      toast(isEdit ? 'Product updated' : 'Product created');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  }

  async function remove() {
    if (!product?.id) return;
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setBusy(true);
    const res = await fetch('/api/admin/products/' + product.id, { method: 'DELETE' });
    if (res.ok) {
      toast('Product deleted');
      router.push('/admin/products');
      router.refresh();
    } else {
      toast('Could not delete that product', 'error');
      setBusy(false);
    }
  }

  const off = discountPct(Number(form.price), Number(form.mrp));

  return (
    <form onSubmit={save} className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {error ? (
          <p className="border border-wine/30 bg-wine/5 px-4 py-3 text-[13px] text-wine">{error}</p>
        ) : null}

        <section className="card-surface p-6">
          <h2 className="font-display text-xl font-light">Basics</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="p-name">Product name</label>
              <input
                id="p-name"
                required
                value={form.name}
                onChange={(e) => {
                  set('name', e.target.value);
                  if (!isEdit) set('slug', slugify(e.target.value));
                }}
                className="field"
                placeholder="Rajwada Kundan Choker Set"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="p-slug">URL slug</label>
              <input
                id="p-slug"
                required
                value={form.slug}
                onChange={(e) => set('slug', slugify(e.target.value))}
                className="field"
                placeholder="rajwada-kundan-choker-set"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="p-sku">SKU</label>
              <input
                id="p-sku"
                value={form.sku}
                onChange={(e) => set('sku', e.target.value.toUpperCase())}
                className="field"
                placeholder="RK-NEC-1042"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="p-short">Short description</label>
              <input
                id="p-short"
                required
                value={form.shortDesc}
                onChange={(e) => set('shortDesc', e.target.value)}
                className="field"
                placeholder="Kundan necklace set finished for bridal wear."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="p-desc">Full description</label>
              <textarea
                id="p-desc"
                required
                rows={5}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="field resize-none"
                placeholder="How it is made, how it wears, what it comes with."
              />
            </div>
          </div>
        </section>

        <section className="card-surface p-6">
          <h2 className="font-display text-xl font-light">Attributes</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="p-cat">Category</label>
              <select id="p-cat" required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className="field cursor-pointer">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="p-material">Material</label>
              <select id="p-material" value={form.material} onChange={(e) => set('material', e.target.value)} className="field cursor-pointer">
                {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="p-colour">Colour</label>
              <select id="p-colour" value={form.color} onChange={(e) => set('color', e.target.value)} className="field cursor-pointer">
                {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="p-occasion">Occasion</label>
              <select id="p-occasion" value={form.occasion} onChange={(e) => set('occasion', e.target.value)} className="field cursor-pointer">
                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="p-weight">Weight (grams)</label>
              <input id="p-weight" type="number" min={1} value={form.weightGrams} onChange={(e) => set('weightGrams', Number(e.target.value))} className="field" />
            </div>

            <div>
              <label className="field-label" htmlFor="p-stock">Stock on hand</label>
              <input id="p-stock" type="number" min={0} value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} className="field" />
            </div>
          </div>
        </section>

        <section className="card-surface p-6">
          <h2 className="font-display text-xl font-light">Images</h2>
          <p className="mt-1.5 text-[12.5px] text-ink-3">
            Upload from this device or shoot straight from the camera on a phone. Pasted links only render for
            whitelisted hosts &mdash; add your own to <code className="text-ink-2">next.config.mjs</code> first.
          </p>

          <div className="mt-4">
            <ImagePicker images={form.images} onChange={(next) => set('images', next)} onError={setError} />
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
        <section className="card-surface p-6">
          <h2 className="font-display text-xl font-light">Pricing</h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="field-label" htmlFor="p-price">Selling price (₹)</label>
              <input id="p-price" type="number" min={0} required value={form.price} onChange={(e) => set('price', Number(e.target.value))} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="p-mrp">MRP (₹)</label>
              <input id="p-mrp" type="number" min={0} value={form.mrp} onChange={(e) => set('mrp', Number(e.target.value))} className="field" />
            </div>

            {off > 0 ? (
              <p className="bg-gold-pale px-3 py-2.5 text-[12.5px] text-gold-deep">
                Shows as <strong className="font-medium">{off}% off</strong> — customer saves{' '}
                {inr(Number(form.mrp) - Number(form.price))}
              </p>
            ) : null}
          </div>
        </section>

        <section className="card-surface p-6">
          <h2 className="font-display text-xl font-light">Visibility</h2>

          <div className="mt-5 space-y-3">
            {([
              ['isActive', 'Live on the storefront'],
              ['isFeatured', 'Show in Atelier Selection'],
              ['isNew', 'Tag as New'],
              ['isBestseller', 'Tag as Bestseller'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-3 text-[13.5px] text-ink-2">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="h-4 w-4 accent-[#B08D57]"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <div className="space-y-3">
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? <Spinner /> : <><Save size={13} strokeWidth={1.8} /> {isEdit ? 'Save changes' : 'Create product'}</>}
          </button>

          {isEdit ? (
            <button type="button" onClick={remove} disabled={busy} className="btn w-full border border-wine/30 py-3.5 text-wine hover:bg-wine hover:text-white">
              <Trash2 size={13} strokeWidth={1.8} /> Delete product
            </button>
          ) : null}
        </div>
      </aside>
    </form>
  );
}
