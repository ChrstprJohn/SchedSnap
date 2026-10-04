# Tablet wallpaper companions

The six approved characters adapted for standard tablet proportions: **3:4 portrait** and **4:3 landscape**. Background-only images keep space clear for schedules and later drawings. Transparent character files are reused from the approved collection.

Open [index.html](index.html) in a browser to browse by theme, orientation, and asset type.

## Portrait sets

| Set | Combined wallpaper | Clean background |
| --- | --- | --- |
| A1 · Mint Jellyfish | [Portrait PNG](01-solid-pastels/portrait/wallpapers/mint-jellyfish.png) | [Background PNG](01-solid-pastels/portrait/backgrounds/mint-jellyfish.png) |
| A2 · Peach Mushroom | [Portrait PNG](01-solid-pastels/portrait/wallpapers/peach-mushroom.png) | [Background PNG](01-solid-pastels/portrait/backgrounds/peach-mushroom.png) |
| B1 · Lavender Cloud | [Portrait PNG](02-soft-gradients/portrait/wallpapers/lavender-cloud.png) | [Background PNG](02-soft-gradients/portrait/backgrounds/lavender-cloud.png) |
| B2 · Blue Moon | [Portrait PNG](02-soft-gradients/portrait/wallpapers/blue-moon.png) | [Background PNG](02-soft-gradients/portrait/backgrounds/blue-moon.png) |
| C1 · Butter Dumpling | [Portrait PNG](03-quiet-patterns/portrait/wallpapers/butter-dumpling.png) | [Background PNG](03-quiet-patterns/portrait/backgrounds/butter-dumpling.png) |
| C2 · Peach Buddy | [Portrait PNG](03-quiet-patterns/portrait/wallpapers/peach-buddy.png) | [Background PNG](03-quiet-patterns/portrait/backgrounds/peach-buddy.png) |

## Landscape sets

| Set | Combined wallpaper | Clean background |
| --- | --- | --- |
| A1 · Mint Jellyfish | [Landscape PNG](01-solid-pastels/landscape/wallpapers/mint-jellyfish.png) | [Background PNG](01-solid-pastels/landscape/backgrounds/mint-jellyfish.png) |
| A2 · Peach Mushroom | [Landscape PNG](01-solid-pastels/landscape/wallpapers/peach-mushroom.png) | [Background PNG](01-solid-pastels/landscape/backgrounds/peach-mushroom.png) |
| B1 · Lavender Cloud | [Landscape PNG](02-soft-gradients/landscape/wallpapers/lavender-cloud.png) | [Background PNG](02-soft-gradients/landscape/backgrounds/lavender-cloud.png) |
| B2 · Blue Moon | [Landscape PNG](02-soft-gradients/landscape/wallpapers/blue-moon.png) | [Background PNG](02-soft-gradients/landscape/backgrounds/blue-moon.png) |
| C1 · Butter Dumpling | [Landscape PNG](03-quiet-patterns/landscape/wallpapers/butter-dumpling.png) | [Background PNG](03-quiet-patterns/landscape/backgrounds/butter-dumpling.png) |
| C2 · Peach Buddy | [Landscape PNG](03-quiet-patterns/landscape/wallpapers/peach-buddy.png) | [Background PNG](03-quiet-patterns/landscape/backgrounds/peach-buddy.png) |

## Shared transparent characters

- [A1 · Mint Jellyfish](01-solid-pastels/characters/mint-jellyfish.png)
- [A2 · Peach Mushroom](01-solid-pastels/characters/peach-mushroom.png)
- [B1 · Lavender Cloud](02-soft-gradients/characters/lavender-cloud.png)
- [B2 · Blue Moon](02-soft-gradients/characters/blue-moon.png)
- [C1 · Butter Dumpling](03-quiet-patterns/characters/butter-dumpling.png)
- [C2 · Peach Buddy](03-quiet-patterns/characters/peach-buddy.png)

## Organization

Each theme contains shared `characters/`, separate `portrait/backgrounds/` and `portrait/wallpapers/`, separate `landscape/backgrounds/` and `landscape/wallpapers/`, and a manifest with exact prompts, colors, corner placement, actual dimensions, and source files.

- `01-solid-pastels/` — mint jellyfish and peach mushroom.
- `02-soft-gradients/` — lavender cloud and blue moon.
- `03-quiet-patterns/` — butter dumpling and peach buddy.
- [catalog.json](catalog.json) — complete file inventory, native dimensions and ratio checks.

## Using the artwork

The tablet compositions preserve the character identities and place them near their assigned lower corners, with broad clear upper and central areas. All timetable text, cards and drawings can be added later. Separate backgrounds and transparent characters let the final renderer position the artwork at the tablet's actual screen size.

Portrait generation requested a 3:4 canvas (approximately 1536 × 2048); landscape generation requested a 4:3 canvas (approximately 2048 × 1536). The built-in service selects the returned native pixel dimensions. Those dimensions and the actual aspect ratios are recorded in the catalog. All generated originals are preserved without cropping, stretching or resampling.

Every generated portrait file is **1086 × 1448, exactly 3:4**. Every generated landscape file is **1448 × 1086, exactly 4:3**. All 24 canvas ratios were verified from the saved PNGs.

Generated character sizes vary slightly between compositions. The combined wallpapers are ready art backgrounds; use the blank background and transparent character separately when you need an exact reserved footer area for schedule content.

This pack contains 24 newly generated images (12 combined wallpapers and 12 clean backgrounds), plus six existing 1254 × 1254 transparent character PNGs. Built-in imagegen was used; the model name is not exposed. Exact prompts are saved in each theme's manifest.

The catalog uses local files and bundled DM Sans typography, so it needs no server or internet connection. Browser visual verification is unavailable because the in-app browser blocks local file URLs. Catalog source, syntax and links are checked instead.

The original phone collection remains separately available in the project. No app templates or export controls were changed.
