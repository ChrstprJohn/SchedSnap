import test from 'node:test';
import assert from 'node:assert/strict';
import { designGalleryCategories, matchesDesignGalleryCategory } from '../src/utils/galleryCategories.js';

test('one Chiikawa filter includes both collections without duplicating filters', () => {
  assert.equal(designGalleryCategories.filter(category => category.name === 'chiikawa').length, 1);
  assert.equal(new Set(designGalleryCategories.map(category => category.id)).size, designGalleryCategories.length);
  assert.equal(matchesDesignGalleryCategory({ collection: 'chikawa' }, 'little-friends'), true);
  assert.equal(matchesDesignGalleryCategory({ collection: 'little-friends' }, 'little-friends'), true);
  assert.equal(matchesDesignGalleryCategory({ collection: 'sanrio' }, 'little-friends'), false);
  assert.equal(matchesDesignGalleryCategory({ collection: 'sanrio' }, 'all'), true);
});
