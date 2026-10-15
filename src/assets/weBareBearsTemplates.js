// Original device-specific We Bare Bears fan-art wallpaper backgrounds.
// The schedule and all course data are composed by Canvas at render time.
const designs = [
  ['wbb-ice-bear-minimal', 'Ice Bear Minimal', 'A quiet ivory field with Ice Bear’s simple hand-drawn face.', '#fffbf1', '#252525', '#55524c', '#d8cfc3', '2026-10-15T13:09:05.273Z'],
  ['wbb-panda-minimal', 'Panda Minimal', 'Panda’s gentle smile and soft charcoal patches on white.', '#ffffff', '#252525', '#555555', '#dddddd', '2026-10-15T13:09:05.273Z'],
  ['wbb-grizzly-minimal', 'Grizzly Minimal', 'Grizzly’s happy face on a flat warm terracotta field.', '#ad7457', '#211a16', '#3e2d24', '#d1aa91', '2026-10-15T13:09:05.273Z'],
  ['wbb-paw-trio', 'Bear Paw Trio', 'Three little bear paws in charcoal, ochre and white.', '#ffffff', '#252525', '#555555', '#dddddd', '2026-10-15T13:09:05.273Z'],
  ['wbb-edge-peek-a', 'Edge Peek Trio A', 'Ice Bear, Grizzly, and Panda peek in from the edges of warm ivory paper.', '#fff8ec', '#37312d', '#766b63', '#d8cfc3', '2026-10-13T14:15:33.000Z'],
  ['wbb-edge-peek-b', 'Edge Peek Trio B', 'Three familiar faces peek from opposite corners across a quiet cream field.', '#fff8ec', '#37312d', '#766b63', '#d8cfc3', '2026-10-13T14:15:30.710Z'],
  ['wbb-edge-peek-c', 'Edge Peek Trio C', 'Soft sketch-like bear peeks add a little warmth around the pale oat center.', '#faf4e9', '#37312d', '#766b63', '#d8cfc3', '2026-10-13T14:15:41.057Z'],
  ['wbb-lavender-reader', 'Lavender Reader', 'A calm Ice Bear reading moment on a spacious muted lavender background.', '#a59fbe', '#37343d', '#67627a', '#d5d1e0', '2026-10-13T14:14:27.930Z'],
  ['wbb-dusk-book-club', 'Dusk Book Club', 'Ice Bear reads beneath a few tiny corner stars on a periwinkle field.', '#8588bf', '#34344c', '#5b5d87', '#d5d6ef', '2026-10-13T14:14:29.089Z'],
  ['wbb-lavender-panels', 'Lavender Panels', 'Graphic lavender panels frame Ice Bear and a quiet reading break.', '#c0b5ed', '#3b344c', '#6f648f', '#ded7f2', '2026-10-13T14:14:30.190Z'],
  ['wbb-pink-selfie-pop', 'Pink Selfie Pop', 'Panda, Grizzly, and Ice Bear raise their arms for a playful selfie on dusty pink.', '#edb2bd', '#49343a', '#79545d', '#f8e6e8', '2026-10-13T14:17:06.477Z'],
  ['wbb-paper-pals', 'Paper Pals', 'The trio peeks around cream paper scraps and tiny heart doodles on a dusty-pink page.', '#edb2bd', '#49343a', '#79545d', '#f8e6e8', '2026-10-14T03:12:49.621Z'],
  ['wbb-gouache-giggles', 'Gouache Giggles', 'A soft gouache-style trio selfie leaves a broad clear pink field for the week.', '#edb2bd', '#49343a', '#79545d', '#f8e6e8', '2026-10-14T03:08:47.113Z'],
  ['wbb-stationery-frame', 'Stationery Frame', 'A fine wavy stationery border and tiny paw, heart, and star marks surround the trio.', '#f5efe5', '#403930', '#71665b', '#d4c9b9', '2026-10-14T03:12:57.864Z'],
  ['wbb-keepsake-frame', 'Keepsake Double Frame', 'A delicate double frame and small bear friends make a warm cream keepsake page.', '#f5efe5', '#403930', '#71665b', '#d4c9b9', '2026-10-14T03:13:06.207Z'],
  ['wbb-gentle-postcard', 'Gentle Bear Postcard', 'A quiet paper postcard with tiny corner doodles and the trio gathered below.', '#f5efe5', '#403930', '#71665b', '#d4c9b9', '2026-10-14T03:13:13.791Z'],
];

export const weBareBearsTemplates = designs.map(([id, name, description, background, ink, muted, line, createdAt]) => ({
  id,
  name,
  description,
  collection: 'we-bare-bears',
  ...(['wbb-ice-bear-minimal', 'wbb-panda-minimal', 'wbb-grizzly-minimal', 'wbb-paw-trio'].includes(id) ? { family: 'wbb-minimal', verticalPosition: -40, schedulePosition: 'left', containerStyle: 'glass', containerShape: 'pill', containerFill: true, particleStyle: 'none' } : {}),
  background,
  ink,
  muted,
  surface: '#ffffff',
  line,
  createdAt,
  image: `/wallpapers/scenic/${id}/mobile.png`,
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [
    device, `/wallpapers/scenic/${id}/${device}.png`,
  ])),
}));
