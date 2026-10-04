export const designCollections = [
  { id: 'all', name: 'All designs' },
  { id: 'little-friends', name: 'Chiikawa inspired' },
  { id: 'mascot', name: 'Mascots' },
  { id: 'pattern', name: 'Patterns & prints' },
  { id: 'original', name: 'Originals' },
];

export const getTemplateCollection = (template) => template.collection || 'original';
