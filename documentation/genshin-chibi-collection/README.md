# Elemental Chibi Collection

24 artwork-only PNGs: eight characters, each independently composed for mobile (1080 × 2400), portrait tablet (1600 × 2560), and laptop (1920 × 1080). Final files are `public/wallpapers/scenic/genshin-chibi-<character>/<device>.png`.

The user's revised direction supersedes the original ornate drafts: simple muted backgrounds, small outlined sticker chibis, and smoothly integrated tonal elemental emblems. The attached phone previews are visual inspiration, not copied timetable artwork. PNGs contain no schedule, clock, labels, or device frame.

`templates.json` contains eight schema-validated draft template definitions. Local Vite previews load `src/assets/genshinElementalTemplates.js`; the family retains `verticalPosition: 100` in gallery previews to clear the chibis. The shared schedule layout is unchanged. These are local previews, not published shared catalog records. Dense schedules still require checking before publication.

Built-in ImageGen generated every composition. The user explicitly approved local resizing after the generator returned smaller dimensions. Pillow ImageOps.fit with LANCZOS produces exact opaque RGB exports; source generations are preserved in `output/genshin-simple/sources/`. Upscaling does not add original detail.

Exact prompts and source provenance are in `wind-moon.json`, `fire-stone.md`, `storm-water.md`, and `ice-forest.md`. The final inspection manifest is `output/genshin-simple/manifest.json`; it records dimensions, opacity, and SHA256 for all 24 PNGs. `output/genshin-simple/collection-preview.png` shows mobile and laptop compositions.

Character/style reference research:

- Official Paimon's Paintings: https://ys.mihoyo.com/main/m/news/detail/26543
- Official chibi emoji collection: https://www.hoyolab.com/article/32879498
- Licensed chibi character silhouettes: https://www.goodsmile.com/en/product/1139822/Wondrous+Travels+Series+Venti+Zhongli+Raiden+Shogun+Nahida+Furina+Mavuika
- Official Columbina Hydro confirmation: https://www.hoyoverse.com/en-us/news/162178

Online material informed the references; these are generated illustrations, not downloaded official character cutouts. Tsaritsa is an interpretive fan concept and is not represented as a verified official appearance. Generated elemental motifs are stylized approximations.

The subsequent local integration added the collection to Vite's preview-only catalog and preserved its schedule placement in gallery thumbnails. Its 198 tests and build passed. No shared catalog records, uploads, or deployment were changed.

## Subtle namecard revision

All 24 wallpapers now include faint namecard-inspired edge/top decoration. The existing chibis, palettes and elemental emblems were retained visually. Built-in ImageGen edits used each original wallpaper plus its downloaded namecard reference; exact prompts are in `namecard-*.md` and `namecard-wind-moon.json`. Tsaritsa uses interpretive frost filigree, not a claimed official namecard. Original backgrounds are preserved in `output/genshin-simple/pre-namecard/`; new generated sources are in `output/genshin-simple/namecard-sources/`. Requested contrast percentages are visual targets, not measured guarantees. All final exact dimensions and RGB opacity were rechecked; the local sample schedule preview was inspected and saved as `output/genshin-simple/namecard-local-preview.png`. Dense schedules were not rechecked for this artwork-only revision.
