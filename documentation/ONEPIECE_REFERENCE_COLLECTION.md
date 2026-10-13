# One Piece reference collection

Requested release: twelve new backgrounds, with three variants for each of the four supplied references and three independently generated device compositions per variant (36 PNGs).

| Reference | Variants | Visual direction |
| --- | --- | --- |
| Sunset crew | Sunset Voyage, Sunset Harbor, Sunset Dawn | Parchment skies, red sun, Straw Hat crew silhouettes |
| Zoro | Emerald Watch, Moonlit Resolve, Golden Blade | Forest green, restrained gold, swordsman portrait |
| Chopper | Cow Cuddle, Sakura Chopper, Sweet Dream | Cream paper, cute pink accents, hand-drawn character |
| Devil Fruits | Amethyst Gum-Gum, Flame-Flame, Op-Op Hearts | Purple spiral, orange flame, and red heart fruit patterns with bold ink outlines |

Mobile is 1080 × 2400; tablet is 1600 × 2560; laptop is 1920 × 1080. Each background is opaque and contains artwork only. Canvas supplies all schedule text and containers. New templates join the existing `onepiece` collection without replacing previous designs.

All 36 final backgrounds are generated and uploaded to Cloudinary. Exact prompts, current generated source paths, and final dimensions are recorded in the five family provenance files. Portrait Zoro and Chopper artwork was reduced to footer illustrations after the first schedule review; their presets use existing mobile and tablet margin controls to keep dense schedules clear of the characters. Laptop compositions were retained.

The final Canvas review covers all twelve templates on three devices with sample and dense schedules: 72 renders, no overflow or browser errors. All 280 tests, lint, and the production build pass. `ONEPIECE_REFERENCE_VALIDATION.json` records dimensions and renderer results; `ONEPIECE_REFERENCE_UPLOAD.json` records content hashes, HTTP availability, Canvas CORS, zero pending uploads, and preservation of all 338 existing asset mappings.

Template definitions are registered in `src/assets/onepieceReferenceTemplates.js` and combined into the static catalog. Live catalog publication and frontend deployment have not been performed. After frontend deployment includes the updated Cloudinary manifest, publish only the twelve additions with `node scripts/publish-onepiece-reference.mjs --dry-run` followed by `node scripts/publish-onepiece-reference.mjs`. This publisher preserves existing records and verifies the saved additions.

Download bundle: `output/onepiece-reference-wallpapers.zip`. Overview: `documentation/previews/onepiece-reference-collection.jpg`. Original PNGs remain in `public/wallpapers/scenic/<design-id>/{mobile,tablet,laptop}.png`.
