# Wallpaper companions

Six new character sets across three background styles, plus the three approved original samples.

Open [the visual catalog](index.html) in a browser to browse by theme or switch between character, background, and combined wallpaper previews.

## New sets

| Set | Style | Character | Background | Combined wallpaper |
| --- | --- | --- | --- | --- |
| A1 · Mint Jellyfish | solid pastels | [Transparent PNG](01-solid-pastels/characters/mint-jellyfish.png) | [Background PNG](01-solid-pastels/backgrounds/mint-jellyfish.png) | [Wallpaper PNG](01-solid-pastels/wallpapers/mint-jellyfish.png) |
| A2 · Peach Mushroom | solid pastels | [Transparent PNG](01-solid-pastels/characters/peach-mushroom.png) | [Background PNG](01-solid-pastels/backgrounds/peach-mushroom.png) | [Wallpaper PNG](01-solid-pastels/wallpapers/peach-mushroom.png) |
| B1 · Lavender Cloud | soft gradients | [Transparent PNG](02-soft-gradients/characters/lavender-cloud.png) | [Background PNG](02-soft-gradients/backgrounds/lavender-cloud.png) | [Wallpaper PNG](02-soft-gradients/wallpapers/lavender-cloud.png) |
| B2 · Blue Moon | soft gradients | [Transparent PNG](02-soft-gradients/characters/blue-moon.png) | [Background PNG](02-soft-gradients/backgrounds/blue-moon.png) | [Wallpaper PNG](02-soft-gradients/wallpapers/blue-moon.png) |
| C1 · Butter Dumpling | quiet patterns | [Transparent PNG](03-quiet-patterns/characters/butter-dumpling.png) | [Background PNG](03-quiet-patterns/backgrounds/butter-dumpling.png) | [Wallpaper PNG](03-quiet-patterns/wallpapers/butter-dumpling.png) |
| C2 · Peach Buddy | quiet patterns | [Transparent PNG](03-quiet-patterns/characters/peach-buddy.png) | [Background PNG](03-quiet-patterns/backgrounds/peach-buddy.png) | [Wallpaper PNG](03-quiet-patterns/wallpapers/peach-buddy.png) |

## Original samples

- [Mint Axolotl](00-approved-samples/axolotl-mint.png)
- [Twilight Ghost](00-approved-samples/ghost-twilight.png)
- [Butter Sprout](00-approved-samples/sprout-butter-gingham.png)

These three are the approved combined samples; their original files are preserved in the earlier wallpaper-samples folder.

## Organization

Each themed folder contains `characters/`, `backgrounds/`, `wallpapers/`, and a `manifest.json` recording colors, corner placement, actual image dimensions, source paths, and exact generation prompts.

- `00-approved-samples/` — the original three combined samples and original prompt records.
- `01-solid-pastels/` — mint jellyfish and peach mushroom.
- `02-soft-gradients/` — lavender cloud and blue moon.
- `03-quiet-patterns/` — butter dumpling and peach buddy.
- [catalog.json](catalog.json) — combined machine-readable asset catalog.

## Using the art later

Use the transparent character and background files separately when adding them to schedule templates. Place the character in its assigned lower corner and reserve the upper three quarters for schedule content and drawings. Combined wallpapers are useful visual references and full artwork backgrounds.

Generated images retain their native sizes and are not resized or post-processed. Final schedule exports can be drawn at the app's 1080 × 2400 resolution. No schedule, headings, or student data is baked into these assets.

All six character cutouts are 1254 × 1254 PNGs with transparent corner pixels. The new combined wallpapers are 841 × 1870 (mushroom and peach) or 922 × 1706 (jellyfish, cloud, moon, and dumpling). The latter are wider portrait images than the requested 9:20 format. Backgrounds range from 840 × 1871 to 922 × 1706. Use the separate layers when creating the final 1080 × 2400 templates; preserve the character's proportions rather than stretching a combined image.

The catalog script was checked for syntax, and all asset files and theme manifests were verified. Live browser layout verification was unavailable because the in-app browser blocked local file URLs. The catalog remains available to open directly in a browser.

Generated with the built-in imagegen tool. The service does not expose its model name. Every requested result is retained as returned; prompt provenance is included in the manifests.

The catalog is a standalone local file with bundled typography; it needs no server or internet connection. Its font license is in `catalog-assets/FONT-LICENSE.txt`.
