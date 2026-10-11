# Illustrated templates

55 original variants across 13 themes, with 165 separate device compositions.
The eight newer reference families contain five variants each. Tropical botanicals,
paper & stationery, mountain dawn, blossom clouds and colorful paper contours contain
three each. Rejected kittens and masked heroes are excluded; square masters were removed.
Artwork: public/wallpapers/scenic/<theme>/<device>.png.
Definitions: src/assets/scenicTemplates.js.

## Asset contract and verification

The full catalogue contains 113 templates. Its 55 illustrated variants provide
165 independent background files, one for each device below. The other 58 templates
combine 40 shared transparent character cutouts and 18 code-drawn presets with the
device-aware Canvas renderer. Their mobile, tablet and laptop exports do not require
duplicate cutout bitmaps: the renderer positions the same transparent artwork within
each device's layout.

Cloudinary contains all 205 referenced image assets (165 backgrounds and 40 cutouts).
The final asset audit matched every local content hash and pixel dimension to its
Cloudinary record, with zero uploads pending. The generated-art pack contains no
rejected kitten or masked-hero variants, and no square master files.
The 27 previously uploaded 1536 × 2048 tablet copies were removed with CDN
invalidation requested after checking that each had a current 1600 × 2560
replacement. The remote scenic folder now contains exactly 165 current files.

Validation: 60 tests pass; the production build and lint checks for the changed
implementation files pass. The completed browser audit rendered and exported all
113 templates at all three device sizes: 339 successful exports, covering the 165
illustrated backgrounds and 174 other template exports, with zero errors. The
[verification report](../.impeccable/review/scenic/verification.json) records the
device dimensions, renderer results and all 13 illustrated families.

| Device | Final asset size | Composition |
| --- | --- | --- |
| Mobile | 1080 × 2400 | 9:20 portrait |
| Tablet | 1600 × 2560 | 5:8 portrait |
| Laptop | 1920 × 1080 | 16:9 landscape |

These are background assets, not finished data-bearing wallpapers. The existing renderer adds actual class details and opaque white day cards. Future attendance features should use live text or cards, never baked-in image data. No attendance tracking feature is implemented by this asset pack.

The asset loader selects deviceImages by resolution.id; image remains the mobile fallback.
Each file is a separately generated aspect-specific composition, then resampled to its
exact final export pixels. Wrong-aspect mobile outputs were regenerated with taller sky,
rather than cropping off their illustration. Tablet artwork is designed for portrait;
the existing optional tablet landscape control uses the shared renderer's cover crop.

Illustrated collection and theme filters use pills. The same Canvas renderer supplies
actual class data to gallery examples, modal previews and downloads. Each theme has a
stable ID, palette, and device-image map in scenicTemplates.js. Folder paths follow
public/wallpapers/scenic/<variant-id>/{mobile,tablet,laptop}.png.

## Prompt archives and maintenance

Final tablet compositions use 5:8. Earlier 3:4 tablet prompts below and in the
archives are superseded by root-tablet-corrections.json,
meadow-tablet-corrections.json and moon-tablet-corrections.json. These edits
extend quiet sky or paper while retaining the original footer artwork.

- SCENIC_ROOT_PROMPTS.md: botanicals, stationery, mountains, clouds and colorful contours.
- BLUE_CONTOURS_PROMPTS.md: blue abstract waves and comic graphics.
- MEADOW_SKIES_PROMPTS.md: floral skies, alpine landscapes and illustrated adventures.
- MOONLIT_BLOSSOMS_PROMPTS.md: moonlit blossoms, sunset travelers and cozy city.
- meadow-mobile-corrections.json: exact prompts and provenance of the four aspect corrections.

All were generated with the built-in imagegen tool. Earlier square prompts in the archives
are source history, not delivered device assets. The four scenic-*.json manifests provide
reusable palettes and IDs; the source module is assembled from them after all devices exist.
Run node development/scenic-assets.cjs --normalize --assemble to validate ratios, standardize
pixels and rebuild the definitions. It refuses incomplete device sets and wrong aspect ratios.
Run node development/verify-scenic.cjs with the foreground local dev server running to capture
all 165 wallpapers with real sample classes and the gallery at phone, tablet and laptop widths.

Keep decorations at the edges/footer and retain the high-opacity day-card surface for legibility with dense schedules. Uploaded student details must stay outside artwork and saved generation prompts.

Generated using the built-in imagegen tool. References provided by the user informed mood and composition only; no screenshot UI, wording or watermarks were reused.

## Final prompts

### tropical-margin / mobile

Use case: productivity-visual. Asset type: reusable portrait 9:20 mobile class schedule wallpaper background. Original elegant flat botanical illustration inspired by tropical leaf references: deep teal monstera, sage palm fronds, tiny coral flowers limited to lower corners and a very thin top corner accent. Warm ivory plain background. No birds. Composition: portrait 9:20, edge to edge standalone artwork. Keep middle 80 percent of width and top 78 percent of height extremely quiet, pale and empty for a live class timetable and future attendance data drawn by application. Decorative art stays at margins and footer. No text, no lettering, no timetable, no cells, no fake data, no devices, no UI, no logos, no watermark. Polished restrained illustration, original artwork rather than copying reference. Generate one image only.

### tropical-margin / tablet

Use case: productivity-visual. Asset type: reusable portrait 3:4 tablet class schedule wallpaper background. Original elegant flat botanical illustration inspired by tropical leaf references: deep teal monstera, sage palm fronds, tiny coral flowers limited to lower corners and a very thin top corner accent. Warm ivory plain background. No birds. Composition: portrait 3:4, edge to edge standalone artwork. Keep middle 80 percent of width and top 78 percent of height extremely quiet, pale and empty for a live class timetable and future attendance data drawn by application. Decorative art stays at margins and footer. No text, no lettering, no timetable, no cells, no fake data, no devices, no UI, no logos, no watermark. Polished restrained illustration, original artwork rather than copying reference. Generate one image only.

