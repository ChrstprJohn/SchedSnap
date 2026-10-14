# We Bare Bears wallpaper collection

Created October 14, 2026 from the four supplied reference images. The references were used for palette, tone, and layout; the characters were drawn as clean 2D fan art with visible Ice Bear, Grizzly, and Panda identifiers.

| Reference | Three designs | Style cues |
| --- | --- | --- |
| 1 | Edge Peek Trio A, B, C | Warm ivory, quiet center, bears peeking from outer edges |
| 2 | Lavender Reader, Dusk Book Club, Lavender Panels | Lavender fields and Ice Bear reading at the lower edge |
| 3 | Pink Selfie Pop, Paper Pals, Gouache Giggles | Dusty-pink backgrounds and the playful trio along the bottom |
| 4 | Stationery Frame, Keepsake Double Frame, Gentle Bear Postcard | Cream stationery frames, tiny paw/heart/star marks, small trio near the bottom |

Each design has independently composed mobile, tablet, and laptop PNGs under `public/wallpapers/scenic/wbb-*/` at **1080 × 2400**, **1600 × 2560**, and **1920 × 1080**. The 36 final files are opaque RGB images with 36 unique SHA-256 hashes. Final image and checksum inventory: [manifest.json](../output/we-bare-bears/manifest.json); dimension and uniqueness results: [qa-summary.json](../output/we-bare-bears/qa-summary.json).

All four groups were inspected in device contact sheets under `output/we-bare-bears/review/`. Two reference-3 groups initially used an incorrect lavender single-bear reading scene; those files were replaced with the requested pink trio compositions before upload. The rejected versions are not present in the upload manifest. Corrective source images and verification are in `output/we-bare-bears/corrections/`.

All **36 visually reviewed assets** were uploaded through the scoped artwork-manifest flow. A follow-up dry run reported zero pending files, and HEAD checks confirmed all 36 Cloudinary URLs return HTTP 200 with `image/png` and `Access-Control-Allow-Origin: *` for Canvas. The runtime URL mappings are in `src/assets/cloudinaryManifest.js`; verification details are in [cloudinary-verification.json](../output/we-bare-bears/cloudinary-verification.json).

The production catalog now contains all 12 published We Bare Bears designs with 36 immutable Cloudinary URLs. Publication preserved all 246 existing records and dates. The frontend includes the We Bare Bears filter and definitions. Run scripts/publish-we-bare-bears.mjs for a revision-checked publication review; results are recorded in output/we-bare-bears/publication-result.json.

Exact generation prompts and per-reference provenance:

- [Reference 1](we-bare-bears-reference-1.json)
- [Reference 2](we-bare-bears-reference-2.json)
- [Reference 3](we-bare-bears-reference-3.json)
- [Reference 4](we-bare-bears-reference-4.json)

