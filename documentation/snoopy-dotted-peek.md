# Snoopy — Dotted Peek

## Additional device compositions

Generated separately with built-in ImageGen from the portrait master as a reference; no stretching or cropping of the phone master.

- Tablet raw output: `output/snoopy/masters/snoopy-dotted-peek/tablet-generated.png`; source `exec-90604a9e-4b06-457a-8a13-1622fc858fb3.png` in the same generator source directory listed below.
- Laptop raw output: `output/snoopy/masters/snoopy-dotted-peek/laptop-generated.png`; source `exec-6196cfc1-bdd5-45a5-9941-cb2f70e2e240.png` in the same generator source directory listed below.

### Tablet exact prompt

```text
Use case: illustration-story. Create a new opaque tablet portrait wallpaper, aspect ratio 5:8, 1600 × 2560 composition. Use the supplied master as reference for the same handmade slightly wobbly dry black ink Snoopy drawing and white tiny-dotted paper. Recompose for tablet: small Snoopy peeking in from far left at the bottom edge, his black floppy ears, head and little paws visible, entirely confined to bottom 25% of canvas and left 23%. All top 75% and center remain a quiet sparse dotted white paper field for a timetable. Tiny softly irregular hand-inked charcoal dots staggered over entire background with plenty of white between them. Match reference natural pen wobble and black hatching, no polished vector look, no added objects. Artwork only, no text, numbers, timetable, UI, logo, watermark, frame, color, gradients or shadows.
```

### Laptop exact prompt

```text
Use case: illustration-story. Create a new opaque laptop landscape wallpaper, aspect ratio 16:9, 1920 × 1080 composition. Use supplied master as reference for exactly the same handmade slightly wobbly dry black ink Snoopy drawing and white tiny-dotted paper. Recompose for laptop: very small Snoopy peeking in from far left near bottom edge, his black floppy ears, head and little paws visible, entirely confined to bottom 25% and left 15% of canvas. All top 75% and center remain a quiet sparse dotted white paper field for a timetable. Tiny softly irregular hand-inked charcoal dots staggered over entire background with plenty of white between them. Match reference natural pen wobble and black hatching, no polished vector look, no added objects. Artwork only, no text, numbers, timetable, UI, logo, watermark, frame, color, gradients or shadows.
```

- Generator: built-in `image_gen.imagegen`; opaque PNG.
- Reference: user attachment #1, `codex-clipboard-bbedf517-1edf-4cd0-9087-dafbd929b270.png` (style/composition reference).
- Source output: `C:/Users/Administrator/.codex/generated_images/01a141e6-340e-7931-9702-be7ca0b484dc/exec-f04af618-458e-42fc-ba64-22132e64f48d.png`.
- Project master: `output/snoopy/masters/snoopy-dotted-peek/master.png`.
- Intent: one portrait master, hand-inked Snoopy at lower left and dotted paper, with space for the timetable.

## Exact generation prompt

```text
Use case: illustration-story
Asset type: opaque full-bleed portrait wallpaper for a timetable app, 1080 × 2400 composition.
Primary request: Reimagine the supplied reference as a tall portrait wallpaper, preserving its handmade visual style accurately.
Input image: reference image only, not an edit target.
Scene/backdrop: white paper covered by tiny charcoal black hand-inked dots in a softly staggered regular pattern, generous white space between dots.
Subject: recognizable Snoopy peeking in from the left edge near the lower-left corner, only part of his head, floppy black ears and a little paw visible, as in the reference. His muzzle points toward the quiet center. Place all character artwork in the bottom 23 percent and left 26 percent of the canvas.
Style/medium: charming imperfect hand-drawn black ink on white paper; slightly wobbly contour, dry ink irregularities, loose black hatching in ears, simple oval eyes and nose. Match the reference line weight, restrained black-and-white palette and playful handmade feeling closely.
Composition/framing: vertical portrait only, large quiet center and upper field for a schedule; dots remain small, sparse and unobtrusive throughout. Snoopy is intentionally partly cropped by the left edge.
Constraints: artwork only, opaque background, no text, no schedule, no numbers, no UI, no logo, no watermark, no device frame, no color, no gradients, no 3D, no polished vector smoothness.
```
