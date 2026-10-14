import { galleryCategories, matchesGalleryCategory } from '../config/collections.js';

export const designGalleryCategories = galleryCategories
  .filter(category => category.id !== 'chikawa')
  .map(category => category.id === 'little-friends' ? { ...category, name: 'Chiikawa' } : category);

export function matchesDesignGalleryCategory(template, category) {
  return category === 'little-friends'
    ? ['little-friends', 'chikawa'].includes(template.collection)
    : matchesGalleryCategory(template, category);
}
