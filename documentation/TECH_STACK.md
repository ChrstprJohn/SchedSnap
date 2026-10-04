# SchedSnap technical setup

## Current choices

| Concern | Setup |
| --- | --- |
| Language | JavaScript with JSX, following the proposed directory structure |
| Frontend | React and Vite |
| Styling | Tailwind CSS with `@tailwindcss/vite` |
| Routing | React Router in declarative mode |
| Icons | Lucide React |
| HTTP | Shared Axios client in `src/lib/api.js` |
| Motion | GSAP and `@gsap/react` |
| API | Vercel Node.js functions in root `api/` |
| AI SDK | `@google/genai`, for server-side image extraction |
| Data validation | Zod in `shared/scheduleSchema.js` |
| Wallpaper export | HTML5 Canvas with full-resolution PNG export |
| Fonts | Locally bundled DM Sans Variable plus wallpaper appearance font choices |
| Checks | ESLint, Node test runner, Vite build |

No authentication or persistent schedule/upload storage is configured. An optional server-only Redis REST counter stores an aggregate homepage visit total; its credentials remain unconfigured. See [visit-counter setup](VISIT_COUNTER.md).

## Directory layout

```text
api/analyze.js                       Gemini extraction and error handling
api/visits.js                        Optional shared homepage visit counter
development/apiPlugin.js            Local Vite adapter for the same API handler
shared/scheduleSchema.js             Validated class/meeting data contract
shared/uploadLimits.js               Shared source/payload size limits
src/assets/                         Sixty-two presets, neutral preview data, sample schedule
src/assets/mascotTemplates.js        Twenty animal edition definitions
src/assets/littleFriendsTemplates.js Twenty Chiikawa-inspired character editions
public/wallpapers/                  Original background art without schedule text
public/wallpapers/mascots/           Twenty transparent animal cutouts without baked text
public/wallpapers/little-friends/    Twenty transparent reference-inspired character cutouts
src/components/                     Navbar, BrandMark, Hero, LandingStats, DesignShowcase, Footer
src/config/collections.js           Shared wallpaper collection definitions
src/lib/api.js                      Axios client
src/lib/visits.js                   Session visit request sharing and refresh deduplication
src/lib/animation.js                 GSAP React registration
src/pages/Home.jsx                  Viewport hero, three statistics and collection showcase
src/landing.css                     Cream hero, responsive collection rows, shared header
public/images/hero-ambient.webp      Generated decorative cream background
public/images/hero-phones.webp       Transparent three-phone foreground
public/images/collections/          Four pure-white illustrative scenes named <id>-white.webp
public/brand/schedsnap-mark.webp     Generated transparent navy S logo and favicon
output/imagegen/schedsnap/           Original generated PNGs and exact prompt manifest
src/pages/ScheduleWallpaper/        Template selection, upload, editor, preview/download
src/utils/canvasHelpers.js          Layout, text wrapping, rendering, and export
src/utils/imageHelpers.js           Image decoding and compression
tests/analyze.test.js                API boundary checks
tests/visits.test.js                 Counter errors, privacy and session deduplication
tests/wallpaper.test.js              Meeting grouping, validation, and layout checks
tests/fixtures/                     Synthetic registration form for upload verification
documentation/                      Product and setup documentation
```

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` and `GEMINI_MODEL`. An existing `.env` also works. Never commit the real key.
3. Use `npm run dev` for the frontend and the local API. `development/apiPlugin.js` loads the server handler into Vite's Node process; only `VITE_` variables can be exposed to browser code, so never add that prefix to the key.
4. Use `npm run dev:full` to test the Vercel local runtime instead. First use may require login and project linking. Keep its development command set to `npm run dev`, not `npm run dev:full`, to avoid recursion.
5. Stop the foreground server with Ctrl+C when finished.

Axios uses the same-origin `/api` path in both local runtimes and in production. The local adapter is development-only; deployed requests execute the Vercel function. `npm run preview` serves static build output only and does not run analysis.

## Student workflow

1. Start from the homepage Create wallpaper action, or a collection row that opens the gallery through `?collection=<id>`. Browse the 62 designs in the full gallery. Clicking one opens a native dialog preview. **Use this design** opens Classes. When changing a design from Download, selection returns to that screen with the existing classes. Gallery previews show actual classes when available, otherwise sample classes.
2. Upload a JPG/PNG/WebP image and select **Import classes**, enter classes manually, or try a sample. Review editable class summaries and resolve marked missing or invalid details. **Continue to preview** opens Download once classes are valid. Desktop review shows the live wallpaper beside the form; phones focus on the class list. There is no separate confirmation checkbox. Extracted date ranges remain preserved.
3. **Download wallpaper** creates a 1080 × 2400 PNG. **Edit classes**, **Change design**, and the optional **Customize appearance** disclosure provide flexible editing. Mobile customization keeps a small live preview visible. Missing details, asset failures, and overflowing layouts explain why export is blocked and provide recovery actions.

Template selection uses the existing wildcard route. The `step=preview` query identifies the final screen; gallery `return` and `step` parameters retain the return destination. React state owns classes, the selected image, and per-design appearance settings across tool navigation and browser Back/Forward. Refresh clears them.

Manual entry and a five-class sample with one meeting each Monday–Friday are available in the upload step without calling Gemini. All edits are in React memory and are lost on refresh. The app does not save forms or schedule history.

Output is fixed to a mobile portrait PNG at 1080 × 2400. All templates share a Class Schedule title, separate growing day cards, and consistent time/subject columns in DM Sans Variable. Circular weekday initials stay centered within each card for any meeting count. Times include minutes and AM/PM, e.g. 7:00 AM–10:00 AM, and center vertically beside their meeting's subject/details block. Every meeting is preserved, long subjects stay on one line with up to 20% shrinking then an ellipsis, and empty days are skipped. Body type adjusts from 42px down to 28px. Historical preset heading/row fields are unused; palettes and background artwork still vary. Overflow, unreadable days/times, and reverse ranges block export. Overlapping meetings appear as review notes.

Mascot templates use transparent animal cutouts over uniform Canvas background fills. Canvas supplies the title and edition labels; art contains no timetable or edition text. Occupied alpha bounds normalize to a fixed 620px maximum dimension, independent of schedule density, without modifying the PNG. The timetable ends by y1740 and animal art starts at y1780 or below. Gallery artwork loads near the viewport through IntersectionObserver, and images/fonts are cached before drawing. [Wallpaper documentation](WALLPAPER_TEMPLATES.md) links all 20 species and their exact generation prompts/provenance. Some cutouts contain subtle interior shading despite flat-color prompt constraints.

The interface uses white surfaces, slate text, DM Sans and restrained borders. Design → Classes → Download is guided by page headings and actions without a separate step indicator. The sticky editor header contains only the SchedSnap brand. The home header transparently overlays the static layered hero before turning white after scrolling. The home header shows Create wallpaper only after scrolling past 8px and only above 640px; editor headers remain brand-only. Screens through 800px and portrait tablets through 1100px center copy and stack equal-width actions, while landscape tablets and desktop use left-aligned columns; Explore is outlined. Each step renders only its task, and the tool omits the marketing footer. Upload and extracted details share the same page width and alignment. Desktop meeting fields fit in a compact row, while mobile fields stack without extra panel wrappers. The final step dedicates the page to the wallpaper, with download beside it on desktop and below it on mobile. Modal previews use native dialog focus trapping, Escape dismissal, and scroll locking.

## GSAP conventions

Import `gsap` and `useGSAP` from `src/lib/animation.js`. Scope selectors to a component ref, and use the React hook for cleanup when a component unmounts. Use `gsap.matchMedia()` to honor `prefers-reduced-motion`, and revert its context during cleanup.

The static hero fills `100svh` on desktop and `100dvh` through 1100px, minus any in-app-browser advisory, with no animation hook. A decorative cream background covers the section; a separate transparent three-phone foreground uses contain sizing and a 1.18 scale to compensate for its transparent margins. Desktop and landscape tablets use two columns. Phones and portrait tablets use flexbox to center the complete copy/graphic group beneath the navbar, fluid spacing, equal-width stacked 44px buttons, and a shrinking graphic. The headline has a shared width-based clamp with 32px minimum (28px on short screens); description is at least 16px. Extremely short windows use natural content flow to avoid clipping controls. A three-number stats row starts immediately below the hero. Workflow animation remains scoped and honors reduced motion. Content is visible before animation begins, and reduced-motion users see stationary layouts.

## API and AI boundary

`POST /api/analyze` receives `{ image: base64String, mimeType }` and returns `{ schedule: { classes, warnings } }`. Each class has a subject, optional course code, and meetings with weekday, 24-hour start/end time, optional room, and optional explicit date/date range.

- Other methods return 405 with `Allow: POST`.
- Missing `GEMINI_API_KEY` returns 503 with `AI_NOT_CONFIGURED`.
- Display names instead of API model IDs return 503 with `INVALID_MODEL_CONFIG` before making a provider request.
- Invalid images return 400; oversized payloads return 413.
- No visible schedule returns 422.
- Provider quota errors return 429; provider timeout returns 504.
- Invalid provider output and rejected extraction requests return 502; inaccessible models return 503.
- Responses use `Cache-Control: no-store`.
- Images are sent inline to Gemini and are not written to storage or application logs.

The API validates base64, payload length, and image signatures, then requests structured JSON with Gemini's portable `responseSchema` format. Zod validates the returned data and enforces field/count limits. Uncertain values stay null for student review. Raw provider errors and credentials are not sent to the browser. No automatic fallback to a more expensive model is configured.

Vercel functions have a 4.5 MB body limit. The browser accepts source files up to 10 MiB, decodes at most 40 megapixels, resizes to a maximum 2400px edge, and compresses to JPEG at most 3 MiB. The server rejects decoded images over 3 MiB and oversized encoded payloads. Transparency is flattened onto white before compression.

`GEMINI_MODEL=gemini-3.1-flash-lite` is the verified configuration. Use this exact API ID, not the display name `Gemini 3.1 Flash Lite`. Quota is shared across the configured Google project. Free-tier processing has different data-use terms from the paid tier; the upload UI explains transmission to Google and asks students to crop out personal details they do not need to share.

Sources: [Vercel Vite support](https://vercel.com/docs/frameworks/frontend/vite), [Vercel local development](https://vercel.com/docs/cli/dev), [function limits](https://vercel.com/docs/functions/limitations), [Gemini model availability](https://ai.google.dev/gemini-api/docs/deprecations), [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [structured outputs](https://ai.google.dev/gemini-api/docs/structured-output), [GSAP React integration](https://www.npmjs.com/package/@gsap/react).

## Add wallpaper designs or collections

1. Add a preset to the appropriate `src/assets/` template module and include it in the combined `wallpaperTemplates` export.
2. Reuse the shared Canvas renderer, layout validation and appearance settings. Keep timetable text out of background artwork and mascot cutouts.
3. Add artwork under the existing `public/wallpapers/` directories and document exact prompts/provenance in `WALLPAPER_TEMPLATES.md`.
4. If adding a collection, update `src/config/collections.js` and assign matching collection IDs to its presets. Editor filters use this source; homepage collection rows in DesignShowcase.jsx carry matching IDs into the picker.
5. Update collection rows and their illustrative assets in `DesignShowcase.jsx` if the homepage changes, then check image loading and filtered gallery handoff. Keep generated prompts/provenance with the assets.

The compatible routes remain `/services/schedule-wallpaper` and `/services/schedule-wallpaper/:templateId`. `?collection=<id>` selects the initial gallery filter, `?step=preview` opens Download, and existing `return` parameters preserve editing destinations. There is no general service registry.

Vercel rewrites only `/services/*` to the app shell. `/api/*` is left to the functions, so API failures cannot be mistaken for successful HTML responses. Extend rewrites if future top-level app routes are introduced.

## Deployment preparation

Import the repository into Vercel using its Vite preset. Build with `npm run build`, output `dist`, and set `GEMINI_API_KEY` and `GEMINI_MODEL` in its server environment settings. The function is configured with a 60-second maximum duration, with a 45-second provider timeout and 60-second client timeout. Deployment and account linking have not been performed.

## Verification

Run `npm run lint`, `npm test`, and `npm run build`. Automated checks cover methods, configuration, upload validation, provider error mapping, structured data validation, all meeting occurrences, time validation, overlap detection, long text, and overflow behavior.

The current automated suite passes all 36 tests covering the API and wallpaper behavior, including all 62 templates, 20 real RGBA mascot assets, every meeting, neutral weekday examples, long names, a 15-meeting week, fixed footer art, and overflow rejection. A dedicated alignment check covers centered day badges and times with one or three meetings. Collection links were verified against 20 Little Friends, 20 Mascots, six Patterns and 16 Originals templates. All 36 tests pass, including eight visit-counter checks; lint and production build pass. The preceding layered hero/mobile refinement was checked across ten sizes from 320 × 568 to 1920 × 1080, including 375 × 667. No horizontal overflow was found; hero bottom and stats top matched the viewport boundary within 0.2px. Explore reached the designs heading at 83.8px below the viewport top. Those historical measurements are in `.impeccable/review/schedsnap/mobile-refinement-audit.json`; current fluid-hero geometry at 16 sizes is in `fluid-stacked-audit.json` in the same directory. The preceding visual review returned ship with no material fixes. Deployment and live visit-storage configuration remain pending. Historical editor capture: `documentation/previews/mascot-clean-actual.jpg`; mobile and gallery captures are also under `documentation/previews/`. The website also passed responsive checks at exact tablet widths; tablet-specific wallpaper output sizes and orientation selectors remain outside scope. See COMPLETION_AUDIT.md for current workflow and breakpoint evidence.

Historical MVP verification used `tests/fixtures/sample-registration.png`, which contains synthetic subjects without student data. The real Gemini request extracted three subjects and five meetings. Browser checks covered template-first navigation, image selection, extraction, live edits, template/size changes, and confirmation reset. A Midnight PNG was downloaded and inspected at 1080 × 1920 with the edited subject and all five meetings. The server key was confirmed absent from built browser JavaScript. No deployment was tested.

Historical dependency audit at setup (not rerun during the SchedSnap redesign): `npm audit --omit=dev` reported no vulnerabilities. The complete audit reported 33 advisories in the latest installed Vercel CLI development dependency tree (including one critical advisory); those were not resolved during that setup pass. No forced upgrades or transitive-version overrides were applied. Recheck the CLI dependency tree before using it for production deployment work.

## Dedicated mobile showcase artwork

One automatically cycling collection showcase replaces four scrolling rows on every screen size. Title, description, image, filtered creation URL and the progress line update together. The carousel advances every five seconds while at least a quarter of the section is visible. Hovering with a mouse, focusing a control, hiding the page, or scrolling the section out of view stops rotation. Reduced-motion preferences disable automatic cycling. The compact 80 × 2px progress line has four segments; the active segment fills over five seconds. Its animation and timer pause together and resume the remaining interval; choosing another collection resets both. The next collection image is preloaded. The live region is off during automatic cycling and polite during interaction. There is no visible play/pause control. Desktop places the image left and copy right, with subtle unboxed chevrons beside the progress line below the panel. Phones through 800px and portrait tablets through 1100px show the section heading, phone artwork with chevrons at its sides, the countdown line immediately beneath it, then the centered collection title, description and Create wallpaper action. The four-segment countdown line sits below the full panel on desktop and directly below the artwork on stacked layouts. Chevrons keep 44px touch targets without visible borders or backgrounds. This follows the reference layout while retaining SchedSnap colors, typography and buttons. Four generated portrait scenes vary single-phone and paired-phone compositions and are shared by desktop and mobile. Descriptions remain at least 16px, with an 8–12px title gap and a 16–20px action gap. Concise descriptions replace reserved two-line space, keeping all four tested states the same height. The original three-phone hero is unchanged. The latest layout was checked across all four collections at five requested sizes: 320 × 480, 375 × 667, 985 × 1086 portrait, 1024 × 768 landscape and 1440 × 900. No horizontal overflow was found. Selected sources and filtered links match each collection; the original three-phone hero remains selected. Chevron targets measure 44 × 44px, and slide height remains stable across all four states. Timed browser checks verified automatic advancing, focus pause, hover pause and offscreen pause. Reduced-motion and hidden-page gates were reviewed in source; those two conditions were not emulated in the browser. Current evidence is `.impeccable/review/schedsnap/autoplay-showcases-audit.json`. Lint and production build pass. Files and exact prompts are in [MOBILE_SHOWCASES.md](MOBILE_SHOWCASES.md). The earlier nine-size manual-carousel audit remains historical.
