# Genshin official-namecard wallpaper adaptations

Six designs, each independently generated for mobile (1080 × 2400), tablet portrait (1600 × 2560), and laptop (1920 × 1080): 18 opaque PNG assets.

| Character | Elemental detail | Asset folder |
| --- | --- | --- |
| Hu Tao | Small Pyro mark | `genshin-card-hutao-spirit` |
| Navia | Small Geo mark | `genshin-card-navia-rosula` |
| Varesa | Small Electro mark | `genshin-card-varesa-powerhouse` |
| Citlali | Small Cryo mark | `genshin-card-citlali-opalstar` |
| Skirk | Small Cryo mark | `genshin-card-skirk-lone-shadow` |
| Zhongli | Small Geo mark | `genshin-card-zhongli-planet` |

The user's final direction was to preserve the official namecards closely. Original palettes and recognizable namecard graphic motifs are retained; the main changes are extending and recomposing them for the three screen formats and adding a small elemental emblem. Existing official ghost, mask, stitched mascot, and flowing silhouette graphics remain part of the source namecard identity; no new full-body or chibi character was added. The generated interpretations are adaptations rather than pixel-identical copies.

Official in-game namecard assets were downloaded from Enka's exported game-asset mirror. Source URLs and downloaded reference paths are in `references/sources.json`. Exact final prompts, selected native generated file paths, and export destinations are in `prompts-and-sources.json`. `briefs.json` also records the discarded first Hu Tao/Navia drafts; those drafts were not exported into the collection.

All final PNGs are under `public/wallpapers/scenic/<asset-folder>/{mobile,tablet,laptop}.png`. Built-in imagegen generated every device composition separately. The existing packaging script normalized native output pixel dimensions to the specified sizes without cropping. The original generated files remain in the Codex generated-images folder.

The six templates extend the existing Genshin gallery collection with standard schedule position and sizing. Class Schedule remains editable and visible. Artwork may be covered by schedule cards, as requested. Sample and dense Canvas renders, dimension/opacity/hash reports, and device contact sheets are under `output/genshin-namecards-2/`.

Sub-agent generation could not run: this chat's agent thread limit was reached and the prior agents were closed. The coordinating agent completed all generation and export work instead.

The templates are integrated locally. Shared catalog publication, frontend deployment, commits, and pushes are separate and have not been performed for this batch.

## Validation and delivery

- 18 unique opaque PNGs passed exact dimension and SHA256 checks.
- 36 native Canvas previews cover sample and dense schedules; all sample schedules fit. The native QA backend rounds non-hundred CSS font weights for its project font support.
- All 18 Cloudinary URLs returned PNG images with Canvas CORS enabled; 564 committed delivery records were preserved. The detailed scoped audit is `output/genshin-namecards-2/cloudinary-verification.json`.
- Focused Genshin tests and lint passed. The full workspace test run passed 178 tests with one pre-existing dense landscape-tablet layout failure in `tests/wallpaper.test.js`.
- The download bundle is `output/genshin-namecards-2/genshin-namecards-18.zip`; review sheets are `{mobile,tablet,laptop}-preview.jpg` beside it.

Production build passed. No hosted catalog changes or Git pushes were made for this batch.

Appearance update: namecard schedule panels default to glass with lighter tint opacity. Navia and Varesa use white Class Schedule headings while class text retains the original dark ink.
