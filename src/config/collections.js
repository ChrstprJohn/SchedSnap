import { mascotStyles, getMascotStyle } from './mascotStyles.js';

export const designCollections = [
  { id: 'all', name: 'All designs' },
  { id: 'scenic', name: 'Illustrated' },
  { id: 'sanrio', name: 'Sanrio' },
  { id: 'domo', name: 'Domo' },
  { id: 'chikawa', name: 'Chiikawa' },
  { id: 'little-friends', name: 'Chiikawa inspired' },
  { id: 'mascot', name: 'Mascots' },
  { id: 'meep', name: 'Meep' },
  { id: 'pattern', name: 'Patterns & prints' },
];

export const getTemplateCollection = (template) => template.collection || 'original';

export const scenicFamilies = [
  { id: 'tropical-botanical', name: 'Tropical botanicals' },
  { id: 'paper-stationery', name: 'Paper & stationery' },
  { id: 'mountain-dawn', name: 'Mountain dawn' },
  { id: 'abstract-waves', name: 'Blue abstract waves' },
  { id: 'comic-graphics', name: 'Comic graphics' },
  { id: 'moonlit-blossoms', name: 'Moonlit blossoms' },
  { id: 'sunset-travelers', name: 'Sunset travelers' },
  { id: 'cozy-city', name: 'Cozy city' },
  { id: 'floral-skies', name: 'Floral skies' },
  { id: 'alpine-landscapes', name: 'Alpine landscapes' },
  { id: 'anime-adventures', name: 'Illustrated adventures' },
  { id: 'blossom-clouds', name: 'Blossom clouds' },
  { id: 'color-contours', name: 'Colorful paper contours' },
];

// Styles are gallery filters; stored designs retain their parent collection.
export const galleryCategories = [...designCollections, ...mascotStyles.filter(style => style.id !== 'all').map(style => ({ id: `style-${style.id}`, name: style.name }))];

export function matchesGalleryCategory(template, category) {
  return category === 'all' || (category.startsWith('style-')
    ? getMascotStyle(template) === category.slice(6)
    : getTemplateCollection(template) === category);
}
