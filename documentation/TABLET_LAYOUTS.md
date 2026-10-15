# Schedule layouts

Your wallpaper exposes layout choices above Customize appearance. Stacked days remains the default. Mobile offers Stacked days and Timeline; tablet offers Stacked days, Day cards, and Timeline; laptop offers Stacked days, Day cards, and Weekly timetable.

Day cards pairs days in reading order, connects the dots beside meeting times, and uses a full-width final card when the number of occupied days is odd. Notes is removed. Timeline connects full weekday headings along a vertical rail and uses open meeting rows with horizontal divider lines instead of containers. Its type grows to use available space within bounded fitting limits. Thin dividers and row gaps distinguish successive subjects; mobile uses compact gaps and wider rows for larger readable text.

The requested balance is to occupy useful space and scale the schedule well while retaining room for the background. The renderer uses general margins rather than artwork-specific fitting. Portrait-tablet Timeline occupies at most 62% of wallpaper height. Mobile Timeline starts with an 83% bottom limit; dense schedules use the remaining available area before overflow blocks export.

On the 1080 × 2400 mobile canvas, Timeline rows start at x36 and span 1008px, replacing the earlier x78/924px geometry. The schedule starts at y640 with its heading at y530 before position adjustments. Its base type fits from 64px down to 28px, meeting gaps are 16px, added meeting padding is 12px, day padding is 16px, and the heading gap is 12px. Tablet Timeline geometry is unchanged. These renderer changes preserve preview/export equivalence and the separate phone editor preview enlargement.

Mobile Timeline also reserves 224px for rooms to reduce wrapping. Horizontal movement includes the weekday ring radius and stroke in its bounds; vertical movement preserves a title baseline of at least y500 under ordinary offsets, keeping the sample clock area clear.

Weekly timetable is laptop-only. Monday–Friday occupy columns beside an hourly time axis; occupied weekend days add columns. Class blocks are positioned and sized from actual start/end times. Overlapping intervals use separate lanes. Blocks show course code (or subject if code is missing), time, room and optional dates. Short or crowded blocks that cannot preserve readable details block export.

Appearance controls adapt to the layout. Timeline exposes a Dividers color palette instead of Finish, Shape, Fill, and Border controls; its rows stay open. Tablet Timeline also retains Space between days. Other layouts retain the container controls, applied to the board and class blocks in Weekly timetable. Spacing controls are tablet-only, labeled Space between boxes outside Timeline. Mobile and laptop ignore stored tablet spacing, and Weekly timetable uses its fixed default gap. Placement, wallpaper, text, and applicable mascot decorations continue to follow device and artwork type. Fixed artwork remains fixed. Settings use existing per-design memory and Reset appearance behavior. Preview and PNG share measurement and drawing paths. Identical appearance-control labels across layouts are no longer a requirement.


On phone-sized editor screens, mobile and tablet wallpaper previews use the available content width with 8px frame padding and a viewport-height cap. This enlarges the on-screen schedule without changing PNG dimensions or timetable fitting. Opening Customize appearance retains the compact sticky preview so controls remain accessible.

## Direction contract

THESIS: Offer distinct, readable schedule arrangements while preserving the original default and selected artwork.

OWN-WORLD: Retain SchedSnap's DM Sans, white/slate interface, existing color tokens, 12px control corners, and wallpaper-specific colors.

STORY: Choose a device-supported layout, distinguish subjects at a glance, adjust the controls relevant to that layout, then download the arrangement shown.

FIRST VIEWPORT: Retain the existing preview/download composition. Below Edit classes and Change design, show native radio choices with schematic thumbnails, then Customize appearance. Third choices occupy a full row.

FORM: Precisely specified extension of the established Operate surface; no new identity or concept seed. Timeline follows connected weekday markers and separate time/subject/room columns. Weekly timetable follows the supplied weekday-column and time-axis reference.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Verification

Tests cover weekday order, preserved meetings and weekends, connected meeting dots, full-width final cards, movement, preview/export geometry, overflow blocking, Timeline scaling and subject separation, per-device choices, and Weekly timetable time mapping and overlapping intervals. Spacing follows the tablet-only control boundary; mobile and laptop ignore stored tablet spacing. No new bitmap artwork is used.

The v3 review accepted all four captures in `.impeccable/review/layouts-v3/`: `desktop.png`, `tablet.png`, `mobile.png`, and `weekly-desktop.png`, with no material responsive issue. Its browser checks found identical appearance-control label arrays across every layout choice within each device; that finding is historical and superseded by the later request for controls appropriate to each layout. The v3 build, lint, and 10 focused tests passed; the full suite passed 176 of 177 tests, with the known baseline landscape-tablet failure at `tests/wallpaper.test.js:441`.

Timeline divider follow-up: open rows replaced all meeting containers. Horizontal lines in the selected line color separate successive meetings, including across weekdays, with no trailing line after the final meeting. That change retained scale, spacing, typography, and the weekday rail; the later compact mobile update below supersedes its mobile geometry. The follow-up build, lint, and eight focused tests passed. The rendered capture is `.impeccable/review/timeline-dividers.png`.

Compact mobile Timeline and layout-specific controls follow-up: build, lint, and 10 renderer tests passed. Coverage includes a dense 10-meeting mobile schedule, wider rows with compact gaps and larger fitted type, and equivalent preview/export geometry. Tablet Timeline and the earlier phone editor preview enlargement remain unchanged. No new artwork or tokens were introduced.

Compact mobile Timeline follow-up: current desktop and phone captures are .impeccable/review/compact-timeline-desktop.png and compact-timeline-mobile.png. Finish review returned ship with no material fixes. Browser checks confirmed Timeline-specific controls on mobile and tablet. Ten focused renderer tests, lint, and production build passed.
