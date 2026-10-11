# Mascot cutouts and templates

61 unique transparent PNG cutouts are uploaded to Cloudinary and registered as selectable Mascots templates: 25 soft 3D, 12 pixel, 6 reactions, and 18 hand-drawn gestures/accessories.

Masters live in `public/images/mascots/masters`, `public/images/pixel-mascots/masters`, `public/images/goofy-mascots/masters`, and `public/images/doodle-mascots/masters`. Each character has one uploaded runtime asset. The redundant 366 padded device PNG/WebP layouts were removed at the user’s request. Canvas controls left/center/right placement, scaling, schedule content, and background for mobile, tablet, and laptop; it keeps pixel artwork crisp using nearest-neighbor rendering.

Template definitions: `src/assets/generatedMascotTemplates.js`. Upload metadata: `src/assets/cloudinaryManifest.js`. Exact prompts/source provenance: `documentation/*mascot-generation-*.json`. Labeled contact sheets under `documentation/previews` are review proofs; their cream surface is not part of the cutouts.

New badges sit at the top right of gallery artwork and expire seven days after first publication (or creation for seeded records). Dates are immutable across edits and republication; old undated templates have no badge.

Upload only cutouts with `node scripts/upload-cloudinary.mjs --mascot-packs`. Publish additions while preserving existing edits with `node scripts/publish-mascot-templates.mjs`.
