# Two handmade Domo reference designs

Golden Paper Domo and Brown Domo Face each have independently composed mobile (1080×2400), portrait tablet (1600×2560), and laptop (1920×1080) artwork. This batch contains exactly two designs and six assets, without extra variants.

The built-in image generator uses the supplied images as subject and style references. Golden Paper Domo retains warm orange crayon outlines and cream paper texture. Brown Domo Face retains the plain brown background, black dot eyes, red mouth, white teeth, and natural hand-drawn outline. The rendering stays simple and handmade rather than glossy or heavily enhanced.

Final PNGs are saved under `public/wallpapers/scenic/domo-{golden-paper,brown-face}/`. Original generated files are retained under `output/domo/reference/`, with exact prompts, paths, dates, and dimensions recorded in `domo-reference-prompts.json`. The repository's existing ignore policy keeps raster masters local; uploaded delivery metadata is saved in `src/assets/cloudinaryManifest.js`.

Both presets belong to Domo and are prepared for local preview on `sam/branch`. Laptop schedules start on the left. Their image upload is separate from publishing the live catalog; Git push and catalog publication wait for the user's instruction.
