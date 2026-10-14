import test from 'node:test';
import assert from 'node:assert/strict';
import { domoTemplates } from '../src/assets/domoTemplates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { designCollections, matchesGalleryCategory } from '../src/config/collections.js';

test('Domo drafts have fourteen unique designs with three device paths and accepted catalog metadata', () => {
  assert.equal(domoTemplates.length, 14);
  assert.equal(new Set(domoTemplates.map(template => template.id)).size, 14);
  assert.equal(new Set(domoTemplates.map(template => template.family)).size, 5);
  assert.equal(designCollections.find(collection => collection.id === 'domo').name, 'Domo');
  for (const template of domoTemplates) {
    assert.equal(templateSchema.parse({ ...template, status: 'draft' }).collection, 'domo');
    assert.equal(matchesGalleryCategory(template, 'domo'), true);
    assert.equal(matchesGalleryCategory(template, 'scenic'), false);
    assert.equal(template.image, template.deviceImages.mobile);
    assert.equal(new Set(Object.values(template.deviceImages)).size, 3);
    assert.ok(Number.isFinite(Date.parse(template.createdAt)));
  }
});
