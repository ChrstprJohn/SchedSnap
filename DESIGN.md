---
name: SchedSnap
description: A quiet interface for colorful class schedule wallpapers.
colors:
  primary: "#0f172a"
  primary-hover: "#334155"
  paper: "#ffffff"
  muted: "#526074"
  line: "#e2e8f0"
  soft: "#f8fafc"
  hero-cream: "#faf6ef"
  hero-muted: "#5b5b55"
  nav-line: "#dedbd4"
  hero-outline: "#c9c2b6"
  hero-outline-hover: "#9c9487"
  hero-action-surface: "rgb(255 255 255 / 35%)"
  hero-action-hover: "rgb(255 255 255 / 75%)"
  error: "#923b2d"
  error-surface: "#f8e9e2"
typography:
  display:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "clamp(2.7rem, 4.1vw, 3.65rem)"
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  statistic:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "30px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  label:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "20px"
rounded:
  field: "0.5rem"
  action: "0.75rem"
  preview: "16px"
  pill: "999px"
spacing:
  control-gap: "8px"
  row-gap: "12px"
  field-gap: "16px"
  section-gap: "24px"
  grid-row-gap: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "11px 16px"
  hero-secondary:
    backgroundColor: "{colors.hero-action-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.action}"
    padding: "12px 16px"
    height: "50px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
    rounded: "{rounded.field}"
    padding: "0.6rem 0.7rem"
  collection-filter:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  collection-filter-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
---

# Design System: SchedSnap

## Overview

The established visual direction pairs a creamy product scene with a quiet white/slate application around colorful wallpapers. Concise DM Sans copy and generous spacing give students room to choose and review. A generated transparent navy abstract S mark is the shared brand signature.

**Key Characteristics:**

- White surfaces, slate actions and restrained dividers.
- Independent cream ambient and transparent phone layers; white collection scenes blend into the page.
- Alternating collection rows, clear form hierarchy and optional customization.

## Colors

### Primary

Deep slate supplies text, primary actions and selected filters. Hover uses the lighter slate token. The generated abstract S mark uses navy.

### Neutral

White is the main surface, muted slate carries supporting copy, and pale slate separates controls and sections. Soft fields frame editor previews; warm cream frames the hero while pure-white collection scenes blend into the page, and a warm muted tone carries hero copy. Warm rust identifies errors and destructive actions. Wallpaper palettes remain independent from the application palette.

## Typography

The interface uses locally bundled DM Sans Variable with a sans-serif fallback. The hero uses the display role; section headings use the headline role; editor page headings use title, reducing to 24px at 640px and below. Buttons and common labels use compact, semibold type. Home copy has comfortably spaced lines and constrained measure; type values are extracted from `src/styles.css` and `src/landing.css`.

Wallpaper typography is measured and rendered by Canvas. DM Sans is the default; final-screen font selection changes the artifact, as detailed below.

## Layout

The common container is `min(100% - 3rem, 1120px)`; at 480px and below it becomes `calc(100% - 2rem)`. The collection section uses one automatically cycling four-collection showcase. The carousel advances every five seconds while at least a quarter of the section is visible. Hovering with a mouse, focusing a control, hiding the page, or scrolling the section out of view stops rotation. Reduced-motion preferences disable automatic cycling. The compact 80 × 2px progress line has four segments; the active segment fills over five seconds. Its animation and timer pause together and resume the remaining interval; choosing another collection resets both. The next collection image is preloaded. The live region is off during automatic cycling and polite during interaction. There is no visible play/pause control. Desktop places the image left and copy right, with subtle unboxed chevrons beside the progress line below the panel. Phones through 800px and portrait tablets through 1100px show the section heading, phone artwork with chevrons at its sides, the countdown line immediately beneath it, then the centered collection title, description and Create wallpaper action. The four-segment countdown line sits below the full panel on desktop and directly below the artwork on stacked layouts. Chevrons keep 44px touch targets without visible borders or backgrounds. This follows the reference layout while retaining SchedSnap colors, typography and buttons. Desktop uses a 1.3:1 image/copy ratio. The same portrait artwork is used on every screen. A contained 4:5 picture is capped at 460px wide and 560px high on desktop; mobile uses an image-and-chevron row capped at 580px. Collection headings scale from 28px to 38.4px and descriptions share the hero body clamp with a 16px minimum. Title spacing is 8–12px and action spacing 16–20px, with no reserved empty description line. Gaps and padding use clamp. The static hero fills `calc(100svh - var(--iab-h, 0px))` on desktop and `100dvh` minus the advisory through 1100px. A 1672 × 941 decorative ambient image covers the section; a separate transparent 1448 × 1086 phone group uses contain sizing. A 1.18 image scale compensates for transparent canvas margins inside a clipped slot, preserving the full phones. The same original three-phone foreground is retained on mobile and desktop. Desktop and landscape tablets use centered columns in a 1:1.2 ratio with left-aligned copy. Screens through 800px and portrait tablets through 1100px use centered copy and a centered phone graphic below it. Their actions always stack with equal widths capped at 320px and 44px minimum heights. The complete portrait group centers below the overlaid header, with matching fluid top and bottom clearance and safe-area insets. Type follows a shared width-based clamp with a 32px heading minimum and 16px description minimum; short windows have a 28px heading minimum. Portrait graphics shrink to preserve controls above the fold. Compact landscape screens use tighter spacing and two columns. Extremely short windows allow natural content flow rather than clipping controls.

