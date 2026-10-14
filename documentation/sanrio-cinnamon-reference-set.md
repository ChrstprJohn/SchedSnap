# Four Cinnamoroll reference designs

Exactly one design is made from each supplied image: Cinnamon Pastel Stack, Cinnamon Bear Panels, Cinnamon Chalk Cloud, and Cinnamon Mocha Pair. Each has independently composed mobile (1080×2400), portrait tablet (1600×2560), and laptop (1920×1080) artwork, for twelve total assets.

The supplied images are style and subject references. The built-in image generator preserves their soft handmade illustration character: gentle flat colors, natural pencil contours, and restrained paper texture. No extra stylistic variants are created. Portrait schedules have quiet upper space, and laptop characters sit toward the right so their schedules can begin on the left.

Exact prompts, source paths, dates, and output dimensions are recorded in `sanrio-cinnamon-reference-prompts.json`. Final PNGs are under `public/wallpapers/scenic/sanrio-cinnamon-{pastel-stack,bear-panels,chalk-cloud,mocha-pair}/`; generated masters are retained under `output/sanrio/cinnamon-reference/`. These follow the existing image ignore policy. Cloudinary delivery mappings are saved in `src/assets/cloudinaryManifest.js`.

The four presets remain in Sanrio with the existing white frosted-glass pill defaults. They are prepared for local preview on `sam/branch`; pushing and publishing the live catalog wait for the user's instruction.
