# Sanrio wallpaper collection review

Reviewed 2026-10-13. Scope: generated background assets and authorized Cloudinary uploads. No catalog publication or frontend deployment was performed.

## Artwork requirements

| Reference | Style retained | Three distinct variants | Device PNGs |
| --- | --- | --- | --- |
| `image-1.png` | Pastel parade, bunting, checked footer, fine character outlines | `sanrio-parade-candy`, `sanrio-parade-music`, `sanrio-parade-balloons` | 9 |
| `image-2.png` | Pink polka dots, vertical ribbon/bows, pixel Hello Kitty | `sanrio-pixel-rose`, `sanrio-pixel-lilac`, `sanrio-pixel-mint` | 9 |
| `image-3.png` | Lace curtains, pale vertical stripes, My Melody/Hello Kitty tea setting | `sanrio-tea-strawberry`, `sanrio-tea-patisserie`, `sanrio-tea-flowers` | 9 |
| `image-4.png` | Pink gingham, Hello Kitty heads, strawberries, bows and daisies | `sanrio-gingham-strawberry`, `sanrio-gingham-ribbon`, `sanrio-gingham-daisy` | 9 |

All 36 images are valid PNGs with exact requested sizes: mobile 1080×2400, tablet 1600×2560, laptop 1920×1080. Every pixel is opaque; RGBA alpha extrema are 255–255. All 36 SHA256 values are different. `output/sanrio/manifest.json` records filenames, reference mappings, dimensions, opacity and hashes.

An independent visual pass inspected all four supplied references and all twelve device sets using labeled contact sheets. Character identities and visible faces are intact in the source artwork. Variants change props, poses, patterns or arrangements, rather than merely duplicating files. Laptop compositions spread decorations across the footer/corners. No unwanted words, schedule UI, device frames, logos or watermarks were observed in the generated backgrounds. The central fields are restrained and suitable for a schedule, subject to the placement limitations below. Pixel variants preserve stair-stepped character silhouettes within the reference's softer ribbon/polka-dot treatment.

Inspection script: `scripts/inspect-sanrio-artwork.py`. Artwork and reference sheets: `output/sanrio/review/*-artwork.jpg` and `references.jpg`.

## Schedule composition verification

The actual `src/utils/canvasHelpers.js` `drawWallpaper` pipeline produced 72 renders: 12 designs × 3 devices × sample/dense schedules. Sample has one meeting per weekday; dense has fifteen meetings. The final report records zero missing backgrounds and zero renderer overflow.

The backend is `@napi-rs/canvas` with the project's DM Sans font. The harness rounds non-hundred CSS font weights to the nearest hundred because this backend misparses weights such as 650/750 as font sizes. This is a backend compatibility workaround; application source fonts were not changed. Browser UI preview was unavailable. Early malformed previews were replaced; inspect only the final sheets and `output/sanrio/qa/render-report.json`.

Text remains readable because cards have an almost opaque white fill. Zero overflow does **not** establish artwork clearance. The test template uses one shared placement (`verticalPosition: -35`) and demonstrates these concrete placement limitations:

- `output/sanrio/qa/sanrio-parade-music-tablet-dense.png`: Thursday/Friday cards cover character faces in the footer. Candy/balloons tablet dense renders also enter the character band.
- `output/sanrio/qa/sanrio-pixel-rose-tablet-dense.png`: the Friday card covers part of the lower-right Kitty face/bow. Lilac and mint tablet dense renders show the same placement issue.
- `output/sanrio/qa/sanrio-tea-patisserie-tablet-dense.png`: the lower cards cover both character faces. Strawberry/flowers tablet dense renders also cover the tea-party character band.
- `output/sanrio/qa/sanrio-tea-patisserie-mobile-dense.png`: the lower cards cover the tea-party faces. Strawberry/flowers mobile dense renders also enter the illustrated scene.
- `output/sanrio/qa/sanrio-tea-flowers-laptop-sample.png`: the wide Friday card enters the inward edges of the two faces. Other tea laptop sample compositions also overlap inward scene details; laptop dense cards are narrower and largely spare faces but cover central table/cake details.
- `output/sanrio/qa/sanrio-gingham-daisy-mobile-sample.png`: the Monday card covers part of the middle-right Kitty face; dense Monday does likewise.

These are compositing limitations, not clipped or damaged PNG masters. Before selectable template registration, choose per-design/per-device schedule placement, width and scale that reserve the illustrated zones. Do not claim universally overlap-free dense schedules from the current renders. No asset edits were made by this review.

## Cloudinary upload verification

The uploader now accepts `--artwork-manifest` for bounded background uploads. It validates allowed scenic device paths, unique entries, opaque/dimension flags, current SHA256, PNG signature and exact dimensions before selecting files. Existing default and mascot upload workflows remain available.

Commands completed:

```powershell
node scripts/upload-cloudinary.mjs --artwork-manifest output/sanrio/manifest.json --dry-run
node scripts/upload-cloudinary.mjs --artwork-manifest output/sanrio/manifest.json
node scripts/upload-cloudinary.mjs --artwork-manifest output/sanrio/manifest.json --dry-run
node scripts/verify-sanrio-cloudinary.mjs --delivery
```

Initial dry run selected exactly 36 pending files. Upload completed 36/36; final dry run reported zero pending. The local manifest gained exactly 36 entries and all 374 previous public metadata records are unchanged. The independent verifier matched each current SHA-derived public ID and exact returned image dimensions. All 36 HTTPS asset HEAD requests succeeded, returned `image/png`, and exposed `Access-Control-Allow-Origin: *` for Canvas. Public-only evidence is saved in `output/sanrio/cloudinary-verification.json`; the original metadata snapshot is `output/sanrio/review/cloudinaryManifest-before.js`. Credentials were not printed or saved in review artifacts.

The first restricted upload attempt failed DNS resolution. The same scoped user-authorized command succeeded with network escalation. No unrelated assets were uploaded.

## Implementation checks

- `node --check scripts/upload-cloudinary.mjs`: passed.
- Focused ESLint for uploader and Cloudinary verifier: passed.
- `npm run build`: passed, with the existing large-chunk warning.
- `npm test`: 142/143 passed. The sole failure is the preexisting absent `public/wallpapers/scenic/onepiece-stacked-pals/mobile.png` in `tests/onepiece.test.js`; this review did not replace unrelated assets.

Existing package-lock changes from dependency installation were preserved. Upload is complete; catalog publication and frontend deployment are separate and remain outside this task's authorization.

## Local gallery integration follow-up

At the user's request to see the artwork on localhost, twelve Sanrio template definitions, a Sanrio filter, and schema support were added. The Vite development API previews missing local definitions alongside the remote catalog, preserving all existing records and respecting any same-ID hidden or replaced record. The default production handler has no local preview additions.

The running `localhost:5173/api/catalog` was verified to contain 228 designs: 216 unchanged existing published records and twelve Sanrio designs, each exactly once. All 36 image paths resolve through the uploaded Cloudinary manifest. The shared remote catalog still contains zero Sanrio records; no catalog publication was performed. Local preview hearts remain disabled until the designs are published. Evidence: `output/sanrio/localhost-catalog-review.json`.

The additive shared-catalog publisher is prepared in `scripts/publish-sanrio-templates.mjs` and defaults to a read-only dry run. Its review confirms twelve possible additions and no missing uploads; shared publication requires explicit authorization.

After integration, the build and focused lint pass. The complete suite has 148/149 passing tests, with the same preexisting missing Onepiece PNG as its sole failure. New tests cover uploaded device selection, template schema/category registration, and local preview preservation/isolation.
