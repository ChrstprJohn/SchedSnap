
export const designCollections = [
  { id: 'all', name: 'All designs' },
  { id: 'sanrio', name: 'Sanrio' },
  { id: 'we-bare-bears', name: 'We Bare Bears' },
  { id: 'domo', name: 'Domo' },
  { id: 'adventure-time', name: 'Adventure Time' },
  { id: 'chiikawa', name: 'Chiikawa' },
  { id: 'ghibli', name: 'Ghibli' },
  { id: 'meep', name: 'Meep' },
  { id: 'pattern', name: 'Patterns & prints' },
];

export const getTemplateCollection = (template) => (['chikawa', 'little-friends'].includes(template.collection) ? 'chiikawa' : template.collection) || 'original';

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
export const galleryCategories = [...designCollections];

export function matchesGalleryCategory(template, category) {
  return category === 'all' || getTemplateCollection(template) === (['chikawa', 'little-friends'].includes(category) ? 'chiikawa' : category);
}
