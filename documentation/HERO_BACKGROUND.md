# Hero and generated-asset provenance

## Current split hero assets

The latest hero uses two separately generated layers, following the user's supplied foreground and ambient-background prompts. The ambient scene fills the viewport; a transparent phone cutout is sized independently inside the layout. Website copy, logo and buttons are live HTML. The hero remains static. The foreground uses contain sizing with every phone visible; only the decorative background uses cover sizing.

| Asset | Source original | Web asset | Dimensions | Conversion |
| --- | --- | --- | --- | --- |
| Phone foreground | `output/imagegen/schedsnap/hero/hero-phones.png` | `public/images/hero/hero-phones.webp` | 1448 × 1086 | Lossless WebP, RGBA transparency preserved |
| Ambient background | `output/imagegen/schedsnap/hero/hero-ambient.png` | `public/images/hero/hero-ambient.webp` | 1672 × 941 | WebP quality 88 |

The phone edit target was the previous generated `hero-mobile.png`; the existing three phones, screen content and characters were retained while the surrounding studio background was removed. The user's white-background isolation request was adapted to genuine transparent output for compositing. Alpha spans 0–255 and all four corners are transparent. No Photoshop action was required: the built-in image-generation tool generated both assets.

Exact current prompts, original tool output paths and workspace paths are recorded in [layered-hero.json](../output/imagegen/schedsnap/layered-hero.json) and the active [asset manifest](../output/imagegen/schedsnap/prompts.json).

### Phone foreground prompt

Use case: product-mockup foreground cutout. Edit target: the supplied SchedSnap mobile hero image. Isolate the THREE existing modern smartphone mockups as a SINGLE centered transparent-background foreground asset. Preserve ALL THREE phones, their full silhouettes, relative scale and overlapping arrangement, metallic dark frames, angled navy bear on left, upright sunlit beige schedule phone in center, angled ivory panda on right, their Class Schedule screen titles and five weekday schedule pill rows, and cute character graphics. Remove the entire cream studio environment and ALL leaf shadows/background scenery around the phones. Genuinely transparent alpha outside the phones, including between silhouettes; no solid white/beige rectangle and no checkerboard baked into pixels. Retain only a delicate soft neutral-gray translucent contact shadow immediately below the phone group if possible. Full phones visible with tight but comfortable 5 percent transparent margin around the centered group; no wide empty left half. High-resolution premium photorealistic 3D studio render. No website text, web layout, logo, buttons, extra phones, objects, watermark or scenery. Output landscape 4:3. The user's isolated white studio prompt is adapted to transparent output for clean web compositing, preserving only text already present inside the phone screens.

### Ambient background prompt

Use case: architectural ambient website background layer. Minimalist warm ivory beige seamless architectural studio background with soft natural sunlight and subtle out-of-focus leaf shadows cast across a smooth matte surface. Clean creamy aesthetic, high resolution, soft focus, wide angle, completely EMPTY composition. Use a restrained light warm ivory palette around #faf6ef, quiet diffuse daylight, very faint warm leaf shadows mostly toward the upper right and lower right, left side nearly flat clear ivory for live website text. A smooth wall-to-floor transition without a distinct horizon line, no geometric arches or decorative props. No phones, no objects, no pedestals, no text, no letters, no buttons, no logos, no people, no website screenshot or layout, no watermark. Landscape 16:9 edge-to-edge image. This is ONLY an ambient background: the smartphones and all website typography will be layered separately in code.

## Dedicated mobile art direction

The original transparent three-phone foreground remains unchanged on all screen sizes. Four dedicated portrait collection assets vary between single and paired phones. An unused two-phone hero draft is retained in the manifest history and workspace PNGs, without a deployed file. Exact new prompts and paths are in [mobile-showcases.json](../output/imagegen/schedsnap/mobile-showcases.json); layout rules are in [MOBILE_SHOWCASES.md](MOBILE_SHOWCASES.md).

## Historical combined scenes

