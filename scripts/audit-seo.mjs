// Read-only HTTP smoke audit: node scripts/audit-seo.mjs [origin]
import assert from 'node:assert/strict';

const origin = process.argv[2] || 'https://www.radhekrishnacollection.com';
const canonicalOrigin = 'https://www.radhekrishnacollection.com';
const get = async (path) => {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(45000) });
  return { response, text: await response.text() };
};
const attr = (tag, key) => tag.match(new RegExp(`\\b${key}=["']([^"']*)["']`, 'i'))?.[1];
const audit = async (path) => {
  const { response, text } = await get(path);
  const tags = text.match(/<(?:meta|link)\b[^>]*>/gi) || [];
  const schemas = [...text.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((m) => JSON.parse(m[1]));
  return {
    path, status: response.status, finalUrl: response.url,
    title: text.match(/<title>([\s\S]*?)<\/title>/i)?.[1],
    canonical: attr(tags.find((t) => attr(t, 'rel') === 'canonical') || '', 'href'),
    robots: attr(tags.find((t) => attr(t, 'name') === 'robots') || '', 'content'),
    h1Count: (text.match(/<h1\b/gi) || []).length,
    schemas: schemas.map((s) => s['@type']),
    businessAddress: schemas.find((s) => s['@id'] === `${canonicalOrigin}/#organization`)?.address,
    hasPriceExpiry: schemas.some((s) => s.offers?.priceValidUntil),
    hasRatingMarkup: schemas.some((s) => s.aggregateRating),
  };
};

const { response: robotsResponse, text: robots } = await get('/robots.txt');
const { response: sitemapResponse, text: sitemap } = await get('/sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const product = urls.find((url) => new URL(url).pathname.startsWith('/product/'));
const category = urls.find((url) => new URL(url).pathname.startsWith('/category/'));
const paths = ['/', '/contact', '/shop', '/shop?page=2', '/shop?q=kundan', '/login'];
if (product) paths.push(new URL(product).pathname);
if (category) paths.push(`${new URL(category).pathname}?page=2`);
const pages = [];
for (let index = 0; index < paths.length; index += 2) {
  pages.push(...await Promise.all(paths.slice(index, index + 2).map(audit)));
}
console.log(JSON.stringify({ robotsStatus: robotsResponse.status, robots, sitemapStatus: sitemapResponse.status, sitemapCount: urls.length, sitemapHasLastmod: sitemap.includes('<lastmod>'), sitemapOrigins: [...new Set(urls.map((u) => new URL(u).origin))], pages }, null, 2));

if (process.argv.includes('--assert')) {
  assert.equal(robotsResponse.status, 200);
  assert.ok(robots.includes('Allow: /api/uploads/'));
  assert.equal(sitemapResponse.status, 200);
  assert.ok(urls.length > 10 && product && category);
  assert.ok(urls.every((url) => new URL(url).origin === canonicalOrigin));
  assert.ok(!urls.some((url) => url.includes('/policies/cancellation')));
  assert.equal(pages.find((p) => p.path === '/shop?page=2').canonical, `${canonicalOrigin}/shop?page=2`);
  assert.ok(pages.find((p) => p.path === '/shop?q=kundan').robots.includes('noindex'));
  assert.ok(pages.find((p) => p.path === '/login').robots.includes('noindex'));
  assert.equal(pages.find((p) => p.path === '/contact').businessAddress.postalCode, '452020');
  console.log('Production SEO smoke checks passed.');
}
