# Sanrio stationery set

Four reference-inspired designs: Strawberry Patchwork, Melody Bedtime, Pastel Scrapbook, and Melody and Piano. Built-in image generation created each separately for mobile 1080×2400, portrait tablet 1600×2560, and laptop 1920×1080. Source PNGs are saved under `public/wallpapers/scenic/sanrio-{strawberry-patchwork,melody-bedtime,pastel-scrapbook,melody-piano-stationery}/`.

The pictures supply visual references only. Their printed labels, computer window decorations, account text, and screenshot controls are omitted from the clean artwork. Characters, lace, gingham, stitched panels, and pastel frames are recomposed around a quieter schedule area. Container fill remains disabled by default.

Exact prompts, source file paths, reference paths, device destinations, and actual source creation timestamps are retained in the matching four `sanrio-*-prompts.json` documents. Generated dimensions are normalized proportionally, without cropping, with minimal matching edge padding. Melody Bedtime receives a single targeted correction pass to reduce its panels.

Verification files are `output/sanrio/stationery-{manifest,qa,delivery}.json`. Actual Canvas checks cover sample and dense schedules on each device. Dense schedules can extend over peripheral decoration; transparent containers reveal the artwork but do not guarantee every character stays free of text. Placement and tablet spacing controls remain available.

Uploaded immutable Cloudinary URLs are used for new catalog records so the designs can appear in already-deployed clients. Publication preserves existing records and their original dates.

Live verification returned all four additions, bringing Sanrio to 24 designs; all 12 image links returned HTTP 200. The 24 sample/dense Canvas renders preserved every meeting without overflow. Build and focused lint passed. The full suite passed 150 of 151 tests, with only the preexisting missing `onepiece-stacked-pals/mobile.png` source-image failure.
