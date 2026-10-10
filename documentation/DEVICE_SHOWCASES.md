# Device showcases



Find your style contains three independent four-style carousels in mobile, tablet and laptop order. Each rotates Little Friends, Mascots, Patterns and Originals. Desktop alternates artwork left/copy right, copy left/artwork right, then artwork left/copy right. Screens through 800px and portrait tablets through 1100px stack each row. Copy stays at For mobile., For tablet. and For laptop., one concise description and View more. There is no orientation toggle.



Mobile and tablet use the same desktop artwork-column proportion, contained 4:5 picture slot and 460 × 560px caps. Tablet reverses desktop columns. Laptop uses a wider contained 4:3 picture capped at 640px. Every tablet scene combines portrait and landscape tablets, with distinct poses and wallpapers across styles.



## Browse and output scope



View more opens /services/schedule-wallpaper?device=mobile, tablet or laptop directly at Choose a design. Device controls use an underlined text row above the collection pills. The selected device stays in the URL through design selection and back navigation. Legacy /wallpapers/:device links redirect to the chooser. Styles are shared across devices, with phone (1080 × 2400), tablet (1600 × 2560 portrait or 2560 × 1600 landscape) and laptop (1920 × 1080) previews and PNG exports. Tablet and laptop render a separate, wider timetable layout with larger time, subject and room columns. Phone heading/cards start lower to leave clock space; dense weeks preserve all meetings and the protected character footer. Tablet supports portrait/landscape and left/center/right placement; laptop uses opposite-side schedule/character placement, while patterns and backgrounds without a separate character center the schedule. Portrait tablet timetables start lower and use a larger character, with space reserved between the last card and the art. Badges have an inset margin inside each day pill. Character art sits near the bottom with a safe margin, with subtle hearts/sparkles outside the timetable. Bottom edition/name labels are removed. Example assets are saved under public/wallpapers/device-examples. Mobile View more buttons are content-sized and centered; collection filters retain a full pill radius on mobile.



Each row rotates at five-second intervals while at least 25% visible. Hover, control focus, page visibility and offscreen gates pause the timer; reduced motion disables automatic cycling. Countdown timing pauses and resumes with rotation; manual navigation resets it. Chevrons retain 44px targets.



## Assets and provenance



Mobile originals retain [their existing manifest](../output/imagegen/schedsnap/mobile-showcases.json). New tablet/laptop generated originals, exact prompts and provenance are recorded in [device-showcases.json](../output/imagegen/schedsnap/device-showcases.json). Active WebP files are public/images/collections/tablet/{little-friends,mascot,pattern,original}.webp and the equivalent laptop directory. Superseded separate tablet-orientation drafts are archived under output/imagegen/schedsnap/archive/tablet and are not active carousel states.



## Design preservation



This ordinary extension preserves the incumbent white/slate application and cream landing world. DESIGN.md and .impeccable/design.json remain unchanged. src/styles.css retains white paper (#ffffff), slate ink/accent (#0f172a), muted slate (#526074), line (#e2e8f0) and soft surface (#f8fafc), matching incumbent records. View more reuses the primary button with slate fill, white label, 12px radius, 12 × 20px padding and 600-weight 14px label. Shared section headlines retain clamp(1.75rem, 3vw, 2.25rem), 600 weight, 1.15 line height and -0.03em tracking. Scenes remain on open white surfaces; hero, brand and footer stay intact.



Preexisting documentation drift remains: DESIGN.md records the display size clamp(2.7rem, 4.1vw, 3.65rem), while established hero CSS uses clamp(2rem, calc(1.125rem + 3vw), 3.65rem) with short-screen overrides. This extension does not revise hero typography or global design authority. The detector ran once with no primary findings and an advisory about existing type-ramp drift. Surface-specific sizing is recorded here instead of overwriting the design files.



## Verification



.impeccable/review/device-showcases/verification.json and adjacent captures record all 12 carousel states at each of 1440, 820, 390 and 320px widths, with no horizontal overflow or browser errors. Gallery routing and image loads passed. Timed checks passed visible autoplay, hover pause and offscreen pause. Production build, 36 tests and changed-file lint passed. Final reviewer disposition: ship, with no material fixes.





## Chooser layout and rendering verification



Desktop shows four tablet or three laptop designs per row; smaller screens reduce the columns, with one laptop card per row on phones. Thumbnails render at 540px (phone), 768px (tablet), or 960px (laptop), preserving the native aspect ratio rather than enlarging 270px canvases. Placement and orientation controls drive the same renderer as PNG exports. Updated browser evidence is in device-layout-verification.json and chooser-*-sharp.png. A real tablet landscape download was checked at 2048 × 1536; placement/orientation controls were checked at a 390px viewport. Renderer regression checks retain every meeting in a fifteen-meeting week, keep art outside the schedule, and remove footer labels. Build, changed-file lint and 37 tests passed.


## Frosted glass cards

Day containers default to Frosted glass. The renderer snapshots and blurs the backdrop once per wallpaper, clips that image inside each card, then adds a translucent color gradient and a fine highlight rim. Text and badges are painted afterward and stay sharp. Light text uses a darker tint for readability. Fill/border switches and colors continue to work, and Customize appearance → Day containers → Finish can select Solid. The finish is rendered into the PNG, not applied as a browser-only overlay. Browser checks compared glass/solid on all three devices and confirmed exact preview/download PNG parity; 38 tests and changed-file lint passed.


## Character placement and particles

Portrait tablet characters use the same bottom corner as mobile. Landscape tablet and laptop characters occupy the bottom corner opposite the schedule. Occupied artwork bounds touch the canvas edge without overlapping meetings.

The last Customize appearance group, Decorations, offers Particles: Design default, None, Hearts, Sparkles, Stars, Paw prints, Petals, and Bubbles. Design defaults vary by template, with stable positions, sizes, and opacity for identical previews and exports. Decorations stay inside the canvas and clear of the timetable; mobile decorations follow the actual character bounds.


Design preview dialogs adapt to wallpaper orientation and available viewport height. Laptop and landscape tablet dialogs can grow to 1100px wide; portrait tablets can grow to 720px. A minimum usable dialog width avoids wrapping the title and action on short screens, while the canvas retains its aspect ratio and fits above the action.


Tablet wallpapers use a taller 10:16 portrait format (1600 × 2560), with a matching 16:10 landscape format (2560 × 1600). This adds 20% to gallery card height at the same width. The native renderer reflows the timetable and positions art within the new canvas; CSS preserves that ratio in thumbnails, dialogs, and the editor. PNG exports use the same dimensions.


## Consistent showcase and editor preview frames

On desktop layouts, all three showcase images share the same 4:3 frame capped at 560px wide. Images use contain to preserve their proportions. Carousel arrows sit beside each image, with indicators directly below its image column. The existing stacked mobile layout and side arrows remain unchanged.

Tablet and laptop editor previews fit both the frame width and the available viewport height. Small, medium, and large controls scale the full preview proportionally, including landscape wallpapers. Native canvas and export dimensions stay unchanged.
