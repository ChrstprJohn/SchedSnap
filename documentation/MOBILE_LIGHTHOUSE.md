# Mobile landing-page Lighthouse fixes

Measured October 17, 2026 with Lighthouse 13.5.0 against the production build at `http://127.0.0.1:4173/`, using Lighthouse's default simulated mobile throttling and a clean browser profile.

| Metric | Before | After |
| --- | --- | --- |
| Mobile Performance | 91 | 95 |
| Largest Contentful Paint | 3.3s | 2.9s |
| Total Blocking Time | 50ms | 10ms |
| Speed Index | 3.1s | 2.4s |
| Cumulative Layout Shift | 0 | 0 |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 |

Desktop after the changes scores 100 in Performance, Accessibility, Best Practices, and SEO.

The landing page now hydrates the same app tree used for its prerendered HTML, retaining the existing hero image instead of replacing it. Other routes retain their existing mounting behavior. In-app browser detection uses a hydration-safe server snapshot. Wallpaper customization fonts load with the editor and admin routes, reducing the initial compressed stylesheet from 28.34 kB to 18.12 kB. Three responsive 560px tutorial images reduce their combined image payload from 159,910 to 92,604 bytes; larger images remain available for larger displays.

The production build, 13 focused SEO/deployment/consent/artwork tests, and lint on changed JavaScript files pass. Browser assertions verify hero DOM reuse, no hydration errors, no horizontal overflow at 320/390/412/768/1440px, mobile menu navigation, editor font loading, and the in-app browser notice. Full-project lint still reports six existing errors in unrelated temporary/publication scripts.

These are local lab measurements, not deployed PageSpeed results. Vite preview does not serve the serverless catalog and visit APIs, so live catalog/count delivery was not measured. The extra experimental Agentic Browsing category is outside this audit's four standard categories.

Raw reports: `output/lighthouse-mobile-before.json`, `output/lighthouse-mobile-after.json`, and `output/lighthouse-desktop-after.json`. Browser assertions: `output/inspect-mobile-landing.mjs` (uses the existing machine-local Puppeteer installation).
