---
name: schedsnap-artwork
description: Generate, organize, validate, and upload SchedSnap background or transparent mascot assets to Cloudinary, or add editable pattern templates and publish them to the design catalog.
---

# SchedSnap artwork workflow

Use this guide from the SchedSnap repository root. It is shareable with people and AI coding agents. Repository paths below are relative to that root. Read current scripts before running them: this guide describes the implementation shipped with this skill.

Uploading images, publishing catalog records, and deploying the frontend are separate steps. An image upload alone does not make a selectable template. Work within the user's requested collection; this skill does not authorize deleting or replacing existing designs.

## Choose the asset type and size

| Type | Asset size | Files and destination |
| --- | --- | --- |
| Full background | Mobile **1080 × 2400**; tablet portrait **1600 × 2560**; laptop **1920 × 1080** | Three opaque PNG variants in `public/wallpapers/scenic/<design-id>/{mobile,tablet,laptop}.png` |
| Canvas pattern | No source image required; Canvas draws at each device resolution | Add palette and pattern metadata to `src/assets/patternTemplates.js` |
| Transparent mascot | One high resolution RGBA PNG; recommend **1024–1536 px** on its longest visible edge. Square, portrait, or landscape master is fine | One file in `public/images/<pack>/masters/<character-id>.png` |
| Raster pattern/texture | Use the three full-background sizes above when the design needs bitmap artwork | Register as a background with three `deviceImages`; do not pretend it is a procedural pattern |

Tablet landscape rendering uses **2560 × 1600**. For a landscape-specific illustrated design, inspect `orientation` and the renderer before adding assets: existing scenic validation/tests assume portrait tablet files. The mascot master is reusable in either orientation.

Supported mascot packs: `mascots` (soft 3D), `pixel-mascots`, `goofy-mascots` (3D reactions), and `doodle-mascots`. Adding a new pack requires changes to uploader path validation, schema, and deletion guards; prefer the existing packs.

## Generate clean artwork

Use an available image generation tool for raster illustrations. If editing a reference, inspect it first. Save exact prompts and output provenance under `documentation/`, without credentials. Generate distinct characters, expressions, accessories, and poses rather than uploading duplicates.

**Background prompt example**

> Create a 1080 × 2400 portrait botanical wallpaper in warm ivory and sage. Opaque full bleed artwork, restrained foliage near the corners, quiet low contrast center with generous clear space for a five-day timetable. Artwork only: no text, dates, timetable, logo, UI, badges, watermark, or device frame.

Generate separate compositions for tablet and laptop with the same visual theme. Do not simply stretch the phone background. The app supplies schedule text, containers, and New badges. Keep decoration out of the timetable area and verify real sample/dense schedules in Canvas; composition depends on device and schedule placement.

**Mascot prompt example**

> One cute hand-drawn capybara holding a small mug, full body, friendly expression, clear silhouette, clean edges, entire character and accessory visible, transparent background, character only. No floor, backdrop, card, text, checkerboard pattern, device frame, or timetable. Fill most of the canvas with modest transparent padding. Keep the pose useful at left, center, or right placement.

Set the generator's transparency option explicitly when supported. A painted checkerboard is not transparency. Confirm real alpha with both fully transparent and opaque pixels, inspect edges over light and dark surfaces, and check ears, whiskers, feet, and held objects are not clipped. Tighten excessive transparent margins if necessary while preserving the entire silhouette. Use the image editing tool for visual edits unless the user directs another method.

**Pixel mascot**: request deliberate pixel clusters, limited colors, crisp edges, and no blurred shading; set `pixelArt: true` in the template. Canvas preserves nearest-neighbor rendering. Upscale actual pixel art with nearest-neighbor if needed, rather than generating a smooth character and labeling it pixel art.

**Patterns**: first use the existing editable Canvas primitives: `checker`, `grid`, `ruled`, `circle`, `dots`, `stripes`, `diamonds`, `waves`, and `frame`. Add distinct palettes and suitable ink contrast. No Cloudinary upload is needed for these procedural designs. Extend the renderer and tests if introducing a new primitive.

## Register local assets and templates

