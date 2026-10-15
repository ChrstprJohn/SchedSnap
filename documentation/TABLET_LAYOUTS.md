# Schedule layouts

Your wallpaper exposes layout choices above Customize appearance. Stacked days remains the default. Mobile offers Stacked days and Timeline; tablet offers Stacked days, Day cards, and Timeline; laptop offers Stacked days, Day cards, and Weekly timetable.

Day cards pairs days in reading order, connects the dots beside meeting times, and uses a full-width final card when the number of occupied days is odd. Notes is removed. Timeline connects full weekday headings along a vertical rail and groups each weekday heading and its meetings in one container, with divider lines only between subjects within that day. Its type grows to use available space within bounded fitting limits. Thin dividers and row gaps distinguish successive subjects; mobile uses compact gaps and wider rows for larger readable text.

The requested balance is to occupy useful space and scale the schedule well while retaining room for the background. The renderer uses general margins rather than artwork-specific fitting. Portrait-tablet Timeline uses a 68% height budget, subject to existing artwork and footer limits. Its design column spans 94% of canvas width; effective rows reach about 83.5% before additional fitting, increased from about 72.9%. Mobile Timeline starts with an 83% bottom limit; dense schedules use the remaining available area before overflow blocks export.

On the 1080 × 2400 mobile canvas, Timeline rows start at x36 and span 1008px, replacing the earlier x78/924px geometry. The schedule starts at y640 with its heading at y530 before position adjustments. Its base type fits from 64px down to 28px, meeting gaps are 16px, added meeting padding is 12px, day padding is 16px, and the heading gap is 12px. These mobile renderer changes preserve preview/export equivalence and the separate phone editor preview enlargement.

Tablet Timeline uses compact base type fitting from 64px down to 28px, 20px meeting gaps, 16px day padding, and a 12px heading gap. Space between days remains available. Portrait upward movement keeps the heading top at least 18% down the canvas, protecting the clock area. Landscape Timeline uses compact rows while retaining its existing 65% design column.

Mobile Timeline also reserves 224px for rooms to reduce wrapping. Horizontal movement includes the weekday ring radius and stroke in its bounds; vertical movement preserves a title baseline of at least y500 under ordinary offsets, keeping the sample clock area clear.

Weekly timetable is laptop-only. Monday–Friday occupy columns beside a half-hour time axis; occupied weekend days add columns. Class blocks are positioned and sized from actual start/end times. Overlapping intervals use separate lanes. Blocks show the course code and full wrapped subject name, room, and optional dates; time text appears only on the axis. Half-hour labels align with guide boundaries and include the final ending time. Dashed half-hour guides accompany stronger hourly/day borders and class outlines. Strokes use the opaque normalized selected line color with opacity levels for hierarchy. Subject blocks are rectangular cells filling the entire day column, or their full lane when classes overlap. There are no side gutters or time-boundary gaps. Finish, Fill, and Border controls remain available; Shape applies to the outer board. The logical body uses the greater of 720px and 100px per hour; if subjects still overflow and every class lasts at least 45 minutes, one bounded retry uses 160px per hour before shared fitting and overflow checks. Short or crowded blocks that still cannot preserve readable details block export.

Appearance controls follow the selected layout. Timeline now provides Finish, Shape, Fill, Day outline, and a Lines palette for its day containers. Lines colors both day outlines and subject dividers; Day outline toggles only the container outline. Tablet Timeline retains Space between days. Other layouts retain their existing container controls. Spacing controls remain tablet-only. Fixed artwork remains fixed, and per-design memory, Reset appearance, preview/export equivalence, and overflow checks are retained.


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

Compact mobile Timeline and layout-specific controls follow-up: build, lint, and 10 renderer tests passed. Coverage includes a dense 10-meeting mobile schedule, wider rows with compact gaps and larger fitted type, and equivalent preview/export geometry. At this mobile follow-up, tablet Timeline was unchanged; the later tablet update supersedes that geometry. The earlier phone editor preview enlargement remains in place. No new artwork or tokens were introduced.

Tablet Timeline space follow-up: 11 focused renderer tests passed after widening the portrait layout, increasing its height budget, compacting tablet rows, and protecting the clock zone. Existing tablet spacing controls, mobile geometry, and artwork are retained.

Weekly grid follow-up: build, lint, and 12 renderer tests passed, including full subjects in one-hour classes, occupied weekends, overlapping intervals, time geometry, and preview/export equivalence. The existing captures `.impeccable/review/weekly-grid-desktop.png` and `.impeccable/review/weekly-grid-detail.png` precede the rare taller-grid fallback; its default rendering is unchanged. These are automatic-check results and earlier captures; personal simulation of this revision remains with the user.

Compact mobile Timeline follow-up: current desktop and phone captures are .impeccable/review/compact-timeline-desktop.png and compact-timeline-mobile.png. Finish review returned ship with no material fixes. Browser checks confirmed Timeline-specific controls on mobile and tablet. Ten focused renderer tests, lint, and production build passed.

Timeline day-container follow-up: each occupied day has one rounded container around its heading and subjects; the connected rail stays alongside. Dividers appear only between meetings within the day. Containers reuse measured rows and existing theme colors, preserving mobile/tablet scale and placement. Container fill, finish, shape, and outline are editable. Earlier open-row requirements and captures are superseded. Twelve focused renderer tests verify grouping, complete meetings, disabled fill/outline, unchanged geometry, and preview/export equivalence. Interactive review is left to the user as requested.
