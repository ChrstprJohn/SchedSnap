# Device showcases

Find your style contains three independent four-style carousels in mobile, tablet and laptop order. Each rotates Little Friends, Mascots, Patterns and Originals. Desktop alternates artwork left/copy right, copy left/artwork right, then artwork left/copy right. Screens through 800px and portrait tablets through 1100px stack each row. Copy stays at For mobile., For tablet. and For laptop., one concise description and View more. There is no orientation toggle.

Mobile and tablet use the same desktop artwork-column proportion, contained 4:5 picture slot and 460 × 560px caps. Tablet reverses desktop columns. Laptop uses a wider contained 4:3 picture capped at 640px. Every tablet scene combines portrait and landscape tablets, with distinct poses and wallpapers across styles.

## Browse and output scope

View more opens /services/schedule-wallpaper?device=mobile, tablet or laptop directly at Choose a design. Device controls use an underlined text row above the collection pills. The selected device stays in the URL through design selection and back navigation. Legacy /wallpapers/:device links redirect to the chooser. Styles are shared across devices; tablet/laptop selections explicitly explain that their sizing is not yet available. Actual exports remain 1080 � 2400 portrait PNGs.

Each row rotates at five-second intervals while at least 25% visible. Hover, control focus, page visibility and offscreen gates pause the timer; reduced motion disables automatic cycling. Countdown timing pauses and resumes with rotation; manual navigation resets it. Chevrons retain 44px targets.

## Assets and provenance

Mobile originals retain [their existing manifest](../output/imagegen/schedsnap/mobile-showcases.json). New tablet/laptop generated originals, exact prompts and provenance are recorded in [device-showcases.json](../output/imagegen/schedsnap/device-showcases.json). Active WebP files are public/images/collections/tablet/{little-friends,mascot,pattern,original}.webp and the equivalent laptop directory. Superseded separate tablet-orientation drafts are archived under output/imagegen/schedsnap/archive/tablet and are not active carousel states.

## Design preservation

This ordinary extension preserves the incumbent white/slate application and cream landing world. DESIGN.md and .impeccable/design.json remain unchanged. src/styles.css retains white paper (#ffffff), slate ink/accent (#0f172a), muted slate (#526074), line (#e2e8f0) and soft surface (#f8fafc), matching incumbent records. View more reuses the primary button with slate fill, white label, 12px radius, 12 × 20px padding and 600-weight 14px label. Shared section headlines retain clamp(1.75rem, 3vw, 2.25rem), 600 weight, 1.15 line height and -0.03em tracking. Scenes remain on open white surfaces; hero, brand and footer stay intact.

Preexisting documentation drift remains: DESIGN.md records the display size clamp(2.7rem, 4.1vw, 3.65rem), while established hero CSS uses clamp(2rem, calc(1.125rem + 3vw), 3.65rem) with short-screen overrides. This extension does not revise hero typography or global design authority. The detector ran once with no primary findings and an advisory about existing type-ramp drift. Surface-specific sizing is recorded here instead of overwriting the design files.

## Verification

.impeccable/review/device-showcases/verification.json and adjacent captures record all 12 carousel states at each of 1440, 820, 390 and 320px widths, with no horizontal overflow or browser errors. Gallery routing and image loads passed. Timed checks passed visible autoplay, hover pause and offscreen pause. Production build, 36 tests and changed-file lint passed. Final reviewer disposition: ship, with no material fixes.
