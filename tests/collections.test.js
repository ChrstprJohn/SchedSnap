import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryCategories, matchesGalleryCategory } from '../src/config/collections.js';

test('shared gallery categories include the Onepiece collection and style filters', () => {
  assert.deepEqual(galleryCategories.map(category => category.id), ['all', 'scenic', 'onepiece', 'little-friends', 'mascot', 'pattern', 'style-3d', 'style-pixel', 'style-doodle', 'style-flat']);
});

test('catalog metadata matches parent collections and their style filters', () => {
  const design = { collection: 'mascot', layout: 'mascot', mascotStyle: 'goofy' };
  assert.equal(matchesGalleryCategory(design, 'all'), true);
  assert.equal(matchesGalleryCategory(design, 'mascot'), true);
  assert.equal(matchesGalleryCategory(design, 'style-3d'), true);
  assert.equal(matchesGalleryCategory(design, 'style-pixel'), false);
  assert.equal(matchesGalleryCategory({ collection: 'little-friends', layout: 'mascot' }, 'style-flat'), false);
  assert.equal(matchesGalleryCategory({ collection: 'scenic' }, 'scenic'), true);
  assert.equal(matchesGalleryCategory({ collection: 'onepiece' }, 'onepiece'), true);
  assert.equal(matchesGalleryCategory({ collection: 'onepiece' }, 'scenic'), false);
});
