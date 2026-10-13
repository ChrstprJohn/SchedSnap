# Onepiece adventure collection

Twelve designs based on the four supplied references, with three variants per reference and three independently composed device backgrounds per variant.

| Device | PNG dimensions |
| --- | --- |
| Mobile | 1080 × 2400 |
| Tablet | 1600 × 2560 |
| Laptop | 1920 × 1080 |

Sources live in `public/wallpapers/scenic/onepiece-<design>/{mobile,tablet,laptop}.png`. The `scenic` folder is the established full-background asset namespace; the gallery collection ID is `onepiece`.

All art uses the built-in image generation tool. The exact generation prompts, supplied reference paths, original output paths, sizing operations, and per-device provenance are recorded in `onepiece-adventure-reference-1.json` through `onepiece-adventure-reference-4.json`. Original generation outputs remain available at their recorded paths. Final files are opaque, full bleed, without schedule text, interface controls, reference screenshot buttons, or rounded screenshot borders. The Canvas renderer adds actual classes separately.

Definitions are in `src/assets/onepieceAdventureTemplates.js`, combined by `src/assets/templates.js`. Collection routing is shared by the gallery and Admin, and `shared/templateSchema.js` accepts the new collection. Existing application typography, color tokens, and controls are inherited unchanged.

This adventure set is separate from the concurrent cute-character set in `src/assets/onepieceTemplates.js` and its `onepiece-reference-*.json` provenance. Both use the shared Onepiece collection filter; the counts in this document describe only the twelve adventure designs.

For a release, run the existing asset uploader dry run, upload pending artwork, and verify zero pending. `scripts/publish-onepiece-adventure.mjs --dry-run` reads the latest catalog and reports additions; without the flag it adds only missing adventure IDs, preserves existing records and publication dates, validates every design, and rereads the catalog to verify publication. Deploying the frontend is a separate step.

`tests/onepieceAdventure.test.js` checks the twelve unique designs, thirty-six device paths, exact PNG and uploaded dimensions, schema acceptance, and three variants per supplied reference. `output/verify-onepiece-adventure.mjs` renders all device variants with sample schedules, checks denser schedules and export blocking for overcrowding, and captures desktop/mobile collection views under `documentation/previews/onepiece-adventure/`.

## Release evidence

All thirty-six independent backgrounds were uploaded, and the catalog publication added the twelve adventure designs while preserving existing records and their first-publication dates. Republishing does not restart the seven-day New badge window.

The production deployment `dpl_DFWiBgg1NB9QpQgYPCNZxmmWh3C5` reached Ready at [schedsnap.chrbuilds.dev](https://schedsnap.chrbuilds.dev). The test suite passed all 134 tests, and `npm run build` passed. Actual Canvas checks passed for all thirty-six backgrounds with both sample and dense schedules, including export blocking when a schedule cannot fit.

Completed production verification fetched and checked all thirty-six Cloudinary PNG bodies at the required device dimensions, found each of the twelve adventure IDs exactly once in the catalog, and opened all thirty-six website previews across mobile, tablet, and laptop with loaded artwork and New badges. Results are recorded in `documentation/ONEPIECE_ADVENTURE_LIVE_VALIDATION.json`; gallery screenshots are `documentation/previews/onepiece-adventure/live-gallery-{mobile,tablet,laptop}.png`.

Device contact sheets are saved under `documentation/previews/onepiece-adventure/` as `mobile-contact-sheet.jpg`, `tablet-contact-sheet.jpg`, and `laptop-contact-sheet.jpg`. These show artwork rendered with schedule overlays rather than generation-only mockups. Per-reference prompts and provenance remain in the four adventure JSON files named above.

This release extends the wallpaper artifacts within the incumbent white/slate application. It introduces no application typography, color, spacing, or control tokens, so `DESIGN.md` needs no changes for this collection extension.