Use unique lowercase hyphenated IDs and filenames. Retain only one uploaded mascot master per unique character; **do not create mobile/tablet/laptop copies or transparent full-screen canvases with a tiny character anchored in a corner**. Canvas controls size and placement.

For a mascot, index its pack after saving the PNG:

```powershell
python scripts/package-soft-mascots.py --pack doodle-mascots
```

This requires Python with Pillow and an existing pack `manifest.json`. It validates alpha, records dimensions and alpha bounds, and generates no device copies. For a new installation of an existing pack, create its manifest with `provider`, `background: "transparent"`, `cloudinaryStatus: "pending"`, and `assets: []` first. The uploader reads these pack manifests for `--mascot-packs`.

Add a definition to `src/assets/generatedMascotTemplates.js`:

```js
{
  id: 'doodle-capybara-tea',
  name: 'Capybara Tea',
  description: 'A little tea break for your timetable',
  collection: 'mascot', layout: 'mascot',
  mascot: 'capybara-tea', mascotStyle: 'doodle', pixelArt: false,
  image: '/images/doodle-mascots/masters/capybara-tea.png',
  mascotPosition: 'center', mascotSide: 'right',
  background: '#e3ead9', ink: '#304735', muted: '#304735',
  surface: '#ffffff80', line: '#30473545', particleStyle: 'none',
  createdAt: 'REPLACE_WITH_ACTUAL_UTC_ISO_TIMESTAMP',
}
```

Choose `mascotPosition: 'left' | 'center' | 'right'` based on the pose and composition. `mascotSide` is a legacy fallback with only left/right values. Users can change character position in the appearance controls. Soft 3D uses `mascotStyle: 'soft'`, pixel uses `'pixel'`, reactions use `'goofy'`, and drawings use `'doodle'`. The filters group soft/goofy under 3D.

For full backgrounds, use `src/assets/scenicTemplates.js` and include:

```js
collection: 'scenic',
family: 'tropical-botanical', // Use an existing family, or add its filter definition.
image: '/wallpapers/scenic/tea-garden/mobile.png',
deviceImages: {
  mobile: '/wallpapers/scenic/tea-garden/mobile.png',
  tablet: '/wallpapers/scenic/tea-garden/tablet.png',
  laptop: '/wallpapers/scenic/tea-garden/laptop.png',
},
```

Also supply unique `id`, `name`, palette fields (`background`, `ink`, `muted`, `surface`, `line`) and actual creation time. Published full backgrounds require three distinct device paths and `image` equal to the mobile path. A PNG contains artwork only, never a user's schedule.

For a Canvas pattern, follow the existing tuple-to-template mapping in `patternTemplates.js`; use `collection: 'pattern'`, `pattern`, `patternColor`, the palette fields, and no image. Ensure new variants receive their own actual creation time rather than assigning a fresh date to old presets. All these modules are combined by `src/assets/templates.js`.

## Upload to Cloudinary through code

Use Node **22.12+**, the project dependencies, and a private `.env.local`:

```dotenv
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Never commit `.env.local`, print secrets, or expose the API secret through a `VITE_` variable or browser code. The existing uploader loads `.env.local` before `.env` and signs uploads server-side. These commands require network access and authorization to upload to the configured account.

```powershell
# Mascot pack manifests: inspect pending uploads, then upload masters only.
node scripts/upload-cloudinary.mjs --mascot-packs --dry-run
node scripts/upload-cloudinary.mjs --mascot-packs

