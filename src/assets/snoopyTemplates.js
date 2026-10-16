// Reference-led ink drawings; timetable content is rendered separately by Canvas.
const designs = [
  ['snoopy-dotted-peek', 'Snoopy Dotted Peek', 'Snoopy peeks around a page of tiny hand-inked dots.', '#ffffff'],
  ['snoopy-blue-meadow', 'Snoopy Blue Meadow', 'Snoopy and Woodstock among delicate flowers on powder blue paper.', '#e5edf8'],
  ['snoopy-sleepy-stripes', 'Snoopy Sleepy Stripes', 'A sleepy Snoopy rests against gently wavering blue stripes.', '#ffffff'],
  ['snoopy-quiet-sketch', 'Snoopy Quiet Sketch', 'A little Snoopy ink sketch in the corner of a quiet white page.', '#ffffff'],
  ['snoopy-heart-line', 'Snoopy & Woodstock Heart', 'A little heart floats above Snoopy and Woodstock on a hand-inked line.', '#ffffff', '2026-10-16T09:14:22.000Z'],
  ['snoopy-shark-suit', 'Snoopy Shark Suit', 'A smiling Snoopy in a blue shark costume, drawn in bold textured ink.', '#ffffff', '2026-10-16T09:14:22.000Z'],
  ['snoopy-navy-cool', 'Snoopy Navy Cool', 'Round sunglasses and a deep navy sweater with expressive hand-drawn contours.', '#ffffff', '2026-10-16T09:14:22.000Z'],
  ['snoopy-looking-up', 'Snoopy Looking Up', 'A quiet upward glance in soft, imperfect black pen on white.', '#ffffff', '2026-10-16T09:14:22.000Z'],
];

export const snoopyTemplates = designs.map(([id, name, description, background, createdAt = '2026-10-15T23:30:10.000Z']) => ({
  id, name, description, background,
  collection: 'snoopy',
  family: 'snoopy-handmade',
  ink: '#252b32', muted: '#49515b', line: '#a8b3c1', surface: '#ffffff',
  createdAt,
  fontFamily: 'Patrick Hand',
  particleStyle: 'none',
  verticalPosition: -80,
  schedulePosition: 'left',
  containerStyle: 'glass', containerShape: 'rounded', containerFill: true,
  image: `/wallpapers/scenic/${id}/mobile.png`,
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [
    device, `/wallpapers/scenic/${id}/${device}.png`,
  ])),
}));