Three unboxed statistics sit below the hero in equal columns, including on mobile. They use 48px vertical padding, reducing to 32px at 640px and below; large tabular numbers sit above muted labels. Homepage collections and footer have no separator lines.

Editor classes pair a flexible form with a 260–340px preview on desktop. At 640px and below the preview hides and class actions form a fixed bottom row; Download stacks preview and controls. Appearance customization can keep the small phone preview sticky. See `documentation/LANDING_PAGE.md` for the current hero composition and `documentation/TECH_STACK.md` for routes.

## Elevation & Depth

The interface is flat by default, with borders and quiet tonal surfaces defining regions. Wallpaper previews have a restrained shadow; native dialogs use dark slate backdrops and focus trapping. The mobile class action strip has a faint upward shadow. These exact extensions live in `.impeccable/design.json`.

## Shapes

Actions and gallery frames use gently rounded corners; fields are slightly tighter. Collection filters are pill-shaped on desktop and compact rounded rectangles on phones. Wallpaper day containers have their own pill/rounded-rectangle choice. The transparent abstract S mark is a compact navy silhouette. Collection scenes blend into the white page with no border radius or card framing; editor preview surfaces retain their established rounded corners.

## Components

### Shared controls and navigation

Primary actions are deep slate with white text; secondary actions are white with a thin divider border. Both have a 44px minimum height. Inputs use white fills, quiet borders and visible slate focus outlines; invalid fields turn rust. Disabled actions dim and stop accepting interaction.

The sticky header transparently overlays the hero at the top of home, then turns white with a divider after scrolling. Home uses a 77px height/-77px margin, reducing to 57px/-57px at 640px and below. Home shows only the linked brand at the top. After scrolling beyond 8px, home adds Create wallpaper on screens wider than 640px; mobile and editor headers remain brand-only. The footer repeats the brand on marketing pages.

The homepage switches between four illustrative collection scenes in one automatically cycling showcase with a title, one sentence and Create wallpaper action. Each action opens its filtered editor gallery; that gallery retains native preview dialogs and actual sample schedules. The hero remains static with the full transparent phone foreground visible. Create wallpaper and the outlined Explore action share a 50px minimum height, reducing to 44px for compact actions. The secondary action uses a warm outline and translucent white surface with a stronger hover fill. All controls retain visible keyboard focus.

### Wallpaper editor

The gallery lets the artwork lead, with all 62 designs and collection filters. Clicking a design opens a native dialog with a large sample or actual-class preview and Use this design. Classes provides image import, manual entry, or a five-class sample with one meeting each Monday–Friday. Desktop class review has a live preview; phones hide the design preview and focus on upload or class entry. Mobile upload uses a centered area between 200px and 400px tall, adapting to the screen height, and two equal-width manual/sample buttons; filter controls are compact and scroll horizontally. The toolbar shows an editable schedule title and pencil control on the left, with the concise Upload image action on the right. The file picker opens directly; canceling file selection leaves the editor in place. Manual and sample entry have a secondary Cancel beside Continue. Each class header shows the subject and course code, falling back to New Class, with a separate delete icon and chevron. Subject and Course code stay paired; Day, Start time, End time, and Room number use equal columns and wrap into pairs on narrow screens. Multiple meetings have numbered headings; a single meeting does not. Add class is a full-width dashed action below the list and scrolls to the new class. Errors appear next to touched fields or after Continue, which focuses the first missing detail. Review notes sit below the form. Preview sits at the lower right on desktop; phones use equal-width Cancel and Preview actions, or a full-width Preview when no Cancel is available. Importing another image temporarily replaces the form with a clickable image preview and one action row: Change image and the primary Import classes button. The image opens in a zoomable dialog; filenames are omitted. The page Back control returns to classes while importing, preserving edits and the expanded card. The selected-image view has a Cancel action that returns to the existing classes or empty starting choices without modifying the schedule. An inline warning above the actions explains that importing replaces current classes and edits. Change image sits at the top right beside the page title. Cancel and the primary Import classes action sit below the image, with equal widths on phones. The data-use note is left-aligned below the image beside the right-aligned desktop actions and below buttons on phones. The upload area accepts dropped files with visible feedback. Existing classes remain until an import succeeds.

