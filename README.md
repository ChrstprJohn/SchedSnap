# SchedSnap

Redis reads, writes, command counts and the latest reductions are documented in [the Redis usage audit](documentation/REDIS_USAGE.md).

Design gallery hearts show public counts and toggle one like per browser per design. Hearts and counts update optimistically with no disabled saving state; requests stay ordered per design, repeated clicks preserve the latest choice, and failures restore the last confirmed state. `GET /api/likes` reads counts and that browser's liked state without setting a cookie. The first heart click creates a signed, HttpOnly, SameSite voting cookie lasting one year; a second request confirms the cookie was accepted before counting the vote. Likes operate separately from optional PostHog analytics. Votes use persistent Redis sets without expiry; atomic add/remove operations make repeated requests idempotent. A shared counts hash and per-browser liked-design hash replace per-design SCARD/SISMEMBER reads: after initialization, a cache miss uses one HGETALL for all counts and one for an identified browser. Guests need only the counts read. Counts are cached for 60 seconds per server instance, with concurrent reads shared; the browser reuses its personalized response for 60 seconds across focus events and gallery remounts. Confirmed votes update both indexes and the caches immediately. GET responses remain no-store to prevent shared caching of personal liked state. Existing counts are backfilled only for missing designs; legacy browser cookies retain their identity and their votes are indexed once, including hidden designs. New versioned cookies skip legacy scans. Public counts can lag by up to two minutes. Writes and cookie creation share a 60-requests-per-IP-per-minute Redis rate limit with hashed IPs and one-minute counter expiry. Configure the existing `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `IMPORT_LIMIT_SECRET` in production. Keep the secret stable to preserve browser identity. Missing/unavailable storage shows unavailable counts and prevents voting. Unconfigured local development uses memory, reset on restart. Different browsers, cleared cookies, or expired cookies can vote again; this is casual voting, not one vote per person.

AI imports are limited to 10 attempts per public IP per Philippine calendar day. Each valid import attempt counts once, including failed/cancelled attempts and regardless of Gemini key fallback. `GET /api/analyze` returns usage without consuming an attempt. Configure `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `IMPORT_LIMIT_SECRET` (a private random secret) in Vercel before deploying. Atomic Redis reservations enforce the limit across instances; production blocks AI imports when storage is unavailable. Local development uses memory when Redis is unconfigured. Shared Wi-Fi shares the allowance; changing networks changes the allowance. Manual entry remains unlimited.

A class schedule wallpaper creator for university students. Choose a look, add your classes, and save a phone wallpaper that keeps your week one glance away.

The homepage opens with a static cream hero that fills the first viewport, layering a transparent phone foreground over a separate generated ambient background. Three stats below it show total pageviews, the actual template count and collection count, followed by four pure-white collection showcases: Little Friends, Mascots, Patterns and Originals. Each Create wallpaper action opens that collection in the template picker. The library contains 62 designs: 20 Chiikawa-inspired Little Friends editions, 20 animal mascots, six editable patterns and 16 originals. The existing `/services/schedule-wallpaper` URL remains compatible.

The flow is **Design → Classes → Download**, guided by page headings and actions. Upload a registration-form image for Gemini extraction, enter classes manually, or try sample data. Review subjects, course codes, days, times and rooms before downloading a 1080 × 2400 PNG. Optional appearance controls edit colors, fonts and day-container styling. Missing or invalid details and schedules that cannot fit block export with a recovery action.

Classes, images and per-design settings remain in browser memory until refresh. There is no account or saved schedule history. Uploaded images are sent to Google for analysis and are not stored by the application. The API key stays server-side. The homepage reads its aggregate visit total from PostHog through a server API when query credentials are configured.

## Development

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` and `GEMINI_MODEL`; an existing `.env` also works. The verified model configuration is `gemini-3.1-flash-lite`. Set server-only `GEMINI_API_KEYS=key1,key2,key3` in development and Vercel to configure any number of keys. Each import starts with the first key and advances on quota/rate-limit errors (429), trying each unique key at most once within a shared 45-second request budget. Blank entries and duplicate keys are ignored. Existing `GEMINI_API_KEY` and `GEMINI_FALLBACK_API_KEY` remain supported and come before the list when set. All keys use the same model; other errors stop rotation. Keys in the same Google Cloud project share quota; the backup project must have available quota and access to the configured model. Restart development or redeploy after changing keys. `npm run dev` runs the frontend and local API adapter. `npm run dev:full` uses the Vercel runtime and may require login and project linking. Run servers in the foreground and stop them when finished.

