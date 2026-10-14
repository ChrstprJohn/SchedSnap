# Ghibli reference collection

Nine supplied references become nine distinct designs, each with separately generated mobile, portrait-tablet, and laptop compositions (27 opaque PNG assets). The palette follows the references: warm ivory paper, subdued sage and olive ink, a soft moss wash, aged ruled stationery, and matte grey Totoro.

| Design | Reference treatment |
| --- | --- |
| Sage Sticker Collage | Uneven green character stamps and stars on beige paper |
| Flower Grid | Notebook grid, flowers, tiny characters, and a stamp footer |
| Gingham Border | Sage gingham edges and softly drawn character stickers |
| Forest Star Scrapbook | Layered sage star, stamp cards, flowers, and paper swatch |
| Tilted Stamp Notes | Rotated Totoro and Jiji stamps on cream graph paper |
| Spiral Forest Notes | Tiny stars, spirals, Jiji, No-Face, and stamp cards |
| Sage Wash Friends | Soft green paper wash with stamps, soot sprites, and sprout |
| Totoro Close-Up | Simple matte grey face with cream chevron belly |
| Notebook Scrapbook | Aged ruled paper with loosely drawn Totoro collage cards |

Generation uses the built-in image_gen tool. Each prompt treats its reference as the authority for character proportions, linework, colors, and materials; no realistic fur, shiny 3D, sharpened outlines, or added rendering detail. Layout edits move characters outside the schedule area while preserving their appearance. Exact prompts, input references, source paths, and any prior versions are in `ghibli-prompts.json`.

Runtime assets: `public/wallpapers/scenic/<ghibli-id>/{mobile,tablet,laptop}.png`. Exact dimensions are 1080 × 2400, 1600 × 2560, and 1920 × 1080. Original masters are retained under `output/ghibli/masters/`; generated masters with matching aspect ratios are resampled to exact delivery dimensions without stretching. Templates use cream frosted pills with dark green text and left-aligned laptop schedules. Portrait tablet keeps the shared centered schedule and spacing defaults.

The dedicated Ghibli category is registered in `src/config/collections.js`, with templates in `src/assets/ghibliTemplates.js`. Portrait schedule layouts reserve the lower 23% for artwork, including when fitting dense schedules. Totoro Close-Up uses a higher intrinsic schedule position that is also preserved in its gallery thumbnail so the eyes remain visible. Local previews append only missing IDs and preserve remote overrides and hidden records. Existing live Admin records are not rewritten; unrelated deleted designs are not republished.

Release has three distinct steps: artwork upload, frontend merge/deployment, and shared catalog publication. Upload only this collection using `node scripts/upload-cloudinary.mjs --artwork-manifest output/ghibli/manifest.json` (review with `--dry-run` first). After the release is authorized, review `node scripts/publish-ghibli-templates.mjs`, then publish using `--publish --expect-revision <reviewed-revision>`. That bounded publisher only adds missing Ghibli IDs, preserving existing records, hidden states, overrides, and dates. The shared catalog remains unchanged during local preparation.

Verification renders every design with sample and dense schedules across the three device formats, preserving all five or fifteen meetings and the existing overflow guard. Preview sheets and the render report are retained under `output/ghibli/`.