# Images referenced by wallpaperTemplates: backgrounds and character references.
node scripts/upload-cloudinary.mjs --dry-run
node scripts/upload-cloudinary.mjs
```

Choose the appropriate pair; both are resumable. Existing content-hashed IDs are skipped. A dry run still requires configuration and reads local files, but does not upload. The uploader uses multipart `FormData`, a signed timestamp, `overwrite: false`, and four concurrent requests. IDs look like `schedsnap/images/doodle-mascots/masters/capybara-tea-<16-character-content-hash>` or `schedsnap/wallpapers/scenic/tea-garden/mobile-<hash>`.

The result is public-only metadata in `src/assets/cloudinaryManifest.js`: local path → cloud, public ID, HTTPS URL, width, height. Commit this manifest with the assets and template definitions. Runtime code resolves local paths through it; do not manually paste secrets into metadata.

If interrupted, rerun the same command. The mascot checkpoint is `output/cloudinary-upload-mascots.json`; retain it until the source manifest is successfully saved and a dry run reports zero pending assets, then remove the redundant checkpoint. Do not delete the checkpoint during a failed upload or repeatedly retry rejected credentials. Inspect the reported error and correct its cause first.

## Publish to the selectable catalog

The live catalog is stored separately from static definitions. When authorized, publish new generated mascot definitions after their uploads:

```powershell
node scripts/publish-mascot-templates.mjs
```

This appends missing IDs, resolves their images to uploaded Cloudinary URLs, sets first publication time, and preserves administrator replacements. It is an additions workflow; changing an existing static preset does not automatically overwrite its live catalog record. Its completion message may mention the original batch size; rely on the actual catalog and pending counts.

For backgrounds/patterns, publish through the authenticated Admin UI/API, or write a focused server-side script using `createCatalogStore` from `server/catalogStore.js`. Read the latest catalog with `read(true)`, preserve existing records, add only the requested missing IDs, validate with `templateSchema.parse({ ...template, status: 'published' })`, set an actual `publishedAt`, and write the merged catalog. Avoid concurrent catalog writes; the Admin API performs revision checks. Keep background local paths paired with a deployed `cloudinaryManifest.js`, since arbitrary Cloudinary background delivery URLs are not accepted by the current template schema.

**Do not use `scripts/refresh-design-library.mjs` as a generic publisher.** It is a migration that removes the Originals collection and its unshared artwork. Likewise, `remove-mascot-layout-uploads.mjs` is a one-time cleanup utility, not an upload step.

New badges expire seven days after first publication, falling back to creation time for seeded records. Use actual UTC timestamps (`new Date().toISOString()`), preserve existing dates, and do not refresh dates on edits or republication. The Admin API owns creation/publication dates for managed records.

## Verify and deliver

1. Confirm each master has real alpha and each full background has the exact dimensions. Check unique IDs, matching filenames, and schema acceptance.
2. Run the appropriate uploader dry run again; expect zero pending. Confirm every referenced runtime path has uploaded metadata.
3. Verify the actual catalog, not just local seed files: new designs appear once, in the intended style/collection, with the correct first publication date.
4. Preview mobile, tablet, and laptop with sample and dense schedules. Check readable text, intact artwork, crisp pixels, left/center/right placements, no timetable overlap, and no accidental background on cutouts. Filters stay on one horizontal row.
5. Run `npm test` and `npm run build` for implementation changes; update intentional inventory-count assertions when adding designs. Run relevant lint checks. For documentation-only edits, check paths, commands, and Markdown instead.
6. Commit intended changes and report uploads, catalog publication, and frontend deployment separately. Preserve unrelated work. Stop any development server you started and follow the repository's Windows process cleanup instructions.

Remove temporary sheets, duplicate device canvases, and upload checkpoints only after successful verification. Keep source masters and useful prompt provenance. Before authorized Cloudinary deletion, check all catalog image/device references for shared IDs and use the bounded deletion helpers; never purge a folder merely because a local file appears unused.

## Implementation pointers

- `scripts/upload-cloudinary.mjs`: signed resumable image upload and metadata.
- `scripts/package-soft-mascots.py`: transparent master indexing.
- `src/assets/templates.js`: device sizes and combined static catalog.
- `src/assets/{scenicTemplates,generatedMascotTemplates,patternTemplates}.js`: definitions.
- `shared/templateSchema.js` and `shared/generatedArtwork.js`: accepted fields and artwork namespaces.
- `src/utils/{canvasHelpers,wallpaperAssets,cloudinaryAssets,wallpaperTheme}.js`: rendering, asset resolution, pixel handling, and customization.
- `src/config/{collections,mascotStyles}.js`: collection and style routing.
- `src/utils/templateFreshness.js` and `api/admin.js`: badge age and server-owned dates.
- `server/{catalogStore,deleteArtwork}.js`: catalog persistence and bounded asset deletion.
- `documentation/mascot-packs.md`: current mascot inventory and provenance.
