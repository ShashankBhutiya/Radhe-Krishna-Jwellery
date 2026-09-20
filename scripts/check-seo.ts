import assert from 'node:assert/strict';
import { catalogMetadata, catalogPage } from '../src/lib/catalog-seo';
import robots from '../src/app/robots';
import { SITE, addressLine } from '../src/lib/site';

const meta = (params: Record<string, string | string[] | undefined>) =>
  catalogMetadata('/shop', 'Shop jewellery', 'Catalogue', params);

assert.equal(meta({}).alternates?.canonical, '/shop');
assert.equal(meta({ page: '1' }).alternates?.canonical, '/shop');
assert.equal(meta({ page: '2', utm_source: 'campaign' }).alternates?.canonical, '/shop?page=2');
assert.deepEqual(meta({ page: '2' }).robots, { index: true, follow: true });
assert.deepEqual(meta({ q: 'kundan' }).robots, { index: false, follow: true });
assert.deepEqual(meta({ material: ['Kundan', 'Polki'] }).robots, { index: false, follow: true });
assert.deepEqual(meta({ sort: 'price-asc' }).robots, { index: false, follow: true });
assert.deepEqual(meta({ sort: 'featured' }).robots, { index: true, follow: true });
for (const invalid of ['-1', '1.2', 'Infinity', 'NaN', '100001', ['2', '3'], undefined]) {
  assert.equal(catalogPage(invalid), 1);
}
const rules = robots().rules;
for (const rule of Array.isArray(rules) ? rules : [rules]) {
  assert.ok(Array.isArray(rule.allow) && rule.allow.includes('/api/uploads/'), 'Product photos must be crawlable');
  assert.ok(!rule.disallow?.includes('/login'), 'Crawlers must be able to read login noindex');
}
assert.equal(SITE.address.pincode, '452020');
assert.ok(addressLine().includes('668 Mount burg, Nayta Mundla'));
console.log('SEO checks passed: pagination, indexing, image crawling and confirmed address.');
