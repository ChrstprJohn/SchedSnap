# Mascot cutouts

`masters/` contains one transparent PNG per mascot. These are the only runtime assets. Canvas positions and sizes the same cutout for mobile, tablet, and laptop schedules. No padded device layouts or duplicate WebP uploads are used.

`manifest.json` lists master paths and alpha bounds. Cloudinary metadata is in `src/assets/cloudinaryManifest.js`. Exact generation prompts and provenance are in `documentation/*mascot-generation-*.json`.