The former complete desktop scene and mobile composition remain available below as historical provenance. They are no longer used by Hero.jsx. Their original prompts have not been rewritten.


## Historical desktop hero

The original creamy three-phone studio scene was revised to reduce the phone group, then shift it slightly left and down. Live website text remains separate. The static full image uses contain sizing.

- Web asset: `public/images/archive/landing/hero-schedsnap-balanced.webp` (1672 × 941).
- Workspace original: `output/imagegen/schedsnap/archive/hero/hero-final.png`.
- Generated source: `C:/Users/picar/.codex/generated_images/01a10545-0bac-7bf3-8068-059100400688/exec-18ed1c29-0308-4498-b867-09701aa1be3a.png`.
- Conversion: WebP quality 88; original PNG retained.

### Exact final desktop generation prompt

Use case: product-mockup. Make a SMALL composition adjustment to this existing SchedSnap landscape hero background, preserving its 16:9 canvas. Keep the exact cream studio scene and ALL THREE existing phones, their current SMALL balanced size, schedule graphics, navy cream-bear / beige sunlight / ivory panda wallpapers, angles, and soft shadows. Move the entire phone group only slightly LEFT by 2 percent of canvas width, and DOWN by 2 percent of canvas height. Do not enlarge or shrink the group. Balance the empty space above and below the phones evenly, keeping ample breathing room. Keep left half clean empty cream for live website text. All phones fully visible. No other objects or text, no website UI, no watermark.

## Historical mobile hero

A dedicated centered three-phone composition avoids the desktop scene's empty left half. Hero.jsx selects it through a picture source at 640px and below. Between 641px and 1000px, the full desktop image still appears below copy.

- Web asset: `public/images/archive/landing/hero-schedsnap-mobile.webp` (1448 × 1086; 4:3).
- Workspace original: `output/imagegen/schedsnap/archive/hero/hero-mobile.png`.
- Generated source: `C:/Users/picar/.codex/generated_images/01a10545-0bac-7bf3-8068-059100400688/exec-e76a813e-6fff-40b3-ae77-dd91cff2ddad.png`.
- Conversion: WebP quality 88; original PNG retained.

### Exact mobile generation prompt

Use case: product-mockup. Generate a dedicated MOBILE HERO showcase asset from the attached SchedSnap three-phone background. Output landscape 4:3, NOT 16:9. Same clean warm creamy seamless studio environment and soft light. Same exact three class-schedule wallpaper phones: upright beige sunlight phone centered in foreground; navy cream-bear phone angled slightly behind on left; ivory panda phone angled slightly behind on right. Preserve their schedule titles, weekday pill rows, cute art and modern metallic dark frames. Recompose the phones as a centered group at x=50%, occupying about 78 percent of image width and 74 percent of image height, leaving comfortable balanced margins all around. The entire three phones must be visible without clipping. This image will appear BELOW live headline and buttons on a mobile website, so there should NOT be a wide empty left half. Soft restrained contact shadows under phones, matte cream background matching original, no horizon, no props, no outside text, no logo, no website screenshot or interface. Premium clean photoreal product shot, balanced centered mobile showcase.

## Current logo and collection images

The current manifest lists seven active assets: ambient background, original transparent phone foreground, logo and four shared portrait collection images. It also preserves earlier generations in history; this is not a count of all generation calls.

Exact prompts, generated source paths and workspace originals are recorded in [prompts.json](../output/imagegen/schedsnap/prompts.json) and [revisions.json](../output/imagegen/schedsnap/revisions.json). The transparent navy S logo uses lossless WebP. The four collection scenes use quality-88 WebP and were regenerated on pure white with soft neutral contact shadows to blend into the white page; their containers have no rounded card frame.

| Generated original | Web asset |
| --- | --- |
| `output/imagegen/schedsnap/brand/logo.png` | `public/brand/schedsnap-mark.webp` |
| `output/imagegen/schedsnap/archive/collections/little-friends-white.png` | `public/images/archive/collections/little-friends-white.webp` |
| `output/imagegen/schedsnap/archive/collections/mascot-white.png` | `public/images/archive/collections/mascot-white.webp` |
| `output/imagegen/schedsnap/archive/collections/pattern-white.png` | `public/images/archive/collections/pattern-white.webp` |
| `output/imagegen/schedsnap/archive/collections/original-white.png` | `public/images/archive/collections/original-white.webp` |