For real pageview totals, set server-only `POSTHOG_PROJECT_ID` (643035), `POSTHOG_PERSONAL_API_KEY`, and optionally `POSTHOG_API_HOST` in development and deployment. Until connected, Total pageviews displays `—`. See [PostHog visit-count setup and counting rules](documentation/VISIT_COUNTER.md).

PostHog is enabled only when `VITE_POSTHOG_TOKEN` is configured in `.env.local` or the hosting build environment and the visitor accepts analytics in the cookie notice. Either choice is remembered in this browser; The Cookies tab beside Terms of Use and Privacy Policy opens `/cookies` to change it. Rejecting or leaving the notice unanswered keeps analytics off. Use a public project token and `VITE_POSTHOG_HOST` for this application's PostHog project. Events have `site_name: schedsnap` and `environment: production` or `development`; filter both properties on the production dashboard. Pageviews, clicks, design choices, imports, previews and download initiation are tracked after acceptance. Session recording is disabled, DOM text/attributes are masked, and custom events omit schedule contents and image data. Location analytics use PostHog's approximate GeoIP without a browser permission prompt. See the [independent PostHog documentation](documentation/posthog/README.md) for setup, implementation, events and the dashboard prompt. Rebuild after setting deployment variables.

```sh
npm run lint
npm test
npm run build
node scripts/check-seo.mjs
```

React + Vite, Tailwind CSS, React Router, Lucide, Axios, GSAP, Zod and the Google Gen AI SDK support the application. HTML5 Canvas renders previews and PNG exports. The public deployment uses Vercel.

The production build prerenders homepage and legal content, generates public-page metadata, sitemap.xml, and robots.txt, and keeps admin/editor sessions out of search results. See [search visibility setup and content priorities](documentation/SEO.md).

Wallpaper originals (`public/wallpapers/`) and mascot master folders stay local and are excluded from Git, CLI uploads, and production build output, including retired and unpublished artwork. Commit template metadata and `src/assets/cloudinaryManifest.js` after uploading artwork to Cloudinary. Keep landing-page delivery images, icons, and fonts in Git. `.gitignore` does not untrack previously committed files; use `git rm --cached` for originals already uploaded, preserving the local files. Old Git history does not need rewriting to reduce future deployment output. Local worktrees, transfer bundles, scratch files, and previous `dist/` builds are also excluded from CLI uploads.

The landing page ships responsive WebP previews and an AVIF hero with a WebP fallback. With the local originals and Pillow (WebP/AVIF support) available, run `python scripts/optimize-landing-images.py` after replacing landing artwork, and commit the generated `*-560.webp`, `*-960.webp`, hero sizes, maker and brand derivatives. Landing PNG sources remain local; the build copies only delivery assets. The editor's full-resolution Cloudinary artwork and PNG downloads are independent of these marketing previews. The optional PostHog SDK downloads only after analytics consent is granted; withdrawing consent during that download prevents initialization.

The current automated suite passes all 79 tests. Lint and production build pass. The latest hero and stats geometry check covers ten phone, landscape, tablet and desktop sizes from 320 to 1920px. The final visual review returned ship with no material fixes. The earlier workflow audit also checked template selection, class editing, appearance controls and branded PNG generation. See [completion evidence](documentation/COMPLETION_AUDIT.md).

## Documentation

- [Image asset organization and inventory](documentation/IMAGE_ASSETS.md)
- [Artwork generation and Cloudinary upload skill for contributors and AI agents](documentation/skills/schedsnap-artwork/SKILL.md)
- [Mobile, tablet and laptop showcases](documentation/DEVICE_SHOWCASES.md)
- [Mobile, tablet and laptop showcases](documentation/DEVICE_SHOWCASES.md)

- [Product behavior](PRODUCT.md)
- [Design system](DESIGN.md)
- [Landing page](documentation/LANDING_PAGE.md)
- [Project status and completion criteria](documentation/PROJECT_PLAN.md)
- [Technical setup and extension guide](documentation/TECH_STACK.md)
- [PostHog analytics setup, implementation and dashboards](documentation/posthog/README.md)
- [Wallpaper templates, artwork prompts and provenance](documentation/WALLPAPER_TEMPLATES.md)
- [Hero and generated-asset provenance](documentation/HERO_BACKGROUND.md)
- [Exact generated asset prompts, history and source paths](output/imagegen/schedsnap/prompts.json)
- [Image revisions](output/imagegen/schedsnap/revisions.json)
- [Completion and responsive audit](documentation/COMPLETION_AUDIT.md)

The AI allowance is read only while import controls are visible. There is no per-minute polling on the chooser or preview. Focus refreshes are throttled to one per minute while import controls are visible, with one scheduled check at the daily reset. Actual imports always reserve their allowance atomically on the server and return the authoritative used count.
