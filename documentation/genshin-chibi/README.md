# Genshin chibi background collection

Five reference-inspired designs, each generated separately for mobile, portrait tablet and laptop. Built-in imagegen was used. Character drawing and background texture are raster artwork; no schedule, logo, badge or UI is baked in.

| Design | Reference |
| --- | --- |
| Kaeya — Atlas Doodles | 1 |
| Traveler — Tidal Sketches | 2 |
| Travelers — Celestial Promise | 3 |
| Paimon — Starlight | 4 |
| Teyvat — Sketch Parade | 5 |

Final device dimensions: mobile 1080 × 2400; tablet 1600 × 2560; laptop 1920 × 1080. Source files may require a small proportion-preserving crop and resize to meet the exact specification; this does not add detail beyond the generated source.

Assets: `public/wallpapers/scenic/<design-id>/{mobile,tablet,laptop}.png`. Templates: `src/assets/genshinChibiTemplates.js`, included by `src/assets/templates.js` in the existing Genshin collection.

The per-design provenance files record exact prompts, generated source paths and size normalization. These local assets have not been uploaded to Cloudinary or published to the live catalog.

Preview and ZIP: `output/genshin-chibi/collection-preview.jpg` and `output/genshin-chibi/genshin-chibi-wallpapers.zip`. Integrity manifest: `output/genshin-chibi/manifest.json` (15 files, exact sizes, opaque, SHA256).

Exact prompt records: `documentation/artwork/genshin-kaeya-tidal-provenance.json`, `documentation/artwork/genshin-chibi/genshin-celestial-promise.json`, and `documentation/artwork/genshin-chibi/designs-4-5-prompts.json`.

## Supplied originals

Added two further designs at the user’s request to preserve the attached artwork as is: `genshin-original-sketch-parade` and `genshin-original-kaeya-map`. Each has three opaque device sizes. The source image is scaled proportionally, kept complete, and bottom-centered over a matching paper-color background. No generative redraw or character crop. These six files are packaged separately in `output/genshin-chibi/genshin-original-wallpapers.zip`; provenance and hashes are in `originals-manifest.json`. Total local collection: seven designs and twenty-one assets.

## Validation

The final seven-template/twenty-one-path schema and exact PNG dimension test passes (`output/genshin-chibi/originals-tests.log`). All fifteen generated PNGs passed full Pillow decoding, size and opacity checks; both original-artwork preview rows were visually inspected after packaging. Full suite has a Cloudinary coverage failure until upload; an existing little-friends dense tablet-landscape layout assertion also fails. The inventory assertion was updated for the added templates. Browser Canvas screenshots were not captured.

Production build completed successfully (Vite client, SSR and SEO prerender).

## Upload and local preview

All 21 assets uploaded to Cloudinary cloud `djfyq0jyz`. Scoped uploader dry run confirms zero pending; Cloudinary coverage, local preview merge and 21-image integrity tests pass (8/8). The local Vite API includes `genshinChibiTemplates` as preview additions; shared live catalog is unchanged. Local URL: `http://127.0.0.1:5173/services/schedule-wallpaper?collection=genshin`. Browser opening was queued by Codex; automated HTTP inspection was blocked/timed out.

Gallery update: the generated `genshin-teyvat-sketch-parade` variant is removed. The preserved original `genshin-original-sketch-parade` is now named Teyvat — Sketch Parade. Six designs and eighteen device assets remain selectable. Original assets are retained.

Gallery update: Paimon — Starlight is removed from selection. Five designs and fifteen device assets remain selectable; original files are retained.
