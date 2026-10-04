# UniToolbox

A growing collection of useful tools and services for university students.

The website will introduce UniToolbox with a hero section and a services section. Each service card will open its own dedicated page, so more tools can be added over time.

The first service is a **Class Schedule Wallpaper Generator**: choose a mobile wallpaper template, upload and review your classes in step 2, then preview and download the wallpaper in step 3.

## Project documentation

- [Initial project plan](documentation/PROJECT_PLAN.md)

## Development

Requires Node.js 22.12+ (Node.js 24 LTS recommended) and npm.

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add your Gemini key. An existing `.env` also works. `npm run dev` starts the frontend and a local API adapter, so image analysis works without a Vercel account. To test the Vercel runtime instead, use `npm run dev:full`; its CLI may ask you to sign in and link a project on first use.

```sh
npm run lint
npm test
npm run build
```

## Stack and current scope

React + Vite, Tailwind CSS, React Router, Lucide, Axios, GSAP with `@gsap/react`, Zod, and the Google Gen AI SDK. Vercel hosts the frontend and Node.js functions. HTML5 Canvas renders wallpaper previews and PNG exports.

The collection includes 62 mobile wallpaper templates: 20 Chiikawa-inspired Little Friends editions, 20 animal mascot editions, six editable patterns, and the 16 original editorial, frosted-glass, daylight, notebook, and checkerboard styles. The mascot editions range from bold navy, forest, and rust to soft blush, lilac, cream, and neutral everyday palettes. Click a template for an enlarged preview, select it, then upload and review your classes before downloading. Output is a 1080 × 2400 PNG; there are no device, size, or orientation filters. The workflow steps live within the page, separate from the main navigation. Missing or invalid times and layouts that cannot fit all classes block export. See [the template collection and artwork prompts](documentation/WALLPAPER_TEMPLATES.md).

Mascot artwork is a transparent animal cutout. Canvas paints its uniform background, heading, edition label, and actual timetable separately. All templates share a Class Schedule title, separate day cards, centered circular weekday initials, and aligned times formatted like 7:00 AM–10:00 AM. Cards expand for multiple meetings and wrapped subjects; empty days are skipped. Schedule type fits within 28–42px, mascots keep a fixed 620px maximum occupied dimension in a reserved footer, and overflowing schedules block download. Gallery examples show one neutral meeting per weekday; assets load near the viewport.

The guided flow is **Design → Classes → Download**. Choose a design, upload or enter classes, review the details, then continue to the wallpaper. Desktop class review includes a live preview; phones focus on class entry. The download screen offers optional appearance controls for wallpaper colors, fonts, day-container fill, borders, and shape. Phones keep a small live preview visible while customizing. Going back or changing designs preserves classes and each design’s appearance settings until refresh. Invalid details and overflowing layouts show a visible explanation and recovery action.

Patterns & prints adds six designs with editable background and pattern colors: checks, dots, stripes, diamonds, waves and notebook lines. Image-backed originals keep their background artwork fixed. Appearance controls live in the optional Customize appearance disclosure on the download screen.

You can try sample data or enter classes manually without making an AI request. Form images and schedule edits stay in the current browser session; the app has no database or saved history. Uploaded images are sent to Google for analysis and are not stored by the application.

- [Technical setup and extension guide](documentation/TECH_STACK.md)
- [.env.example](.env.example) — server environment variables; copy to `.env.local` for local work.

The API key stays server-side. Use the API model ID `gemini-3.1-flash-lite`, which was verified with a synthetic registration form. A display name such as `Gemini 3.1 Flash Lite` is not a valid API model ID.
