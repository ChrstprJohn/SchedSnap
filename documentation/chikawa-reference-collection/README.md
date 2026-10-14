# Chiikawa reference collection

12 designs × 3 independently composed device formats = 36 opaque PNGs.

| Reference | Designs |
| --- | --- |
| Pastel repeating trio | Pastel Pals, Sprinkle Friends, Cloud Repeat |
| Photo-card collage | Instant Friends, Photo Album, Blue Buddy Snap |
| Green meadow | Meadow Meetup, Sage Picnic, Daisy Day |
| Pink friend crowd | Pink Plush Parade, Pastel Present Party, Dreamy Starlight Friends |

Mobile is 1080 × 2400; tablet is 1600 × 2560; laptop is 1920 × 1080. Each format was generated independently, then normalized to exact dimensions. Source prompts and corrections are recorded in `reference-1.json` through `reference-4.json`.

`src/assets/chikawaReferenceTemplates.js` holds the 12 presets. Originals remain local under `public/wallpapers/scenic/<id>/`; immutable Cloudinary mappings are committed in `src/assets/cloudinaryManifest.js`. Only the 36 content hashes in `output/chikawa-reference-collection/manifest.json` were approved for this upload. Generic earlier outputs are excluded from this collection.

The default schedule position is high on the page, with laptop schedules on the left, so dense schedules leave the focal faces visible. All 216 sample/dense renders across three devices and three placements fit their canvases. Cloudinary delivery passed for all 36 URLs. The production build and changed-file lint passed. The full suite passed 160 tests; one existing dense landscape-tablet Little Friends layout failure also reproduces in the pulled baseline.

The active One Piece collection was removed from presets, filters, schema, delivery mappings, and the shared live catalog. Historical source and provenance files are retained.

Upload check: `node scripts/upload-cloudinary.mjs --artwork-manifest output/chikawa-reference-collection/manifest.json --dry-run`.

The focused publisher is `scripts/publish-chikawa-reference.mjs`. It verifies source hashes and uploaded metadata, reads the latest catalog, preserves other collections and publication dates, and requires the reviewed revision before `--publish --expect-revision <revision>`.
