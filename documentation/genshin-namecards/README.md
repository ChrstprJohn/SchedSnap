# Genshin namecard collection — eight characters

Requested collection: Xiao, Gaming, Ineffa, Kazuha, Cyno, Ifa, Iansan and Kinich. Each design has independently generated mobile (1080×2400), portrait tablet (1600×2560) and laptop (1920×1080) artwork. Official namecard references are preserved closely, with a small elemental Vision detail. These are generated adaptations, not original official exports.

Assets: `public/wallpapers/scenic/genshin-namecard-<character>/{mobile,tablet,laptop}.png`. Templates extend `src/assets/genshinBackgroundTemplates.js` under the existing Genshin collection, preserving earlier designs. PNGs contain no schedule or UI; the existing Canvas renderer supplies those.

Source references, exact generation prompts and selected native output paths are recorded in the individual character/group documents here. Built-in imagegen is the generation provider. The existing packaging utility normalizes each device composition to exact pixel dimensions, with an aspect-ratio guard and no cropping.

The session supports three concurrent child agents. Three groups run initially, with a fourth agent following when a slot opens. The parent handles Iansan and catalog integration. Four child agents cannot run simultaneously under this session limit.

Verification outputs and the downloadable 24-image bundle are placed under `output/genshin-namecards-3/`. Use `node scripts/verify-genshin-artwork.mjs <bundled-node-packages-path> namecards-3` for exact dimensions, opacity, unique hashes and sample/dense schedule previews.

Local integration, Cloudinary upload, hosted catalog publication and deployment are separate operations. All 24 verified assets were uploaded with the scoped uploader and delivery metadata added; a follow-up dry run reported zero pending. Hosted catalog publication and deployment were not performed. Artwork PNGs and download ZIPs are ignored by the existing repository rules, so preserve the local files or bundle when moving this work between computers.

## Verification

- 24 unique opaque PNGs passed exact dimensions and SHA256 checks.
- 48 native Canvas previews cover sample and dense schedules in all three device formats. Sample schedules fit; the review sheets were visually inspected. Dense schedules may cover parts of the official decorative motifs, while retaining readable schedule panels.
- All eight definitions pass the existing published-template schema. The focused Genshin and Cloudinary tests pass, and lint passes for changed JavaScript files.
- The full test run passes 188 of 189 tests. The existing dense landscape-tablet layout assertion at `tests/wallpaper.test.js:432` still fails; this was already documented by the preceding artwork batch. No renderer changes are included here.
- Generation used four child agents total, with at most three active concurrently, plus parent-produced Iansan artwork.
- Production build passed, including SEO prerendering. Git diff whitespace validation passed.
