---
version: 1
slug: "src-pages-schedulewallpaper-templateworkspace-jsx"
primary_target: "src/pages/ScheduleWallpaper/TemplateWorkspace.jsx"
related_targets: ["src/utils/canvasHelpers.js","src/pages/ScheduleWallpaper/ScheduleLayoutPicker.jsx","src/pages/ScheduleWallpaper/TemplateControls.jsx"]
---

# Schedule layouts

Your wallpaper exposes layout choices above Customize appearance. Stacked days remains the default. Mobile offers Stacked days and Timeline; tablet offers Stacked days, Day cards, and Timeline; laptop offers Stacked days, Day cards, and Weekly timetable.

Day cards pairs days in reading order, connects the dots beside meeting times, and uses a full-width final card when the number of occupied days is odd. Notes is removed. Timeline connects full weekday headings along a vertical rail and uses open meeting rows with horizontal divider lines instead of containers. Its type grows to use available space within bounded fitting limits. Mobile and tablet use wider portrait rows and compact gaps for larger readable text.

On the 1080 × 2400 mobile canvas, Timeline rows start at x36 and span 1008px, with schedule top y640 and heading y530 before position adjustments. Base type fits from 64px down to 28px. Meeting gaps are 16px, added meeting padding is 12px, day padding is 16px, and the heading gap is 12px. The earlier phone editor preview enlargement remains in place.

Portrait-tablet Timeline uses a 94% design column, yielding effective rows up to about 83.5% of canvas width before additional fitting, increased from about 72.9%. Its height budget is 68%, subject to existing artwork and footer limits. Tablet Timeline fits base type from 64px down to 28px with 20px meeting gaps, 16px day padding, and a 12px heading gap, retaining Space between days. Portrait upward movement keeps the heading top at least 18% down the canvas to protect the clock area. Landscape Timeline also uses compact rows, retaining its existing 65% design column.

Mobile Timeline also reserves 224px for rooms to reduce wrapping. Horizontal movement includes the weekday ring radius and stroke in its bounds; vertical movement preserves a title baseline of at least y500 under ordinary offsets, keeping the sample clock area clear.

Weekly timetable is laptop-only. Monday–Friday occupy columns beside a half-hour time axis; occupied weekend days add columns. Class blocks are positioned and sized from actual start/end times. Overlapping intervals use separate lanes. Blocks show the course code and full wrapped subject name, room, and optional dates; time text appears only on the axis. Half-hour labels align with guide boundaries and include the final ending time. Dashed half-hour guides accompany stronger hourly/day borders and class outlines. Strokes use the opaque normalized selected line color with opacity levels for hierarchy. Subject blocks are rectangular cells filling the entire day column, or their full lane when classes overlap. There are no side gutters or time-boundary gaps. Finish, Fill, and Border controls remain available; Shape applies to the outer board. The logical body uses the greater of 720px and 100px per hour; if subjects still overflow and every class lasts at least 45 minutes, one bounded retry uses 160px per hour before shared fitting and overflow checks. Short or crowded blocks that still cannot preserve readable details block export.

Appearance controls adapt to the layout. Timeline exposes a Dividers color palette instead of Finish, Shape, Fill, and Border controls; its rows stay open. Tablet Timeline also retains Space between days. Other layouts retain container controls, applied to the board and class blocks in Weekly timetable. Spacing controls are tablet-only, labeled Space between boxes outside Timeline. Mobile and laptop ignore stored tablet spacing, and Weekly timetable uses flush cells without side or time-boundary gaps. Placement, wallpaper, text, and applicable mascot decorations continue to follow device and artwork type. Fixed artwork remains fixed. Settings use existing per-design memory and Reset appearance behavior. Preview and PNG share measurement and drawing paths. The former requirement for identical appearance controls is superseded.

## Direction contract

THESIS: Offer distinct, readable schedule arrangements while preserving the original default and selected artwork.

OWN-WORLD: Retain SchedSnap's DM Sans, white/slate interface, existing color tokens, 12px control corners, and wallpaper-specific colors.

STORY: Choose a device-supported layout, distinguish subjects at a glance, adjust the controls relevant to that layout, then download the arrangement shown.

FIRST VIEWPORT: Retain the existing preview/download composition. Below Edit classes and Change design, show native radio choices with schematic thumbnails, then Customize appearance. Third choices occupy a full row.

FORM: Precisely specified extension of the established Operate surface; no new identity or concept seed. Timeline follows connected weekday markers and separate time/subject/room columns. Weekly timetable follows the supplied weekday-column and time-axis reference. Honor the request to meet in the middle: occupy useful space and scale the schedule well while retaining room for the design background. Use balanced general margins rather than artwork-specific fitting. Portrait-tablet Timeline uses a 94% design column and a 68% height budget, subject to artwork and footer limits; mobile starts with an 83% bottom limit and uses available area for dense schedules before blocking overflow.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Verification

Tests cover weekday order, preserved meetings and weekends, connected meeting dots, full-width final cards, movement, preview/export geometry, overflow blocking, Timeline scaling and subject separation, per-device choices, and Weekly timetable time mapping and overlapping intervals. Spacing follows the tablet-only control boundary; mobile and laptop ignore stored tablet spacing. No new bitmap artwork is used.

Timeline divider follow-up: open rows replaced all meeting containers. Horizontal lines in the selected line color separate successive meetings, including across weekdays, with no trailing line after the final meeting. That change retained scale, spacing, typography, and the weekday rail; the later compact mobile update below supersedes its mobile geometry. The follow-up build, lint, and eight focused tests passed. The rendered capture is `.impeccable/review/timeline-dividers.png`.

Compact mobile Timeline and layout-specific controls follow-up: build, lint, and 10 renderer tests passed, including a dense 10-meeting mobile schedule and preview/export equivalence. At this mobile follow-up, tablet Timeline was unchanged; the later tablet update supersedes that geometry. The earlier phone editor preview enlargement remains in place. No new artwork or tokens were introduced.

Tablet Timeline space follow-up: 11 focused renderer tests passed after widening the portrait layout, increasing its height budget, compacting tablet rows, and protecting the clock zone. Existing tablet spacing controls, mobile geometry, and artwork are retained.

Weekly grid follow-up: build, lint, and 12 renderer tests passed, including full subjects in one-hour classes, occupied weekends, overlapping intervals, time geometry, and preview/export equivalence. The existing captures `.impeccable/review/weekly-grid-desktop.png` and `.impeccable/review/weekly-grid-detail.png` precede the rare taller-grid fallback; its default rendering is unchanged. These are automatic-check results and earlier captures; personal simulation of this revision remains with the user.
