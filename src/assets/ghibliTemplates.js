// One handmade reference composition per design, drawn for each device format.
const createdAt = '2026-10-14T08:46:20.000Z';
const designs = [
  ['jiji-sage-paper', 'Jiji Sage Paper', '#e0e3c9'],
  ['sage-collage', 'Sage Sticker Collage', '#e8ddcb'],
  ['flower-grid', 'Flower Grid', '#f8f0e4'],
  ['gingham-border', 'Gingham Border', '#f5eddf'],
  ['forest-star', 'Forest Star Scrapbook', '#f7efe3'],
  ['tilted-stamps', 'Tilted Stamp Notes', '#f7efe3'],
  ['spiral-notes', 'Spiral Forest Notes', '#f7efe3'],
  ['sage-wash', 'Sage Wash Friends', '#e0e5ca'],
  ['totoro-closeup', 'Totoro Close-Up', '#797975'],
  ['notebook-scrapbook', 'Notebook Scrapbook', '#f0e3bd'],
];

export const ghibliTemplates = designs.map(([slug, name, background]) => {
  const id = `ghibli-${slug}`;
  const ink = slug === 'totoro-closeup' ? '#172015' : '#3f503b';
  return {
    id, name, description: 'Soft handmade Ghibli stationery for your timetable',
    collection: 'ghibli', family: slug === 'totoro-closeup' ? 'ghibli-closeup' : 'ghibli-stationery',
    background, ink, muted: ink, surface: '#faf5e8', line: '#879277',
    containerStyle: 'glass', containerFill: true, containerShape: 'pill',
    particleStyle: 'none', schedulePosition: 'left', createdAt: slug === 'jiji-sage-paper' ? '2026-10-15T11:49:16.278Z' : createdAt,
    ...(slug === 'totoro-closeup' ? { verticalPosition: -40 } : {}),
    image: `/wallpapers/scenic/${id}/mobile.png`,
    deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/${id}/${device}.png`])),
  };
});
