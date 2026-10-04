# SchedSnap project plan

Status: dedicated product, generated hero/logo/collection assets and wallpaper workflow implemented locally. Implementation and automated/responsive checks are complete; the final visual review returned ship with no material fixes. Deployment and optional visit-storage configuration remain pending.

## Product and audience

SchedSnap helps university students turn their class schedule into a readable phone wallpaper. The product focuses on choosing a personal look, checking classes and saving the result. The earlier UniToolbox general-services plan is historical; additional services and a service registry are no longer the product direction.

## Implemented scope

- A concise homepage with a static viewport-height hero, independent generated cream background and transparent phone foreground, generated navy abstract S logo, three statistics, one automatically cycling four-collection showcase and a simple footer without section separator lines. Collection actions open the filtered design picker.
- A complete collection of 62 portrait designs: 20 Little Friends, 20 animal mascots, six editable patterns and 16 originals.
- Design → Classes → Download flow, with no separate step indicator.
- Registration-form image extraction through a server API, manual entry, sample data and editable validation.
- Shared Canvas previews and 1080 × 2400 PNG export, optional appearance customization and overflow protection.
- Responsive editor, native preview dialogs and browser-session state across design changes and Back/Forward navigation.

## Routes and compatibility

`/` is the SchedSnap homepage. `/services/schedule-wallpaper` remains the full gallery for compatibility. `/services/schedule-wallpaper/:templateId` opens class entry with that design. `?collection=<id>` carries a homepage category into the gallery, and `?step=preview` identifies Download for a chosen design. Existing return parameters preserve the destination when changing designs.

## Data and rendering commitments

Forms may contain personal details; the upload flow asks students to crop unnecessary information. Images go to Google for analysis and are not stored by the application. The API key remains server-side. Classes, images and settings stay in page memory; refreshing clears them and unsaved changes receive native browser confirmation.

Wallpapers preserve all meetings and omit empty days. Course codes lead smaller centered subjects, rooms use a separate column, and long names fit on one line with bounded shrinking and an ellipsis. Body type stays within 28–42px. Mascot art has a fixed 620px maximum occupied dimension in a reserved footer. Invalid times and schedules that cannot fit block export. See [PRODUCT.md](../PRODUCT.md), [DESIGN.md](../DESIGN.md) and [wallpaper provenance](WALLPAPER_TEMPLATES.md).

## Completion criteria and evidence

Students can understand the outcome from the homepage, open the full gallery or a collection, enter or extract classes, correct unclear details, customize the result and download a readable PNG. Error and overflow states provide recovery paths.

All 36 tests pass, including eight visit-counter checks; lint and production build pass. The preceding layered hero/mobile refinement was checked across ten sizes from 320 × 568 to 1920 × 1080, including 375 × 667. No horizontal overflow was found; hero bottom and stats top matched the viewport boundary within 0.2px. Explore reached the designs heading at 83.8px below the viewport top. Those historical measurements are in `.impeccable/review/schedsnap/mobile-refinement-audit.json`; current fluid-hero geometry at 16 sizes is in `fluid-stacked-audit.json` in the same directory. The preceding visual review returned ship with no material fixes. Deployment and live visit-storage configuration remain pending. Earlier synthetic-form extraction checks remain historical in [TECH_STACK.md](TECH_STACK.md). Automated design detection is unavailable; no detector pass is claimed.

See [the completion audit](COMPLETION_AUDIT.md) for exact 320–1440px responsive checks and the current sample-to-PNG workflow.

## Deferred milestone

Deploy to the configured hosting environment and verify its server-side API configuration. Connect the optional aggregate visit counter with server-only Redis REST credentials; until then Total visits shows an unavailable value. Account creation, saved history, other tools, payments, device/orientation selectors and a custom artwork editor are outside current scope. Further expansion should add wallpaper designs or collections through the existing renderer and gallery.

## Fluid hero refinement

Hero actions now always stack with equal widths on screens through 800px and portrait tablets through 1100px. Landscape tablets retain columns; the 718 × 699 view now stacks instead of squeezing unequal buttons into a narrow copy column. A shared fluid scale keeps the heading at least 32px (28px on short screens) and the description at least 16px. Dynamic viewport sizing, balanced clearance, a shrinking graphic and a 1.18 scale compensate for the phone asset’s transparent margins. Geometry was checked at 16 sizes, including the 800/801px transition: no horizontal overflow, both actions visible, and statistics at the hero boundary. Current evidence: `.impeccable/review/schedsnap/fluid-stacked-audit.json`. Prior visual-review results above refer to the preceding implementation.

## Dedicated mobile showcase artwork

One automatically cycling collection showcase replaces four scrolling rows on every screen size. Title, description, image, filtered creation URL and the progress line update together. The carousel advances every five seconds while at least a quarter of the section is visible. Hovering with a mouse, focusing a control, hiding the page, or scrolling the section out of view stops rotation. Reduced-motion preferences disable automatic cycling. The compact 80 × 2px progress line has four segments; the active segment fills over five seconds. Its animation and timer pause together and resume the remaining interval; choosing another collection resets both. The next collection image is preloaded. The live region is off during automatic cycling and polite during interaction. There is no visible play/pause control. Desktop places the image left and copy right, with subtle unboxed chevrons beside the progress line below the panel. Phones through 800px and portrait tablets through 1100px show the section heading, phone artwork with chevrons at its sides, the countdown line immediately beneath it, then the centered collection title, description and Create wallpaper action. The four-segment countdown line sits below the full panel on desktop and directly below the artwork on stacked layouts. Chevrons keep 44px touch targets without visible borders or backgrounds. This follows the reference layout while retaining SchedSnap colors, typography and buttons. Four generated portrait scenes vary single-phone and paired-phone compositions and are shared by desktop and mobile. Descriptions remain at least 16px, with an 8–12px title gap and a 16–20px action gap. Concise descriptions replace reserved two-line space, keeping all four tested states the same height. The original three-phone hero is unchanged. The latest layout was checked across all four collections at five requested sizes: 320 × 480, 375 × 667, 985 × 1086 portrait, 1024 × 768 landscape and 1440 × 900. No horizontal overflow was found. Selected sources and filtered links match each collection; the original three-phone hero remains selected. Chevron targets measure 44 × 44px, and slide height remains stable across all four states. Timed browser checks verified automatic advancing, focus pause, hover pause and offscreen pause. Reduced-motion and hidden-page gates were reviewed in source; those two conditions were not emulated in the browser. Current evidence is `.impeccable/review/schedsnap/autoplay-showcases-audit.json`. Lint and production build pass. Files and exact prompts are in [MOBILE_SHOWCASES.md](MOBILE_SHOWCASES.md). The earlier nine-size manual-carousel audit remains historical.
