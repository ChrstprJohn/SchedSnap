import test from 'node:test';
import assert from 'node:assert/strict';
import { onepieceAdventureTemplates } from '../src/assets/onepieceAdventureTemplates.js';
import { wallpaperTemplates } from '../src/assets/templates.js';
import { galleryCategories } from '../src/config/collections.js';
import { templateSchema } from '../shared/templateSchema.js';

test('removed One Piece collection is absent from gallery choices and accepted publication schema', () => {
  assert.equal(galleryCategories.some(category => category.id === 'onepiece'), false);
  for (const archived of onepieceAdventureTemplates) {
    assert.equal(wallpaperTemplates.some(t => t.id === archived.id), false, archived.id);
    assert.equal(templateSchema.safeParse({ ...archived, status: 'published' }).success, false);
  }
});
