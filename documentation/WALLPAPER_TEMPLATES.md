# Mobile wallpaper collection

The collection has 42 presets: 20 mascot editions, six native pattern templates, and the 16 original styles that replaced the previous eight palette-based templates. Export is 1080 × 2400 portrait. Artwork contains no schedule information: the Canvas renderer supplies weekdays, times, subjects, and optional course codes and rooms from the current editor state. Only the preset heading appears; there is no custom title input. Choosing, reviewing, and downloading remain the three workflow steps.

## Mascot editions

The table follows `src/assets/mascotTemplates.js`. Palettes and animals vary; all 42 templates share the same DM Sans Class Schedule title and timetable presentation.

| Edition | Template | Animal | Palette | Footer side |
| --- | --- | --- | --- | --- |
| 01 | Bear Mode | Bear | Midnight navy | Left |
| 02 | Bunny Bloom | Bunny | Blush | Right |
| 03 | Daily Panda | Panda | Ivory & charcoal | Left |
| 04 | Lilac Cat | Cat | Lilac & cream | Right |
| 05 | Good Day Dog | Dog | Oat & caramel | Left |
| 06 | Fox Club | Fox | Rust | Right |
| 07 | Tiger Team | Tiger | Peach | Left |
| 08 | Golden Lion | Lion | Golden oat | Right |
| 09 | Koala Calm | Koala | Sage | Left |
| 10 | Otter Hours | Otter | Deep teal & cream | Right |
| 11 | Blue Penguin | Penguin | Sky blue & navy | Left |
| 12 | Owl Notes | Owl | Lavender | Right |
| 13 | Duck Days | Duck | Forest & butter | Left |
| 14 | Butter Chick | Chick | Butter | Right |
| 15 | Frog Focus | Frog | Fresh sage & pine | Left |
| 16 | Turtle Pace | Turtle | Deep pine & mint | Right |
| 17 | Capybara Club | Capybara | Sand | Left |
| 18 | Peach Hamster | Hamster | Soft peach | Right |
| 19 | Seal Study | Seal | Glacier blue | Left |
| 20 | Whale Week | Whale | Inky blue & periwinkle | Right |

Each generated asset is only a transparent animal cutout in `public/wallpapers/mascots/<animal>.png`. Canvas paints the uniform background and supplies headings, edition labels, and the actual timetable. No weekday, number of meetings, subject, student information, or edition text is baked into the art. Actual schedules preserve all meetings, skip empty days, and grow each day's card around wrapped subjects and details. Body type is fitted from 42px down to 28px. Mascot occupied alpha bounds normalize to a fixed 620px longest edge without changing the PNG; the schedule reserves the footer and blocks export if it still cannot fit.

The shared title is Class Schedule, 100px DM Sans weight 750, at (78, 350). Day cards begin at y460 with 22px corners and 16px gaps. Circular M, T, W, TH, F badges stay vertically centered for any meeting count. Times read 7:00 AM–10:00 AM, include minutes, and center beside each meeting's existing subject/details block. All templates share the same columns, with internal separators and 14px gaps between meetings. Mascot schedules end by y1740; animal art begins at y1780 or below. Historical heading and row-style fields in preset data are unused.

