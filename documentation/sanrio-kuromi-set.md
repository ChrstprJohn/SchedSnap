# Four Kuromi reference designs

Exactly one design is generated from each supplied reference:

- Kuromi Claw: lavender claw machine, miniature Kuromi dolls, pink pillows and bows.
- Kuromi Grey Grid: grey Kuromi head motifs, stars and circles on graph paper.
- Kuromi Flower: a winking Kuromi holding pastel flowers on cool lavender paper.
- Kuromi Cozy: Kuromi and Baku resting on a lace mat over cream and lavender gingham.

There are twelve device assets: each design has its own mobile (1080×2400), portrait tablet (1600×2560), and laptop (1920×1080) composition. The built-in image generator redraws the references' style and subjects. No additional theme variants are created, and portrait artwork is not stretched to landscape.

The finish is deliberately gentle and hand drawn: faint pencil and paper texture, slight natural variation in line pressure, and soft flat color. Character expressions, props, and composition are retained. This supersedes the earlier emphasis on enhanced crispness; the original generated masters are preserved alongside the revised artwork.

Prompt and source provenance is recorded in `sanrio-kuromi-prompts.json`. Final opaque PNGs are stored under `public/wallpapers/scenic/sanrio-kuromi-*/`; originals remain under `output/sanrio/kuromi/`. These images follow the repository's existing ignore policy. Uploaded public metadata is recorded in `src/assets/cloudinaryManifest.js`.

The four presets belong to Sanrio and inherit white frosted-glass pill containers. Laptop schedules start on the left; portrait tablets retain centered schedules and spacing 40. The batch is prepared for local preview on `sam/branch`. The live catalog and Git push remain pending the user's delivery instruction.
