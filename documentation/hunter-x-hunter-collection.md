# Hunter × Hunter mobile collection

15 opaque PNG wallpapers, each 1080 × 2400. Built-in imagegen generated each asset individually. Four subagents contributed; the environment allowed three child agents to run concurrently.

## Inventory

All files follow `public/wallpapers/scenic/<id>/mobile.png`.

| Style | IDs |
| --- | --- |
| Manga collage (5) | hxh-gon-manga, hxh-killua-manga, hxh-kurapika-manga, hxh-leorio-manga, hxh-hisoka-manga |
| Plain portrait (4) | hxh-gon-plain, hxh-killua-plain, hxh-kurapika-plain, hxh-hisoka-plain |
| Chibi (4) | hxh-gon-chibi, hxh-killua-chibi, hxh-kurapika-chibi, hxh-leorio-chibi |
| Group (2) | hxh-phantom-troupe, hxh-four-slash |

The plain portraits have monochrome characters and colored irises; background colors remain. Chibis use the Columbina Elemental Chibi character scale and placement with tonal character motifs: Gon's fishing rod, Killua's lightning, Kurapika's chains, and Leorio's glasses and attaché case. They have no crescents or swirls. Hisoka and Leorio manga use anime cel rendering. Hisoka has a pink rim glow and pink-tinted manga panels; Leorio's panels have a yellow-orange tint and Gon's a red-orange tint. Phantom Troupe preserves the reference's names and title. The slash design features Gon, Killua, Kurapika and Leorio.

## Integration

`src/assets/hunterTemplates.js` registers the collection. `mobileOnly` is validated by the shared schema and respected by the public gallery and editor route. Development catalog previews include the collection without changing existing remote catalog records. No tablet/laptop artwork is substituted.

Assets are uploaded through the scoped, SHA256-verified `output/hxh/manifest.json`. Cloudinary metadata is stored in `src/assets/cloudinaryManifest.js`. Uploading does not publish records to the shared live catalog or deploy the frontend; those steps have not been performed.

## Prompts and provenance

- `documentation/hxh-manga-a.md`
- `documentation/hxh-manga-b.md`
- `documentation/hxh-plain.md`
- `documentation/hxh-plain-eye-revision.md`
- `documentation/hxh-chibi.md`
- `documentation/hxh-groups.md`
- `documentation/hxh-manga-tint-revision.md`
- `documentation/hxh-chibi-motif-revision.md`

Source generations remain at their recorded generated_images paths. Final outputs are resized with Pillow LANCZOS to the required dimensions. Contact sheet and download bundle: `output/hxh/collection-contact.jpg` and `output/hxh/hunter-x-hunter-mobile.zip`.

Images have been visually inspected and dimensions/opacity checked. Automated schedule layout checks include the new presets. Interactive browser and real-device schedule previews have not been performed; dense schedules can cover the large portraits, slash panels or Phantom Troupe title.

Prior collection verification: 228 tests passed; build and relevant ESLint checks passed. The preceding artwork upload dry run reported zero pending among 15 referenced artworks. No shared live catalog publication or frontend deployment was performed. See the revision records for the latest artwork changes.

2026-10-17 motif/tint revision: seven updated assets inspected, dimension/opacity checked, uploaded, and included in the refreshed ZIP and contact sheet. Final scoped dry run: zero pending of 15 referenced artworks. Six focused image/schema tests and production build passed. Interactive schedule overlay preview remains unchecked.
