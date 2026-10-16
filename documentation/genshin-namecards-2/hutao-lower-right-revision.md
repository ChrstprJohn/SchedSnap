# Hu Tao lower-right ghost revision

Revised Hu Tao · Spirit Soother on 2026-10-16 using built-in imagegen, with the existing device artwork as the edit target and the official namecard as reference: https://enka.network/ui/UI_NameCardPic_Hutao_P.png.

Prompt direction: preserve the official simple smiling ghost silhouette, warm muted brown-orange palette, flat artwork, plum branches and flame butterflies; relocate the entire ghost into the lower-right corner so the central timetable does not obscure its face. No redesign, text, UI or new characters. Portrait target bounds: mobile x=65–94%, y=77–94%; tablet x=66–94%, y=78–95%. Landscape target bounds: x=77–96%, y=59–94%. These are prompt targets, not measured output bounds.

Native outputs and previous versions are preserved in `output/hutao-namecard-revision/`. Export normalization uses bicubic scaling without cropping and opaque RGB PNG output. Final project assets:

- `public/wallpapers/scenic/genshin-card-hutao-spirit/mobile.png` (1080 × 2400)
- `public/wallpapers/scenic/genshin-card-hutao-spirit/tablet.png` (1600 × 2560)
- `public/wallpapers/scenic/genshin-card-hutao-spirit/laptop.png` (1920 × 1080)

Only these three delivery mappings were replaced in `src/assets/cloudinaryManifest.js`. The existing scoped uploader stored immutable hash-named assets; earlier uploads remain available. No shared catalog record or schedule settings were modified.

Validation: all three compositions visually inspected; exact export dimensions and opaque RGB checked; delivery PNG hashes matched local exports; 14 focused Genshin and Cloudinary tests passed. Schedule-overlay browser inspection was not performed.
