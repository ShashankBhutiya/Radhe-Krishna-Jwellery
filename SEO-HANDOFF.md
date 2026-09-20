# SEO release — 19 September 2026

## Business details

Owner-confirmed address: **668 Mount burg, Nayta Mundla, Indore, Madhya Pradesh 452020, India**.
Existing contact number: **+91 99930 07021**. Preferred domain: **https://www.radhekrishnacollection.com** (the live bare domain redirects to www).

The address is maintained in `src/lib/site.ts` and shared by the footer, contact page and business structured data. The contact page includes an address search on Google Maps; this is not a claimed or verified Google Business Profile. The previously configured city-centre coordinates are no longer published as the shop location. Existing hours, care email and Instagram URL should be confirmed by the owner.

## Implemented in this revision

- Correct catalog pagination canonicals: `/shop?page=2` and category page two identify themselves; page one omits `?page=1`. Search, filtering and non-default sorting use `noindex, follow`. Invalid page inputs are normalized; out-of-range result pages trigger not-found handling.
- Product photos served by `/api/uploads/` are explicitly crawlable. Public utility pages remain crawlable so search engines can see their `noindex` directives. Account/admin routes retain authentication and crawler exclusions.
- The sitemap contains canonical public pages, active products and categories with active products. It excludes the duplicate cancellation-policy alias, omits invented modification dates and does not cache an incomplete success response on database failure.
- Removed duplicated brand names from page titles, shortened product/category descriptions, removed the inherited home-only language alternate, and added descriptive shop/contact headings.
- Added the full confirmed address to business markup, connected ContactPage to the same business entity, and added location text and an address-search link on the contact page.
- Preserved Product/Offer, Breadcrumb, Article, WebSite, FAQ, sharing metadata, icons and Search Console verification support already present. Product shipping reflects current configuration; the arbitrary rolling price-expiry date is removed. Delivery markup now accommodates the published eight-day maximum.
- Removed hard-coded homepage testimonials and rating/inventory figures. Product review rich-result markup is off by default because the seed script creates generated reviews. Existing review records are untouched. Audit their provenance and remove demo data before setting `PRODUCT_REVIEWS_VERIFIED=true`.
- Deduplicated product and category queries within a request using React cache. Shared catalog rendering lives outside the page module so Next's page-export checks pass.
- Vercel builds use `npm run build:local`; SEO deployments do not run `prisma db push` against production.

## Checks

The production build completed, including TypeScript validation and route generation. Sandbox database connectivity produced warnings; this does not verify live data rendering. Further changes were type-checked. Focused assertions cover page-two canonicals, filter/search indexing, malformed pagination, image crawler access and the confirmed address.

Read-only live audit: `node scripts/audit-seo.mjs`. Release acceptance: `node scripts/audit-seo.mjs https://www.radhekrishnacollection.com --assert`.

The pre-release live audit found 85 sitemap URLs on the bare domain, www pages canonicalizing to the bare domain, blocked uploaded photos, duplicate title branding, page-two canonicals pointing to page one, indexable internal search and invented product price-expiry dates. Deployment status must be verified separately; this file alone does not claim a successful release.

## Deployment status

The live read-only audit succeeded. Publishing with Vercel CLI 59.23.2 to the existing linked project returned `deploy_failed: Not authorized`. This revision has **not** been confirmed deployed. Restore access to the project under the correct Vercel account, run `npx vercel --prod --yes`, and then run the release acceptance command above. No database schema push, seed, or customer-data mutation was performed.

## Account work and owner verification still needed

1. Google Business Profile: supply the existing listing link or claim the actual eligible business. Use the same name, address, phone and canonical website; confirm map pin, hours, category and service area. Add real storefront and product photos. Request honest customer reviews without incentives or review gating. Avoid duplicate listings.
2. Search Console: use the existing verification-token support or domain DNS verification, submit `/sitemap.xml`, inspect the homepage/contact/key category/product URLs, and monitor Pages and Merchant listings reports after recrawling. DNS changes require the domain account.
3. Merchant Center: verify the website, business details, shipping and returns against actual operations, then connect genuine inventory. No feed/account submission has been performed.
4. Analytics: no GA4 property ID or consent configuration was supplied. Confirm the existing property and privacy requirements before adding analytics; track purchases, product views and contact conversions.
5. Trust audit: verify email/social ownership, shop hours, warranty/material/skin-safety claims, product photos and descriptions, and remove demo reviews from production after reviewing exact records. No customer or catalog data was deleted.
6. Performance: measure mobile Core Web Vitals on production after release. Build output is not a field-performance score. Check LCP/INP/CLS with real traffic and PageSpeed Insights before claiming improvements.

## Guidance used

- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: faceted navigation](https://developers.google.com/search/blog/2024/12/crawling-december-faceted-nav)
- [Google: local business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google: product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Google: structured-data quality requirements](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

Markup makes pages eligible for supported search features; it does not guarantee rankings or rich results. FAQ rich results are generally restricted to eligible health/government sites.
