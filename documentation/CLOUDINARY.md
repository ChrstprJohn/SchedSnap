# Cloudinary wallpaper delivery

Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local.
Do not use VITE_ prefixes. These credentials are only used by the local migration
script, not the browser or the deployed analysis API.

Keep the API key's display label separate from these values: the cloud name is
the product environment name, the API key is numeric, and the secret belongs to
that key. The script loads .env.local first, falling back to .env.

Run `npm run assets:check` to check credential presence and count pending artwork.
Run `npm run assets:upload` to upload the currently referenced template images.
Uploads use content-based IDs with overwrite disabled. Progress is saved after
each image, so rerunning resumes without uploading completed files again.

The generated src/assets/cloudinaryManifest.js contains public image URLs and
dimensions only. Commit this manifest and rebuild the frontend after uploading.
No Cloudinary secrets need to be added to Vercel for image delivery.

Run `node scripts/verify-cloudinary.mjs` to check three representative optimized
previews, full-size PNG responses, and canvas CORS headers. The initial samples
were 97–99% smaller than their original PNG files. This checks delivery, not a
browser download or a visual quality comparison.

Gallery canvases request artwork sized to their canvas dimensions with automatic
format and quality. Full-size canvases request lossless PNG. Original
files remain in public as source material; unmapped paths continue using them.
The image loader enables anonymous CORS so pixel reads and PNG exports can work.

This migration covers template artwork, not landing-page images, fonts, user
schedule uploads, or generated downloads. Public asset delivery consumes your
Cloudinary account usage. Review usage in the Cloudinary console.

On October 11, 2026, the single-image Window Light, Blue Hour, Blush Club, and
After Hours presets were removed. Their three backgrounds (window-light.png,
blue-glass.png, and pink-check.png) were deleted locally and from Cloudinary
with CDN invalidation requested. Remaining image-backed backgrounds have mobile,
tablet, and laptop variants; transparent mascot cutouts remain shared across devices.
