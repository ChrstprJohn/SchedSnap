export const mascotStyles = [
  { id: 'all', name: 'All styles' },
  { id: '3d', name: '3D' },
  { id: 'pixel', name: 'Pixel art' },
  { id: 'doodle', name: 'Doodles' },
  { id: 'flat', name: 'Flat art' },
];

export function getMascotStyle(template) {
  if (template.layout !== 'mascot' || template.collection !== 'mascot') return null;
  if (template.mascotStyle === 'soft' || template.mascotStyle === 'goofy') return '3d';
  if (template.mascotStyle === 'pixel' || template.mascotStyle === 'doodle') return template.mascotStyle;
  return 'flat';
}