Collection scenes are illustrative marketing previews. Actual editor previews and downloads use the existing Canvas renderer and validated class data. The pre-existing `public/images/archive/landing/schedule-phone-preview.webp` remains a historical reference asset; its original prompt/provenance were not supplied and are not inferred.

## Historical SchedSnap generations

The following exact prompts and originals are retained for provenance; they are superseded by the current assets above.
### hero

Original: C:/Users/picar/Desktop/random_project/SchedSnap/output/imagegen/schedsnap/archive/hero/hero.png

Generated source: C:\Users\picar\.codex\generated_images\01a10545-0bac-7bf3-8068-059100400688\exec-cbc7c7e5-07da-4243-a692-79daadf81f4e.png

Exact prompt:

Use case: product-mockup. Edit target / composition reference: the attached three-phone class schedule image. Create a new polished wide 16:9 LANDSCAPE hero background for SchedSnap. Extend the reference into a warm creamy studio environment. The LEFT 48 PERCENT of the image must be entirely clean EMPTY warm ivory negative space, with no objects, phones, text, patterns or harsh shadows; this will hold website headline and buttons drawn separately. On the RIGHT HALF ONLY arrange the three realistic dimensional modern phones from the reference, large and elegant, slightly floating above a matte cream floor with soft physical shadows: upright sunlight-beige class schedule phone at center of the group, tilted midnight-navy cute hamster schedule phone behind on its left, tilted ivory panda schedule phone behind on its right. Closely preserve the wallpapers in the reference, their Class Schedule title, five neat weekday pill rows and cute animals; do not add decorative objects. All three phones entirely inside the frame with comfortable margins, group between x=53% and x=96%, and y=10% to y=90%. Realistic dark slim metallic edges, restrained natural reflections, soft warm diffused studio light, photoreal premium 3D product render. Quiet warm off-white #f7f3eb background with seamless floor, no visible horizon, no vignettes, no gray cast, no grain, no floating badges, no extra writing outside phones, no website mockup, no logo or watermark. The left is empty and flat creamy; the right is the dimensional product showcase.

### little-friends

Original: C:/Users/picar/Desktop/random_project/SchedSnap/output/imagegen/schedsnap/archive/collections/little-friends.png

Generated source: C:\Users\picar\.codex\generated_images\01a10545-0bac-7bf3-8068-059100400688\exec-60e679f3-73c7-4e7c-a5c8-c53481544da5.png

Exact prompt:

Use case: product-mockup. Asset type: SchedSnap Little Friends collection showcase image, wide 4:3 landscape. Input image 1 is the phone arrangement/product reference; any remaining input images are precise wallpaper artwork references. Generate a premium clean photoreal 3D studio product shot with THREE realistic modern slim phones arranged centrally, all entirely visible with generous 8% outer margin. Upright central phone in foreground, outer phones leaning slightly outward behind it, physical metallic edges and convincing screen perspective. Matte warm ivory creamy seamless studio background and floor, soft diffused daylight, soft offset floor shadows, no harsh gray background or horizon. Phones show Three soft pastel class-schedule wallpapers from the Little Friends collection: pink cream bunny, pale lilac blue-and-white sleepy kitten, powder blue small round white friend. Match the character art references faithfully, placing the cute character at the bottom of each wallpaper. Pastel pink, lilac and blue backgrounds, rounded white weekday schedule pills. Each screen has Class Schedule title and five clean weekday rows M, T, W, TH, F with small sample class codes/times/rooms, consistent readable layout like phone reference. Keep clock area above schedule open. No personal information, no desk objects, no badges, no text outside phone screens, no logo, no watermark. Make the actual wallpaper styles the centerpiece, harmonious colors, clean elegant composition matching the hero. This is one collection product image, not a website screenshot or contact sheet.

