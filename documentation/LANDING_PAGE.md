# Landing page design

The `/` page introduces UniToolbox and directs students to the available tool. It retains white surfaces, slate text, DM Sans, and concise copy.

## Hero and header

The hero fills the initial viewport with `min-height: 100svh`. A generated study-desk photograph spans the entire hero, with responsive white overlays for readable text. On desktop, copy is left aligned and vertically centered. At 640px and below, the heading, description, and action are centered horizontally and vertically as one group. Content may grow on short screens or with enlarged text without clipping.

The header contains only the UniToolbox brand link. It has no navigation links, background, or divider. On the home page it overlays the photograph; tool pages retain a normal-flow brand header. The photograph is decorative and hidden from assistive technology. Hero entrance motion respects reduced-motion preferences.

Image provenance and the exact built-in generation prompt are recorded in `documentation/HERO_BACKGROUND.md`; the final asset is `public/art/hero-study-desk.png`. The earlier geometric pattern remains available as an unused brand asset.

## Statistics and services

A plain white banner sits below the initial viewport. Three evenly distributed metrics use large regular-weight numbers over smaller labels, matching the supplied reference. Mobile uses three centered equal-width columns. Values display a `+` suffix: sample total visits of 1,284+, one available tool, and 36 wallpaper styles from the catalogs. Visits remain visibly marked Sample; there is no visitor tracking or analytics backend. `StatsBanner` accepts `visits` and `sample` props for a future source.

The service is a single linked preview-and-copy row, stacked on mobile. Three canvases render neutral examples in Bear Mode, Window Light, and Daily Panda. Previews reuse the existing tool renderer through a lazy import. The description is factual, the action says Open tool, and the preview caption identifies sample wallpapers.

## Sources and verification

Hero, header, metrics and service components live under `src/components/`; `src/pages/Home.jsx` composes them and imports `src/landing.css`. Existing product and global design files remain unchanged. The stylesheet is isolated from tool styles so commits can remain scoped to this work.

Desktop and mobile captures are saved in `.impeccable/review/`. Browser checks confirm readable wrapping, no horizontal overflow, working service navigation, and the stats banner below the initial screen. Lint and production build pass. Automated design detection remains unavailable because its engine is not installed; no detector pass is claimed. Visit figures are sample-only.
