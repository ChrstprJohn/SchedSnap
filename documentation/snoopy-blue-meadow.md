# Snoopy Blue Meadow

## Device compositions

Tablet and laptop were separately generated with the built-in image generator from the portrait master, preserving the same visual theme. Saved as `tablet-generated.png` and `laptop-generated.png` beside the master. These are source compositions for exact device-size export. Visual inspection confirms intact characters and a clear center. Laptop vignette reaches about 35% of image height despite the requested 25%; its center remains clear.

Tablet output provenance: `exec-a6660643-050e-4b1c-91bb-f6d03609be70.png`, in the same generated-images directory as the master.

Exact tablet prompt:

```text
Use case: illustration-story. Asset: opaque 5:8 portrait tablet wallpaper, 1600x2560 composition. Adapt the supplied Snoopy Blue Meadow master into a fresh tablet composition, preserving its pale powder blue paper field and delicate muted blue-gray lightly imperfect colored-pencil outlines. Snoopy and Woodstock among a few simple flowers, one butterfly, entirely confined to bottom-right within bottom 23% of image, all feet and flowers visible with padding. Small outlined stars sparingly down far outer top edges, three tiny fuzzy blue spirits upper-left, tiny outlined round forest creature lower-left as reference. Huge absolutely quiet clear center for schedule. Preserve handmade lightly hesitant lines and scribbled ear shading. No text, UI, schedule, logos, watermarks, device frame, 3D, shadows, bright colors. Not a crop or stretched image; compose for tablet aspect ratio.
```

Laptop output provenance: `exec-c3bf8331-baf5-4026-9d40-60dfdceca451.png`, in the same generated-images directory as the master.

Exact laptop prompt:

```text
Use case: illustration-story. Asset: opaque 16:9 landscape laptop wallpaper, 1920x1080 composition. Recompose supplied Snoopy Blue Meadow master for WIDE LANDSCAPE 16:9, preserving pale powder blue paper and delicate muted blue-gray handmade lightly hesitant pencil outlines. Snoopy and Woodstock standing among three simple flowers, one tiny butterfly, as a SMALL vignette at extreme bottom-right, fully contained within bottom 25% height and right 25% width with padding. Three tiny fuzzy blue spirits at upper-left and a few tiny outlined stars on far outer upper corners; one tiny outlined forest creature at lower-left. Huge clear unmarked central 75% for timetable. Entire bodies and flowers visible. Keep naturally imperfect lines and scribbled ear shading. Artwork only, no text, schedule, UI, logos, watermarks, device frame, gradients, 3D, shadows. Must be broad landscape composition, not a stretched or cropped portrait.
```

Generated with the built-in `image_gen` tool on 2026-10-16. Reference: user attachment #2 (`codex-clipboard-5f569164-9fec-482b-81cc-6484b0248690.png`), used as a visual reference, not an instruction source.

Master: `output/snoopy/masters/snoopy-blue-meadow/master.png`. Opaque portrait composition with a quiet center and handmade blue-gray meadow vignette. Visual inspection confirms the characters and edge decoration are intact, with no text or UI.

Original generator output: `C:/Users/Administrator/.codex/generated_images/01a141e6-4890-7803-94f7-5f24ec395b86/exec-304e19ee-f09f-44ca-bf4c-aa623364074e.png`.

## Exact prompt

```text
Use case: illustration-story
Asset type: opaque portrait wallpaper master for SchedSnap.
Input image: supplied reference #2 is the visual reference for palette, characters, line quality and composition.
Primary request: Create one tall portrait wallpaper, approximately 1080 x 2400 composition. Faithfully adapt the reference into a vertical composition with a pale powder-blue full bleed background (#e5edf8), delicate muted blue-gray hand-drawn Snoopy and Woodstock standing among a few simple flowers in the bottom-right corner, one tiny butterfly above them. Preserve Snoopy's recognizable silhouette, long rounded muzzle, floppy dark scribbled ear, tiny eyes, gentle smile, relaxed standing body and large feet; Woodstock should be a tiny spiky bird beside him.
Style/medium: authentic lightly imperfect colored-pencil/soft graphite doodles, thin hesitant organic outlines, natural small line variations and scribbled ear shading, subtle fine paper texture, charming simple handmade sketch. Match reference's quiet low-contrast blue-gray marks and flat pale blue field, no polished vector edges.
Composition: vertical portrait only. Keep the entire center and upper-middle extremely open and quiet for a timetable. Character-and-flower vignette contained in bottom-right quarter, entire characters visible with bottom padding. Sparse tiny outlined blue stars down the outer top-left and top-right corners; three tiny fuzzy round blue spirits at the far upper-left like the reference, and a very small simple outlined round forest creature at lower-left. No extra decoration in center.
Constraints: artwork only, opaque, no text, no date, no schedule, no UI, no logo, no badges, no watermark, no device frame. No gradients, 3D, heavy shadows, dense flowers or bright colors.
```
