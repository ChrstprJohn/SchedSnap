# Tablet schedule layouts

The Your wallpaper page offers two tablet layouts above Customize appearance. Stacked days preserves the original full-width day rows and remains the default. Day cards follows the supplied reference's structure while retaining the selected template's artwork and appearance: a shared title, two columns of full weekday cards read left to right, then top to bottom, time above course code and subject, and rooms on the right. An odd number of occupied days leaves a blank lined Notes panel beside the final day. Weekend classes remain in order; an even number of occupied days uses all cells for classes.

The choice uses the existing per-design, in-memory appearance settings. Switching designs and returning retains it for the current session; Reset appearance restores the original stacked layout. Position, Space between boxes, typography, and container controls continue to apply. Mobile and laptop output ignore the tablet setting. Both preview and PNG use the same measurement and drawing path, with bounded font fitting and export blocking for overcrowded schedules. The Notes panel is part of the rendered wallpaper, with no note-entry field.

## Direction contract

THESIS: Add a second arrangement to the existing wallpaper editor, with both choices visible on the final page. Preserve the original arrangement as the default.

OWN-WORLD: Retain SchedSnap's DM Sans, white/slate interface, existing color tokens, 12px control corners, and wallpaper-specific artwork and colors.

STORY: Choose Stacked days or Day cards and immediately see the result; download the same arrangement. Position, box spacing, typography, and container controls continue to apply.

FIRST VIEWPORT: Keep the existing preview and download columns. Below Edit classes and Change design, show a two-option native radio group with schematic layout thumbnails, then the existing appearance disclosure.

FORM: Precisely specified extension of the existing Operate surface; no concept seed or new visual identity. Use the reference's two-column weekday sequence and final notes area.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Verification

Automated coverage in `tests/tabletDayCards.test.js` checks weekday order, paired row geometry, preserved meetings and weekends, the notes cell, movement bounds, preview/export measurement equality, overflow blocking, spacing, and unchanged mobile/laptop layouts. No new bitmap artwork is used.

The four new layout tests and three related tests pass. `npm run lint` and `npm run build` pass. The full suite passes 172 of 173 tests; the existing landscape-tablet test at `tests/wallpaper.test.js:441` also fails with the original HEAD renderer and is outside this extension.

Finish review disposition: ship, with no material fixes. Visual evidence is saved under `.impeccable/review/tablet-layouts/`: `stacked-desktop.png`, `desktop.png`, `tablet.png`, and `mobile.png` show the selector and responsive page; `export.png` is the actual downloaded 1600 × 2560 PNG. The reference informs layout only; the extension adds no raster artwork.
