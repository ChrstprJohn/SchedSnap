---
version: 1
slug: "src-pages-schedulewallpaper-templateworkspace-jsx"
primary_target: "src/pages/ScheduleWallpaper/TemplateWorkspace.jsx"
related_targets: ["src/utils/canvasHelpers.js","src/pages/ScheduleWallpaper/ScheduleLayoutPicker.jsx"]
---

# Tablet schedule layouts

The Your wallpaper page offers two tablet layouts above Customize appearance. Stacked days preserves the original full-width day rows. Day cards follows the supplied reference's structure while retaining the selected template's artwork and appearance: a shared title, two columns of full weekday cards in reading order, time above course details, and rooms on the right. The last empty cell becomes a blank lined Notes panel. Weekend classes remain in order; an even number of occupied days uses all cells for classes.

The choice uses the existing per-design, in-memory appearance settings. Switching designs and returning retains it for the current session; Reset appearance restores the original stacked layout. Mobile and laptop output ignore the tablet setting. Both preview and PNG use the same measurement and drawing path, with bounded font fitting and export blocking for overcrowded schedules.

## Direction contract

THESIS: Add a second arrangement to the existing wallpaper editor, with both choices visible on the final page. Preserve the original arrangement as the default.

OWN-WORLD: Retain SchedSnap's DM Sans, white/slate interface, existing color tokens, 12px control corners, and wallpaper-specific artwork and colors.

STORY: Choose Stacked days or Day cards and immediately see the result; download the same arrangement. Position, box spacing, typography, and container controls continue to apply.

FIRST VIEWPORT: Keep the existing preview and download columns. Below Edit classes and Change design, show a two-option native radio group with schematic layout thumbnails, then the existing appearance disclosure.

FORM: Precisely specified extension of the existing Operate surface; no concept seed or new visual identity. Use the reference's two-column weekday sequence and final notes area.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Verification

Automated coverage in `tests/tabletDayCards.test.js` checks weekday order, paired row geometry, preserved meetings and weekends, the notes cell, movement bounds, preview/export measurement equality, overflow blocking, spacing, and unchanged mobile/laptop layouts. No new bitmap artwork is used.
