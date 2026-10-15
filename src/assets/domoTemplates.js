import { domoReferenceAdditions } from './characterReferenceTemplates.js';
// Reference-inspired artwork; schedules are rendered separately by Canvas.
const createdAt = '2026-10-13T13:39:17.875Z';
const designs = [
  ["golden-paper","Golden Paper Domo","reference","#fff0c3","Golden Domo outlines and stars on warm textured paper.","2026-10-13T23:51:45.671Z"],
  ["brown-face","Brown Domo Face","reference","#704a34","A simple handmade Domo face on warm brown.","2026-10-13T23:52:08.336Z"],
  ['star-stickers', 'Star Stickers', 'celestial', '#54351f', 'Cream stars and a waving Domo sticker'],
  ['orbit-paper', 'Orbit Paper', 'celestial', '#684329', 'Paper-cut planets and celestial Domo'],
  ['velvet-cosmos', 'Velvet Cosmos', 'celestial', '#35231b', 'Soft textile stars in a chocolate cosmos'],
  ['plaid-notes', 'Plaid Notes', 'plaid', '#ead4b9', 'Warm plaid and a peeking Domo'],
  ['tartan-sketch', 'Tartan Sketch', 'plaid', '#eee0c9', 'Hand-drawn Domo over muted tartan'],
  ['gingham-cutout', 'Gingham Cutout', 'plaid', '#eee0c9', 'Layered gingham and playful paper cutouts'],
  ['caramel-outline', 'Caramel Outline', 'outline', '#704313', 'Oversized cream Domo outlines on caramel'],
  ['chalk-stars', 'Chalk Stars', 'outline', '#624637', 'Chalk-drawn Domo and quiet star accents'],
  ['cut-paper', 'Cut Paper', 'outline', '#78522e', 'Torn cream paper silhouettes on warm brown'],
  ['gingham-memory', 'Gingham Memory', 'scrapbook', '#e9dfce', 'Domo plush memories and gingham scraps'],
  ['lace-journal', 'Lace Journal', 'scrapbook', '#eee5d5', 'Cream lace, bows, and a cozy Domo journal'],
  ['pixel-scrapbook', 'Pixel Scrapbook', 'scrapbook', '#e6d6ba', 'Pixel Domo stickers in a tactile scrapbook'],
];

export const domoTemplates = [...domoReferenceAdditions, ...designs.map(([slug, name, family, background, description, designCreatedAt = createdAt]) => {
  const id = `domo-${slug}`;
  const dark = family === 'celestial' || family === 'outline' || slug === 'brown-face';
  const deviceImages = Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/${id}/${device}.png`]));
  return {
    id, name, description, family: `domo-${family}`, collection: 'domo',
    background, ink: dark ? '#fff0d7' : '#38261d', muted: dark ? '#efd3ae' : '#624938',
    surface: dark ? '#38261d' : '#fff5e8', line: '#b99b80',
    image: deviceImages.mobile, deviceImages, createdAt: designCreatedAt,
    schedulePosition: family === 'reference' ? 'left' : 'center', particleStyle: 'none', containerStyle: 'solid',
  };
})];
