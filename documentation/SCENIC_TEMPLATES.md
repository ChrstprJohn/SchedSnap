# Scenery & stationery

Three original imagegen families, with nine independently generated backgrounds.
Artwork: public/wallpapers/scenic/<theme>/<device>.png.
Definitions: src/assets/scenicTemplates.js.

| Theme | Mobile | Tablet | Laptop |
| --- | --- | --- | --- |
| Tropical Margin | 9:20 portrait | 3:4 portrait | 16:9 landscape |
| Paper Notes | 9:20 portrait | 3:4 portrait | 16:9 landscape |
| Mountain Dawn | 9:20 portrait | 3:4 portrait | 16:9 landscape |

These are background assets, not finished data-bearing wallpapers. The existing renderer adds actual class details and opaque white day cards. Future attendance features should use live text or cards, never baked-in image data. No attendance tracking feature is implemented by this asset pack.

The asset loader selects deviceImages by resolution.id; image remains the mobile fallback. Export resolutions are 1080 x 2400, 1536 x 2048 and 1920 x 1080. Source image dimensions may differ; the renderer scales to cover. Tablet artwork is designed for portrait; landscape uses a crop.

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
