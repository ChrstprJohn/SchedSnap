// Reusable transparent Meep expressions; Canvas supplies each device layout.
const createdAt = '2026-10-14T03:11:36.000Z';
const newCreatedAt = '2026-10-14T06:37:24.000Z';
const latestCreatedAt = '2026-10-14T08:09:41.000Z';
const designs = [
  ['tongue', 'Meep Tongue', '#fff4d8', 'dots', '#eadbb3'],
  ['unsure', 'Meep Unsure', '#f9efd3', 'grid', '#c8b48a'],
  ['sweat', 'Meep Sweat', '#fff7e3', 'dots', '#e8d9b1'],
  ['angry', 'Meep Grumpy', '#f6e8c9', 'stripes', '#efe0ba'],
  ['dizzy', 'Meep Dizzy', '#fff2cf', 'checker', '#f2e4ba'],
  ['surprised', 'Meep Surprised', '#fff4d8', 'grid', '#ccb78c'],
  ['laughing-tongue', 'Meep Laughing Tongue', '#fff2cf', 'dots', '#ead6a6'],
  ['heart-eyes', 'Meep Heart Eyes', '#fff4d8', 'checker', '#f2e4bf'],
  ['blush', 'Meep Blush', '#fff7e3', 'dots', '#e9d7ad'],
  ['angel', 'Meep Angel', '#fff5d9', 'stripes', '#f0e1b8'],
  ['happy-tears', 'Meep Happy Tears', '#fff7e3', 'grid', '#ccb78c'],
  ['giddy', 'Meep Giddy', '#fff4d8', 'checker', '#f1e1b8'],
  ['puffed-cheeks', 'Meep Puffed Cheeks', '#fff2cf', 'dots', '#e8d6a6'],
  ['smile', 'Meep Smile', '#fff4d8', 'grid', '#ccb78c'],
  ['unamused', 'Meep Unamused', '#f9efd3', 'dots', '#eadbb3'],
  ['wink', 'Meep Wink', '#fff7e3', 'dots', '#e9d7ad'],
];

export const meepTemplates = designs.map(([expression, name, background, pattern, patternColor], index) => ({
  id: `meep-${expression}`, name,
  description: 'A classic yellow Meep expression below your schedule',
  collection: 'meep', layout: 'mascot', mascot: `meep-${expression}`,
  mascotStyle: 'goofy', mascotPosition: 'center', mascotSide: 'right',
  image: `/images/goofy-mascots/masters/meep-${expression}.png`,
  background, ink: '#51452b', muted: '#51452b', surface: '#ffffff', line: '#b7a988',
  ...(index % 2 === 1 ? { pattern, patternColor } : {}),
  containerStyle: 'glass', containerFill: true, containerShape: 'pill',
  particleStyle: 'none', pixelArt: false, createdAt: index < 5 ? createdAt : index < 13 ? newCreatedAt : latestCreatedAt,
}));