The cutouts were generated through built-in ImageGen using the supplied [IP as Logo skill](https://github.com/s1dashu/ip-as-logo-skill) as simplification guidance, adapted to transparent assets for flexible timetables. Prompts request flat solid colors, large rounded shapes, and no baked text. Some outputs retain subtle interior shading despite that constraint; this is an incidental output limitation rather than an intended style rule.

Exact prompts, source paths, dimensions, colors, and provider provenance are recorded in:

- [Mascot assets A](mascot-assets-a.json): bear, bunny, panda, cat, dog, fox, tiger.
- [Mascot assets B](mascot-assets-b.json): lion, koala, otter, penguin, owl, duck, chick.
- [Mascot assets C](mascot-assets-c.json): frog, turtle, capybara, hamster, seal, whale.

## Patterns & prints

Six templates in `src/assets/patternTemplates.js` use native geometry instead of image backgrounds: Checker Study, Dot Notes, Stripe Club, Diamond Days, Wave Week and Notebook Hours. Their background and pattern colors are independent controls. They retain the same code/subject/room hierarchy and actual schedule renderer. Full image-backed original backgrounds cannot be recolored, so their background picker is hidden; container, text, separator and font controls remain available.

## Original collection

| Template | Character |
| --- | --- |
| Window Light | Real window shadows with a flowing script heading |
| Blue Hour | Frosted blue glass, bold type, circular day badges |
| Olive Script | Olive poster with oversized sans and script lettering |
| Blush Club | Pink checkerboard, chrome star, light timetable panel |
| Linen Letter | Cream editorial stationery with simple rules |
| Violet Notes | Lilac graph-paper notebook and serif type |
| Mono Print | Black/white editorial typography and ruled rows |
| Sunset Study | Peach sunset colors and script typography |
| Green Room | Forest green, italic serif, circular badges |
| Candy Check | Pastel checkerboard and a neutral timetable panel |
| After Hours | Inky glass background with editorial lettering |
| Mint Journal | Mint ruled notebook with clean tiles |
| Clay Studio | Terracotta graphic poster |
| Cloud Nine | Periwinkle color fields and strong weekly lettering |
| Butter Check | Butter-yellow checks with a script heading |
| Rose Letter | Rose stationery with burgundy serif type |

Gallery and modal previews show Monday–Friday with one neutral Subject name and example time each. Uploaded or manually entered data replaces these examples in the final preview and PNG, preserving actual meeting counts and subjects. Fonts and artwork load before drawing and are cached. Gallery canvases load art near the viewport using IntersectionObserver with a 400px margin and render at 270 × 600; the final PNG renders at full resolution. The automated suite has 23 passing tests, including centered day badges and times with one or three meetings, all 42 templates, long subjects, 15 meetings, fixed mascot size, and real RGBA assets. Lint and production build pass. Latest actual-data capture: `documentation/previews/mascot-clean-actual.jpg`.

## Background artwork

### Editable appearance and class hierarchy

Each meeting centers a large bold course code above a smaller subject name; room text is separate on the right. Missing codes use the subject as the main label. Long codes, subjects, rooms and date details wrap without losing information. Gallery examples include CLASS 101, Subject name and Room 101, one meeting per weekday.

The template modal has a left appearance panel on desktop and collapsible controls on phones. Background, day-container, text and separator colors offer swatches and a custom picker. Font choices are DM Sans, DM Serif Display and Georgia. Changes are drafts until Use template; close discards edits and Reset appearance restores the preset. Applied settings are retained separately for each template in page memory and used by gallery cards, actual previews and PNG exports. Existing schedules appear in the template modal instead of example classes. Image backgrounds stay fixed; native patterns and mascot backgrounds have editable colors. The full suite now contains 23 passing tests, including code hierarchy and appearance rendering.

Original background art was generated with the built-in ImageGen tool, then copied into the repository. Original outputs are preserved under the Codex generated-images folder. The three original background assets are:

- `public/wallpapers/window-light.png`
- `public/wallpapers/blue-glass.png`
- `public/wallpapers/pink-check.png`

Other original backgrounds are native Canvas patterns or flat colors. The two additional fonts are locally hosted Fontsource packages, DM Serif Display and Great Vibes. Mascot background colors are uniform Canvas fills; transparent cutouts are not full wallpaper backgrounds.

## Exact generation prompts

### window

Use case: photorealistic-natural. Create a finished portrait smartphone wallpaper BACKGROUND ONLY, 1080:2400 aspect ratio. Editorial photo of a pale warm gray plaster wall with soft natural sunlight and broad diagonal window-frame shadows falling across the wall, cool cream highlights, warm gray shadow, subtly tactile real plaster, calm minimalist morning light. Main center area has gentle even brightness suitable for later overlaying a student timetable. No physical window visible, no furniture, no people. Absolutely NO words, letters, numbers, schedules, UI, panels, logos or watermark. Edge to edge.

### blue

Use case: stylized-concept. Create a finished portrait smartphone wallpaper BACKGROUND ONLY, 1080:2400 aspect ratio. Atmospheric abstract blue frosted glass photograph/render, soft slate-blue and desaturated navy light with an unfocused translucent blue sculptural arc along the left edge, softly blurred glass forms with natural light and no hard edges. Medium-dark blue tone across center for later overlay of white schedule typography. Elegant contemporary editorial wallpaper, quiet and spacious, subtle dimensional material. Absolutely NO words, letters, numbers, schedules, UI, panels, logos or watermark. Edge to edge.

### pink

Use case: stylized-concept. Create a finished portrait smartphone wallpaper BACKGROUND ONLY, 1080:2400 aspect ratio. Playful softly warped large checkerboard of blush pink and light peach, matte paper texture. One small sculptural puffy five-point chrome star with soft pink reflections at the upper right edge around 26 percent down, star is shiny three-dimensional with rounded inflated edges. Keep the entire central 80 percent of the wallpaper otherwise clear of objects so a generic student timetable can be overlaid later. No central panel; just the background and corner star. Absolutely NO words, letters, numbers, schedules, UI, panels, logos or watermark. Edge to edge.
