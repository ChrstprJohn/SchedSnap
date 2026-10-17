// One handmade reference composition per design, drawn for each device format.
const createdAt = '2026-10-14T08:46:20.000Z';
const newDesignsCreatedAt = '2026-10-15T12:06:51.350Z';
const newDesignSlugs = ['umbrella-friends', 'olive-umbrella', 'ink-totoro'];
const leafDesignsCreatedAt = '2026-10-15T12:36:01.105Z';
const leafDesignSlugs = ['cream-ink-frame', 'silver-totoro-peek', 'leaf-rain-friend'];
const raisedDesignSlugs = [...newDesignSlugs, ...leafDesignSlugs];
const designs = [
  ['cream-ink-frame', 'Cream Totoro Frame', '#f0e8d4'],
  ['silver-totoro-peek', 'Silver Totoro Peek', '#ffffff'],
  ['leaf-rain-friend', 'Leaf Rain Friend', '#ffffff'],
  ['umbrella-friends', 'Umbrella Friends', '#f5f4ef'],
  ['olive-umbrella', 'Olive Umbrella', '#ffffff'],
  ['ink-totoro', 'Totoro Ink Sketch', '#f5f5f5'],
  ['jiji-sage-paper', 'Jiji Sage Paper', '#e0e3c9'],
  ['sage-collage', 'Sage Sticker Collage', '#e8ddcb'],
  ['tilted-stamps', 'Tilted Stamp Notes', '#f7efe3'],
  ['totoro-closeup', 'Totoro Close-Up', '#797975'],
];

export const ghibliTemplates = designs.map(([slug, name, background]) => {
  const id = `ghibli-${slug}`;
  const ink = slug === 'totoro-closeup' ? '#172015' : ['ink-totoro', 'cream-ink-frame'].includes(slug) ? '#252525' : slug === 'umbrella-friends' ? '#34495c' : '#3f503b';
  return {
    id, name, description: 'Soft handmade Ghibli stationery for your timetable',
    collection: 'ghibli', family: (slug === 'totoro-closeup' || raisedDesignSlugs.includes(slug)) ? 'ghibli-closeup' : 'ghibli-stationery',
    background, ink, muted: ink, surface: '#faf5e8', line: '#879277',
    containerStyle: 'glass', containerFill: true, containerShape: 'pill',
    particleStyle: 'none', schedulePosition: 'left', createdAt: leafDesignSlugs.includes(slug) ? leafDesignsCreatedAt : newDesignSlugs.includes(slug) ? newDesignsCreatedAt : slug === 'jiji-sage-paper' ? '2026-10-15T11:49:16.278Z' : createdAt,
    ...((slug === 'totoro-closeup' || raisedDesignSlugs.includes(slug)) ? { verticalPosition: -40 } : {}),
    image: `/wallpapers/scenic/${id}/mobile.png`,
    deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/${id}/${device}.png`])),
  };
});