### mascot

Original: C:/Users/picar/Desktop/random_project/SchedSnap/output/imagegen/schedsnap/archive/collections/mascot.png

Generated source: C:\Users\picar\.codex\generated_images\01a10545-0bac-7bf3-8068-059100400688\exec-fcdfbd38-01f2-431d-958e-c85389aabab3.png

Exact prompt:

Use case: product-mockup. Asset type: SchedSnap Mascots collection showcase image, wide 4:3 landscape. Input image 1 is the phone arrangement/product reference; any remaining input images are precise wallpaper artwork references. Generate a premium clean photoreal 3D studio product shot with THREE realistic modern slim phones arranged centrally, all entirely visible with generous 8% outer margin. Upright central phone in foreground, outer phones leaning slightly outward behind it, physical metallic edges and convincing screen perspective. Matte warm ivory creamy seamless studio background and floor, soft diffused daylight, soft offset floor shadows, no harsh gray background or horizon. Phones show Three animal class-schedule wallpapers: midnight navy with a cute warm cream bear, ivory with a cute black-and-white panda, lilac with a cute cream purple-marked cat. Match the supplied animal art references, and place each mascot at the bottom. White or translucent weekday schedule pills. Each screen has Class Schedule title and five clean weekday rows M, T, W, TH, F with small sample class codes/times/rooms, consistent readable layout like phone reference. Keep clock area above schedule open. No personal information, no desk objects, no badges, no text outside phone screens, no logo, no watermark. Make the actual wallpaper styles the centerpiece, harmonious colors, clean elegant composition matching the hero. This is one collection product image, not a website screenshot or contact sheet.

### pattern

Original: C:/Users/picar/Desktop/random_project/SchedSnap/output/imagegen/schedsnap/archive/collections/pattern.png

Generated source: C:\Users\picar\.codex\generated_images\01a10545-0bac-7bf3-8068-059100400688\exec-92d3dcbb-4bd8-4bac-a150-75d0a1180325.png

Exact prompt:

Use case: product-mockup. Asset type: SchedSnap Patterns collection showcase image, wide 4:3 landscape. Input image 1 is the phone arrangement/product reference; any remaining input images are precise wallpaper artwork references. Generate a premium clean photoreal 3D studio product shot with THREE realistic modern slim phones arranged centrally, all entirely visible with generous 8% outer margin. Upright central phone in foreground, outer phones leaning slightly outward behind it, physical metallic edges and convincing screen perspective. Matte warm ivory creamy seamless studio background and floor, soft diffused daylight, soft offset floor shadows, no harsh gray background or horizon. Phones show Three graphic class-schedule wallpapers: warm cream and peach broad checkerboard, pale lavender with fine dots, muted light blue with soft wide vertical stripes. No animal or characters in this collection. Centered simple dark Class Schedule heading, separate off-white rounded schedule pills over the pattern backgrounds. Each screen has Class Schedule title and five clean weekday rows M, T, W, TH, F with small sample class codes/times/rooms, consistent readable layout like phone reference. Keep clock area above schedule open. No personal information, no desk objects, no badges, no text outside phone screens, no logo, no watermark. Make the actual wallpaper styles the centerpiece, harmonious colors, clean elegant composition matching the hero. This is one collection product image, not a website screenshot or contact sheet.

### original

Original: C:/Users/picar/Desktop/random_project/SchedSnap/output/imagegen/schedsnap/archive/collections/original.png

Generated source: C:\Users\picar\.codex\generated_images\01a10545-0bac-7bf3-8068-059100400688\exec-3d43b58a-dab9-447e-a947-e3499effbb06.png

Exact prompt:

Use case: product-mockup. Asset type: SchedSnap Originals collection showcase image, wide 4:3 landscape. Input image 1 is the phone arrangement/product reference; any remaining input images are precise wallpaper artwork references. Generate a premium clean photoreal 3D studio product shot with THREE realistic modern slim phones arranged centrally, all entirely visible with generous 8% outer margin. Upright central phone in foreground, outer phones leaning slightly outward behind it, physical metallic edges and convincing screen perspective. Matte warm ivory creamy seamless studio background and floor, soft diffused daylight, soft offset floor shadows, no harsh gray background or horizon. Phones show Three sophisticated class-schedule wallpapers: cream sunlit window-shadow wallpaper with natural botanical shadows, frosted blue glass wallpaper with soft optical reflections, restrained dark olive green wallpaper. Match attached background-art references. No animals or characters. Rounded softly translucent weekday schedule pills, white typography on darker wallpaper, charcoal on beige. Each screen has Class Schedule title and five clean weekday rows M, T, W, TH, F with small sample class codes/times/rooms, consistent readable layout like phone reference. Keep clock area above schedule open. No personal information, no desk objects, no badges, no text outside phone screens, no logo, no watermark. Make the actual wallpaper styles the centerpiece, harmonious colors, clean elegant composition matching the hero. This is one collection product image, not a website screenshot or contact sheet.

### hero-balanced

Original: C:/Users/picar/Desktop/random_project/SchedSnap/output/imagegen/schedsnap/archive/hero/hero-balanced.png

Generated source: C:/Users/picar/.codex/generated_images/01a10545-0bac-7bf3-8068-059100400688/exec-f9a49f55-70ae-4821-b546-eb5fda6de5d1.png

Exact prompt:

Use case: product-mockup. Edit the attached existing SchedSnap hero background. Keep the same landscape 16:9 aspect ratio, warm ivory cream seamless studio background, soft natural daylight, and the SAME three phone designs: navy cute cream bear schedule, sunlight beige schedule, ivory panda schedule. The current phones are MUCH TOO LARGE. Reduce the entire three-phone group to about 65 PERCENT of its current size, without zooming or cropping the canvas. Place the smaller three-phone arrangement entirely in the right portion: group bounds x=55% to x=91% of canvas width, y=23% to y=78% of canvas height. Phones centered near x=73%, y=50%; there must be generous cream space ABOVE, BELOW, and RIGHT of the phone group. Entire phones visible, natural slim edges, one central upright beige phone and two gently angled outer phones, same coherent shadows at the smaller scale. LEFT 52 PERCENT must stay empty and very clean for live website text, no objects or shadows behind copy. Preserve wallpaper characters, titles and neat five-row schedule graphics. Aim for balanced restrained product scale, quiet premium editorial landing-page composition, not a giant close-up. Soft matte cream floor blending into background, no horizon, no extra props, no writing outside phones, no website UI, no logo or watermark. Do not produce a website screenshot. Output ONLY the updated photographic hero background.

## Historical study-desk hero artwork

Historical asset: `public/images/archive/unitoolbox/hero-study-desk.png`. This image is retained as an unused artifact of the earlier UniToolbox landing page.

Generated with the built-in image generation tool for the UniToolbox landing page. The former page displayed it decoratively with a responsive white overlay for headline readability. It contains no student data, writing, logos, or claims. The original generation output remains unchanged.

### Exact historical generation prompt

Use case: photorealistic-natural. Asset type: full-width website hero background for UniToolbox, a practical university student tools website. Create a polished, photorealistic editorial photograph in a wide landscape 16:9 composition. Scene: a quiet sunlit university study desk beside a large window, warm white tabletop, a closed pale sage notebook, a small stack of ivory books, the edge of a silver laptop, and a simple pencil on the RIGHT THIRD only. Distant soft green foliage outside the window on the far right. The LEFT TWO THIRDS must be mostly empty bright warm-white desk and subtle out-of-focus light, calm negative space for dark headline text. Natural soft morning window shadows, real material detail, restrained white, ivory, sage and silver palette, airy and uncluttered. Camera at a gently elevated angle toward the desk and window, premium understated editorial composition. No people, no visible writing, no letters, no text, no logos, no watermark, no graphic shapes or UI. This is a background photograph, not a webpage mockup.
