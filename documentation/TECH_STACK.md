# UniToolbox technical setup

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
| Fonts | Locally bundled DM Sans Variable, DM Serif Display, and Great Vibes |
| Checks | ESLint, Node test runner, Vite build |

No database, authentication, or persistent upload storage is configured for this setup.

## Directory layout

```text
api/analyze.js                       Gemini extraction and error handling
development/apiPlugin.js            Local Vite adapter for the same API handler
shared/scheduleSchema.js             Validated class/meeting data contract
shared/uploadLimits.js               Shared source/payload size limits
src/assets/                         Sixty-two presets, neutral preview data, sample schedule
src/assets/mascotTemplates.js        Twenty animal edition definitions
src/assets/littleFriendsTemplates.js Twenty Chiikawa-inspired character editions
public/wallpapers/                  Original background art without schedule text
public/wallpapers/mascots/           Twenty transparent animal cutouts without baked text
public/wallpapers/little-friends/    Twenty transparent reference-inspired character cutouts
src/components/                     Navbar, Hero, ServiceCard, Footer
src/config/services.js              Service card registry
src/lib/api.js                      Axios client
src/lib/animation.js                 GSAP React registration
src/pages/Home.jsx                  Landing page
src/pages/ScheduleWallpaper/        Template selection, upload, editor, preview/download
src/utils/canvasHelpers.js          Layout, text wrapping, rendering, and export
src/utils/imageHelpers.js           Image decoding and compression
tests/analyze.test.js                API boundary checks
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

1. Browse the 62 designs. Clicking one opens a native dialog preview. **Use this design** opens Classes. When changing a design from Download, selection returns to that screen with the existing classes. Gallery previews show actual classes when available, otherwise sample classes.
2. Upload a JPG/PNG/WebP image and select **Import classes**, enter classes manually, or try a sample. Review editable class summaries and resolve marked missing or invalid details. **Continue to preview** opens Download once classes are valid. Desktop review shows the live wallpaper beside the form; phones focus on the class list. There is no separate confirmation checkbox. Extracted date ranges remain preserved.
3. **Download wallpaper** creates a 1080 × 2400 PNG. **Edit classes**, **Change design**, and the optional **Customize appearance** disclosure provide flexible editing. Mobile customization keeps a small live preview visible. Missing details, asset failures, and overflowing layouts explain why export is blocked and provide recovery actions.

Template selection uses the existing wildcard route. The `step=preview` query identifies the final screen; gallery `return` and `step` parameters retain the return destination. React state owns classes, the selected image, and per-design appearance settings across tool navigation and browser Back/Forward. Refresh clears them.

Manual entry and a five-class sample with one meeting each Monday–Friday are available in the upload step without calling Gemini. All edits are in React memory and are lost on refresh. The app does not save forms or schedule history.

Output is fixed to a mobile portrait PNG at 1080 × 2400. All templates share a Class Schedule title, separate growing day cards, and consistent time/subject columns in DM Sans Variable. Circular weekday initials stay centered within each card for any meeting count. Times include minutes and AM/PM, e.g. 7:00 AM–10:00 AM, and center vertically beside their meeting's subject/details block. Every meeting is preserved, long subjects wrap, and empty days are skipped. Body type adjusts from 42px down to 28px. Historical preset heading/row fields are unused; palettes and background artwork still vary. Overflow, unreadable days/times, and reverse ranges block export. Overlapping meetings appear as review notes.

Mascot templates use transparent animal cutouts over uniform Canvas background fills. Canvas supplies the title and edition labels; art contains no timetable or edition text. Occupied alpha bounds normalize to a fixed 620px maximum dimension, independent of schedule density, without modifying the PNG. The timetable ends by y1740 and animal art starts at y1780 or below. Gallery artwork loads near the viewport through IntersectionObserver, and images/fonts are cached before drawing. [Wallpaper documentation](WALLPAPER_TEMPLATES.md) links all 20 species and their exact generation prompts/provenance. Some cutouts contain subtle interior shading despite flat-color prompt constraints.

The interface uses white surfaces, slate text, and restrained borders. The three workflow steps are an ordered list within the page, below its heading; the main navigation contains only branding and Toolbox. Each step renders only its task, and the tool omits the marketing footer. Upload and extracted details share the same page width and alignment. Desktop meeting fields fit in a compact row, while mobile fields stack without extra panel wrappers. The final step dedicates the page to the wallpaper, with download beside it on desktop and below it on mobile. Modal previews use native dialog focus trapping, Escape dismissal, and scroll locking.

## GSAP conventions

Import `gsap` and `useGSAP` from `src/lib/animation.js`. Scope selectors to a component ref, and use the React hook for cleanup when a component unmounts. Use `gsap.matchMedia()` to honor `prefers-reduced-motion`, and revert its context during cleanup.

The hero has one small entrance movement and workflow steps have a brief positional transition. Content is visible before animation begins, and reduced-motion users see stationary layouts.

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

`GEMINI_MODEL=gemini-3.1-flash-lite` is the verified configuration. Use this exact API ID, not the display name `Gemini 3.1 Flash Lite`. `gemini-3.5-flash-lite` is another compatible candidate to evaluate against account access. Quota is shared across the configured Google project. Free-tier processing has different data-use terms from the paid tier; the upload UI explains transmission to Google and asks students to crop out personal details they do not need to share.

Sources: [Vercel Vite support](https://vercel.com/docs/frameworks/frontend/vite), [Vercel local development](https://vercel.com/docs/cli/dev), [function limits](https://vercel.com/docs/functions/limitations), [Gemini model availability](https://ai.google.dev/gemini-api/docs/deprecations), [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [structured outputs](https://ai.google.dev/gemini-api/docs/structured-output), [GSAP React integration](https://www.npmjs.com/package/@gsap/react).

## Add another service

1. Create its page/components under `src/pages/`.
2. Add its route in `src/App.jsx`, preferably as a lazy import for larger tools.
3. Add a service entry to `src/config/services.js` and, if needed, an icon mapping in `ServiceCard.jsx`.
4. Use a `/services/...` route so the existing Vercel SPA rewrite handles direct visits and refreshes.
5. Add a root `api/` function only if the tool needs server work.

Vercel rewrites only `/services/*` to the app shell. `/api/*` is left to the functions, so API failures cannot be mistaken for successful HTML responses. Extend rewrites if future top-level app routes are introduced.

## Deployment preparation

Import the repository into Vercel using its Vite preset. Build with `npm run build`, output `dist`, and set `GEMINI_API_KEY` and `GEMINI_MODEL` in its server environment settings. The function is configured with a 60-second maximum duration, with a 45-second provider timeout and 60-second client timeout. Deployment and account linking have not been performed.

## Verification

Run `npm run lint`, `npm test`, and `npm run build`. Automated checks cover methods, configuration, upload validation, provider error mapping, structured data validation, all meeting occurrences, time validation, overlap detection, long text, and overflow behavior.

The full automated suite has 24 passing tests covering the API and wallpaper behavior, including all 62 templates, 20 real RGBA mascot assets, every meeting, neutral weekday examples, long names, a 15-meeting week, fixed footer art, and overflow rejection. A dedicated alignment check covers centered day badges and times with one or three meetings. Lint and production build pass. The actual-data browser capture is `documentation/previews/mascot-clean-actual.jpg`; mobile and gallery captures are also under `documentation/previews/`. Tablet and orientation handling remain outside scope.

MVP verification used `tests/fixtures/sample-registration.png`, which contains synthetic subjects without student data. The real Gemini request extracted three subjects and five meetings. Browser checks covered template-first navigation, image selection, extraction, live edits, template/size changes, and confirmation reset. A Midnight PNG was downloaded and inspected at 1080 × 1920 with the edited subject and all five meetings. The server key was confirmed absent from built browser JavaScript. No deployment was tested.

Dependency audit at setup: `npm audit --omit=dev` reported no vulnerabilities. The complete audit reported 33 advisories in the latest installed Vercel CLI development dependency tree (including one critical advisory); those remain unresolved upstream/in tooling. No forced upgrades or transitive-version overrides were applied. Recheck the CLI dependency tree before using it for production deployment work.
