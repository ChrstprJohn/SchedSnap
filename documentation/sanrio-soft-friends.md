# Soft Sanrio friends set

Four additional reference-inspired designs: Melody Dream, Kitty Vanity, Plush Pals, and Friends Gingham. Each has independently generated mobile 1080×2400, portrait-tablet 1600×2560, and laptop 1920×1080 artwork. Opaque PNG files are saved in `public/wallpapers/scenic/sanrio-{melody-dream,kitty-vanity,plush-pals,friends-gingham}/`; timetable box fill defaults remain disabled.

Built-in image generation produced all compositions. Exact prompts, original reference paths, generated source paths, and actual source timestamps are preserved in the four matching `sanrio-*-prompts.json` files. Device sizing uses proportional contain normalization with minimal matching edge padding where necessary. Kitty Vanity portraits received a targeted generation edit to reduce character size and keep the regular schedule area clear.

The manifest, sample/dense Canvas results, and live image delivery evidence are recorded in `output/sanrio/soft-friends-{manifest,qa,delivery}.json`. Dense schedules may extend over background decorations; transparent containers preserve visible artwork, while placement and tablet box spacing remain adjustable.

Catalog additions use the verified immutable Cloudinary image URLs. Existing records and first-publication dates are preserved. This lets already-deployed clients display the new designs while the contribution branch is awaiting merge.

All 12 new image links returned HTTP 200, and the live catalog returned all four additions, bringing Sanrio to 20 designs. The 24 sample/dense Canvas renders preserved every meeting without overflow. Build and focused lint passed. The full test suite passed 150 of 151 tests; the preexisting failure is the missing older `onepiece-stacked-pals/mobile.png` source file.