### tropical-margin / laptop

Use case: productivity-visual. Asset type: reusable landscape 16:9 laptop class schedule wallpaper background. Original elegant flat botanical illustration inspired by tropical leaf references: deep teal monstera, sage palm fronds, tiny coral flowers limited to lower corners and a very thin top corner accent. Warm ivory plain background. No birds. Composition: landscape 16:9, edge to edge standalone artwork. Keep middle 80 percent of width and top 78 percent of height extremely quiet, pale and empty for a live class timetable and future attendance data drawn by application. Decorative art stays at margins and footer. No text, no lettering, no timetable, no cells, no fake data, no devices, no UI, no logos, no watermark. Polished restrained illustration, original artwork rather than copying reference. Generate one image only.

### paper-notes / mobile

Use case: productivity-visual. Asset type: reusable portrait 9:20 mobile class schedule wallpaper background. Original tactile paper collage illustration inspired by stationery reference: pale powder blue paper, cream torn paper scraps, muted blush washi tape, two small blue paperclips clustered only in bottom right and a tiny top left corner. Very subtle paper grain. Composition: portrait 9:20, edge to edge standalone artwork. Keep middle 80 percent of width and top 78 percent of height extremely quiet, pale and empty for a live class timetable and future attendance data drawn by application. Decorative art stays at margins and footer. No text, no lettering, no timetable, no cells, no fake data, no devices, no UI, no logos, no watermark. Polished restrained illustration, original artwork rather than copying reference. Generate one image only.

### paper-notes / tablet

Use case: productivity-visual. Asset type: reusable portrait 3:4 tablet class schedule wallpaper background. Original tactile paper collage illustration inspired by stationery reference: pale powder blue paper, cream torn paper scraps, muted blush washi tape, two small blue paperclips clustered only in bottom right and a tiny top left corner. Very subtle paper grain. Composition: portrait 3:4, edge to edge standalone artwork. Keep middle 80 percent of width and top 78 percent of height extremely quiet, pale and empty for a live class timetable and future attendance data drawn by application. Decorative art stays at margins and footer. No text, no lettering, no timetable, no cells, no fake data, no devices, no UI, no logos, no watermark. Polished restrained illustration, original artwork rather than copying reference. Generate one image only.

### paper-notes / laptop

Use case: productivity-visual. Asset type: reusable landscape 16:9 laptop class schedule wallpaper background. Original tactile paper collage illustration inspired by stationery reference: pale powder blue paper, cream torn paper scraps, muted blush washi tape, two small blue paperclips clustered only in bottom right and a tiny top left corner. Very subtle paper grain. Composition: landscape 16:9, edge to edge standalone artwork. Keep middle 80 percent of width and top 78 percent of height extremely quiet, pale and empty for a live class timetable and future attendance data drawn by application. Decorative art stays at margins and footer. No text, no lettering, no timetable, no cells, no fake data, no devices, no UI, no logos, no watermark. Polished restrained illustration, original artwork rather than copying reference. Generate one image only.

### mountain-dawn / mobile

Use case: productivity-visual. Asset type: reusable portrait 9:20 mobile class schedule wallpaper background. Original refined flat landscape illustration inspired by mountain reference: spacious very pale peach dawn sky occupying top 80 percent, overlapping slate blue and deep teal mountain silhouettes confined to bottom 20 percent with tiny pine silhouettes at bottom corners. Gentle atmospheric depth. Composition: portrait 9:20, edge to edge standalone artwork. Keep middle 80 percent of width and top 78 percent of height extremely quiet, pale and empty for a live class timetable and future attendance data drawn by application. Decorative art stays at margins and footer. No text, no lettering, no timetable, no cells, no fake data, no devices, no UI, no logos, no watermark. Polished restrained illustration, original artwork rather than copying reference. Generate one image only.

### mountain-dawn / tablet

Use case: productivity-visual. Asset type: reusable portrait 3:4 tablet class schedule wallpaper background. Original refined flat landscape illustration inspired by mountain reference: spacious very pale peach dawn sky occupying top 80 percent, overlapping slate blue and deep teal mountain silhouettes confined to bottom 20 percent with tiny pine silhouettes at bottom corners. Gentle atmospheric depth. Composition: portrait 3:4, edge to edge standalone artwork. Keep middle 80 percent of width and top 78 percent of height extremely quiet, pale and empty for a live class timetable and future attendance data drawn by application. Decorative art stays at margins and footer. No text, no lettering, no timetable, no cells, no fake data, no devices, no UI, no logos, no watermark. Polished restrained illustration, original artwork rather than copying reference. Generate one image only.

### mountain-dawn / laptop

Use case: productivity-visual. Asset type: reusable landscape 16:9 laptop class schedule wallpaper background. Original refined flat landscape illustration inspired by mountain reference: spacious very pale peach dawn sky occupying top 80 percent, overlapping slate blue and deep teal mountain silhouettes confined to bottom 20 percent with tiny pine silhouettes at bottom corners. Gentle atmospheric depth. Composition: landscape 16:9, edge to edge standalone artwork. Keep middle 80 percent of width and top 78 percent of height extremely quiet, pale and empty for a live class timetable and future attendance data drawn by application. Decorative art stays at margins and footer. No text, no lettering, no timetable, no cells, no fake data, no devices, no UI, no logos, no watermark. Polished restrained illustration, original artwork rather than copying reference. Generate one image only.