### Wallpaper artifacts

The original exported backgrounds include soft window shadows, frosted blue glass, olive color, and blush checkerboard with a chrome star. Variations extend that world into notebook, pastel, and graphic styles. All timetable text and the shared title use locally hosted DM Sans Variable. Historical heading/style fields remain in preset data but do not control the shared renderer.

The animal extension pairs cute companions with functional, flexible timetables. Each transparent cutout sits on a uniform Canvas background. Bold editions use navy, forest, and rust; soft editions use blush, lilac, and cream; everyday editions use quiet neutral or nature palettes. Animal art contains no schedule or edition text; Canvas renders both separately. Subtle interior shading in some generated cutouts is an incidental artifact, not a rule to extend to future assets.

All 62 templates default to the centered Class Schedule title at (540, 570), 88px in the selected font at weight 750, leaving the upper clock/date area open. The title can be edited from the class toolbar; long titles shrink to fit the heading area. No student information is baked into the artwork. Each weekday has a separate pill-shaped card with optional border, background fill and row separators (off by default), plus a rounded-rectangle alternative and a centered circular initial badge: M, T, W, TH, F, SA, SU. Time and subject columns share consistent positions; times read 7:00 AM–10:00 AM and center vertically beside the full subject/details block. Long subjects stay on one line, shrink by up to 20%, then truncate with an ellipsis, course codes lead them, rooms have a separate column and dates stay below, and optional separators divide meetings within each card.

The latest reference sets a code-first hierarchy: course code at the main size and weight 750, subject at 65% of that size below it, both centered in their column. Rooms use a separate 166px column at 80% of the main size. All three blocks center vertically within each meeting. Dates remain below the subject. Without a code, the subject uses the main size. Colors and font are editable in the optional final-screen appearance controls, so DM Sans is the default rather than a mandatory family. The same renderer measures and draws gallery examples, modal schedules and full PNG output. Image backgrounds stay fixed; native patterns and mascot backgrounds have editable colors; Reset appearance restores the preset.

Patterns & prints adds six native Canvas designs: checkerboard, dots, stripes, diamonds, waves and notebook lines. They have separately editable background and pattern colors. Download pairs the wallpaper with its actions on desktop and stacks them on phones. Customize appearance is optional and starts collapsed. Controls are grouped as Wallpaper, Day containers, and Schedule Text, with left-aligned labels and controls on the right. Background, Shape, Font family, and Text use concise labels. Fill and Border each combine an inline checkbox with a visible palette that dims and disables when unchecked. The row-separator toggle is omitted. Phones keep a small preview visible while customizing; its strip expands edge to edge only after reaching the sticky position. The mobile enlargement dialog is full-screen, with close at the top and zoom controls at the bottom. Control-wheel zooms the image between 50% and 400%; ordinary wheel scrolling pans, and Fit resets to 100%. Image-backed originals keep their artwork fixed. Per-design settings remain in memory until refresh.

Output is 1080 × 2400 portrait mobile only. Preserve every meeting and fit long subject names on one line with bounded shrinking and an ellipsis. Cards start at y680, grow with their contents, and have 16px gaps; meetings have 20px spacing, compacting to 8px for dense schedules. Empty weekdays are skipped. Fit schedule body type within 28–42px; block export if the full schedule still cannot fit. Mascot schedules end by y1740; the footer starts at y1780 or below. Normalize the animal's occupied alpha bounds to a fixed 620px maximum dimension, independent of meeting count, without modifying the source PNG. The combined 62 presets live in `src/assets/templates.js`; `src/assets/mascotTemplates.js` defines the 20 animal editions. Generated artwork, exact prompts, and provenance are documented in `documentation/WALLPAPER_TEMPLATES.md`.

The reference layout uses a larger centered day badge and centered time, code/subject and room columns. The gallery, modal preview and downloaded PNG share this layout and all container settings. Dense schedules reduce spacing within the existing type limits to preserve meetings and mascot clearance.

Little Friends extends the mascot gallery with 20 Chiikawa-inspired poses of the white round-eared friend, blue-and-white kitten and cream bunny. Transparent PNG cutouts keep the reference facial marks and pink blush; Canvas supplies editable pastel fields and the existing schedule layout. A Chiikawa inspired filter appears alongside the existing collections. Ten characters occupy each footer side.

## Do's and Don'ts

- **Do** preserve the white/slate application palette while letting the selected wallpaper carry its own colors.
- **Do** use the shared renderer for gallery, dialog, live preview and PNG export.
- **Do** keep keyboard focus visible and honor reduced-motion preferences.
- **Do** preserve every meeting and block export when the validated layout cannot fit.
- **Don't** bake headings, timetable text or student information into mascot artwork.
- **Don't** shrink body type below the established fit limits or grow mascots with schedule density.
- **Don't** restore general-toolbox or future-service marketing.
