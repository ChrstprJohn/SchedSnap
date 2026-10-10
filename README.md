# SchedSnap

A class schedule wallpaper creator for university students. Choose a look, add your classes, and save a phone wallpaper that keeps your week one glance away.

The homepage opens with a static cream hero that fills the first viewport, layering a transparent phone foreground over a separate generated ambient background. Three stats below it show total visits, the actual template count and collection count, followed by four pure-white collection showcases: Little Friends, Mascots, Patterns and Originals. Each Create wallpaper action opens that collection in the template picker. The library contains 62 designs: 20 Chiikawa-inspired Little Friends editions, 20 animal mascots, six editable patterns and 16 originals. The existing `/services/schedule-wallpaper` URL remains compatible.

The flow is **Design → Classes → Download**, guided by page headings and actions. Upload a registration-form image for Gemini extraction, enter classes manually, or try sample data. Review subjects, course codes, days, times and rooms before downloading a 1080 × 2400 PNG. Optional appearance controls edit colors, fonts and day-container styling. Missing or invalid details and schedules that cannot fit block export with a recovery action.

Classes, images and per-design settings remain in browser memory until refresh. There is no account or saved schedule history. Uploaded images are sent to Google for analysis and are not stored by the application. The API key stays server-side. An optional Redis counter stores only the aggregate homepage visit total; it is not configured yet.

## Development

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` and `GEMINI_MODEL`; an existing `.env` also works. The verified model configuration is `gemini-3.1-flash-lite`. `npm run dev` runs the frontend and local API adapter. `npm run dev:full` uses the Vercel runtime and may require login and project linking. Run servers in the foreground and stop them when finished.

For real visit totals, set server-only `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` using an existing Redis database, then restart the dev server (or configure those variables for deployment). Until connected, Total visits displays `—`. See [visit-counter setup and counting rules](documentation/VISIT_COUNTER.md).

PostHog is enabled when `VITE_POSTHOG_TOKEN` is configured in `.env.local` or the hosting build environment. Use a public project token and `VITE_POSTHOG_HOST` for this application's PostHog project. Events have `site_name: schedsnap` and `environment: production` or `development`; filter both properties on the production dashboard. Pageviews, clicks, design choices, imports, previews and download initiation are tracked. Session recording is disabled, DOM text/attributes are masked, and custom events omit schedule contents and image data. Location analytics use PostHog's approximate GeoIP without a browser permission prompt. See the [independent PostHog documentation](documentation/posthog/README.md) for setup, implementation, events and the dashboard prompt. Rebuild after setting deployment variables.

```sh
npm run lint
npm test
npm run build
```

React + Vite, Tailwind CSS, React Router, Lucide, Axios, GSAP, Zod and the Google Gen AI SDK support the application. HTML5 Canvas renders previews and PNG exports. Vercel configuration is present; deployment has not been performed.

The current automated suite passes all 36 tests. Lint and production build pass. The latest hero and stats geometry check covers ten phone, landscape, tablet and desktop sizes from 320 to 1920px. The final visual review returned ship with no material fixes. The earlier workflow audit also checked template selection, class editing, appearance controls and branded PNG generation. See [completion evidence](documentation/COMPLETION_AUDIT.md).

## Documentation

- [Image asset organization and inventory](documentation/IMAGE_ASSETS.md)
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
