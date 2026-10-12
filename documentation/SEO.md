# Search visibility

The canonical site is `https://schedsnap.vercel.app`. Change `SITE_URL` in `shared/seo.js` when moving to a custom domain, and redirect the old domain to the new one.

## Implemented

- `npm run build` renders the existing homepage and legal components into HTML. The browser still mounts the interactive app. The creator initially shows its normal catalog-loading state; its designs continue to load from the API.
- Public pages have distinct titles/descriptions, preferred canonical URLs, and Open Graph/Twitter sharing metadata. The homepage supplies factual `WebSite` JSON-LD without ratings, fabricated reviews, or unsupported rich-result claims.
- The build generates `dist/sitemap.xml` and `dist/robots.txt`. The sitemap lists the homepage, creator, terms, and privacy pages, without editor sessions, device filters, admin, or API URLs.
- Vercel serves separate HTML for each public page. Admin/editor routes receive `noindex` metadata and HTTP headers. Crawling stays allowed so search engines can read those rules; these rules are not access controls.
- The old mobile/tablet/laptop gallery aliases permanently redirect to the creator's matching device filter.
- `PageSeo` updates metadata on client navigation. Editor sessions keep the main creator canonical, and unknown client routes receive `noindex`.

## After deployment

1. Open `https://schedsnap.vercel.app/sitemap.xml` and confirm XML appears.
2. In the verified Search Console property, open **Sitemaps**, submit `sitemap.xml`, and check its status.
3. Inspect the homepage and creator URL. Use **Test live URL** and review the rendered HTML before requesting indexing.
4. Monitor the Pages report for crawl/indexing problems and the Performance report for impressions, queries, and clicks.

## Content priorities

Useful topics that fit the actual product include class schedule wallpaper creation, school timetable lock screens, and layouts for phone, tablet, and laptop. These are topic suggestions, not measured search-volume claims.

Create original guides with actual exported examples, readable instructions, supported device sizes, and a link into the creator. Make dedicated device landing pages only when they contain distinct helpful content; the current device URLs are redirects. Explain manual entry and upload/review behavior accurately. Measure image size and Core Web Vitals on the deployed site before prioritizing performance changes. Seek relevant links from student communities and university organizations where sharing the tool is welcome.

The live site checked on October 12, 2026 returned an empty React root in its homepage HTML; robots.txt, sitemap.xml, and /wallpapers/mobile returned 404 before these changes. Local production artifact checks cover prerendered content, canonical URLs, referenced assets, indexing rules, and the verification file. Browser-based local checks were unavailable in this environment, and post-deployment routing/indexing must still be verified.

References: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [sitemap submission](https://support.google.com/webmasters/answer/7451001).
