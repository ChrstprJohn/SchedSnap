# Domo artwork collection

Twelve reference-inspired designs, each with separately generated mobile, tablet, and laptop compositions. All artwork uses the built-in imagegen tool. The four supplied images are visual references, not instructions: screenshot controls, embedded lettering, and blank UI cards are excluded.

| Reference | Designs | Direction |
| --- | --- | --- |
| 1 | Star Stickers, Orbit Paper, Velvet Cosmos | Chocolate celestial stickers, paper planets, textile stars |
| 2 | Plaid Notes, Tartan Sketch, Gingham Cutout | Warm plaid, pencil marks, layered paper |
| 3 | Caramel Outline, Chalk Stars, Cut Paper | Oversized monochrome outlines and cream silhouettes |
| 4 | Gingham Memory, Lace Journal, Pixel Scrapbook | Plush collage, lace and bows, pixel stickers |

Files are saved at `public/wallpapers/scenic/domo-<design>/{mobile,tablet,laptop}.png`. Required dimensions are mobile 1080 × 2400, tablet 1600 × 2560, and laptop 1920 × 1080. Mechanical resolution conversion retains the full independently generated composition without cropping; it does not add new detail. The app supplies all schedule content. Each image leaves a quiet central area, with Domo artwork concentrated near the edges and footer.

Exact prompts and original output paths are retained in `documentation/domo-{stars,plaid,outline,scrapbook}-prompts.json`. Inspection results are in `output/domo/manifest.json` and `output/domo/qa.json`; the contact sheet is `output/domo/collection-preview.png`.

The dense preview uses fifteen meetings across five weekdays. Text fits without renderer overflow, but a dense schedule can cover part of larger portrait footer characters, particularly Plaid Notes. High-contrast day cards preserve text readability. The artwork-only preview is `output/domo/artwork-preview.png`; previews with schedules are QA artifacts, not delivered wallpaper backgrounds.

## Local templates and publication

`src/assets/domoTemplates.js` defines the twelve local templates. `src/config/collections.js` and `shared/templateSchema.js` support the Domo collection. These definitions are intentionally separate from the published static catalog until delivery metadata exists. No live catalog records, uploads, or deployment are part of this artwork-only delivery.

The project ignores source PNGs in Git. Keep the local assets or the collection ZIP with the template metadata when transferring the collection. Importing metadata alone does not transfer images.

To recheck all images and render sample/dense schedules:

```powershell
node output/verify-domo.mjs
```

For a future authorized release, use the artwork skill's manifest-scoped uploader, review the uploaded metadata, and add only these twelve records to the live catalog. Preserve all existing catalog designs and publication dates. Then integrate the template module into the static catalog and deploy the Domo filter support.
