import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryCategories, matchesGalleryCategory } from '../src/config/collections.js';
import { templateSchema } from '../shared/templateSchema.js';
import { genshinBackgroundTemplates } from '../src/assets/genshinBackgroundTemplates.js';
import { deviceResolutions } from '../src/assets/templates.js';
import manifest from '../src/assets/cloudinaryManifest.js';

test('Genshin backgrounds appear in the main Genshin filter with schedule-safe settings', () => {
  assert.ok(galleryCategories.some(category => category.id === 'genshin' && category.name === 'Genshin'));
  const template = { ...genshinBackgroundTemplates[0], status: 'published' };
  const parsed = templateSchema.parse(template);
  assert.equal(matchesGalleryCategory(parsed, 'genshin'), true);
  assert.equal(matchesGalleryCategory(parsed, 'scenic'), false);
  assert.equal(parsed.artworkFooter, false);
  assert.equal(parsed.showScheduleTitle, true);
});

test('the nineteen namecard and sky designs have Cloudinary PNG assets at each device resolution', () => {
  assert.equal(genshinBackgroundTemplates.length, 19);
  assert.equal(genshinBackgroundTemplates.some(template => template.id.includes('columbina')), false);
  for (const template of genshinBackgroundTemplates) {
    assert.equal(template.collection, 'genshin');
    templateSchema.parse({ ...template, status: 'published' });
    for (const resolution of Object.values(deviceResolutions)) {
      const asset = manifest[template.deviceImages[resolution.id]];
      assert.ok(asset, template.id);
      assert.match(asset.url, /^https:\/\/res\.cloudinary\.com\/.*\.png$/);
      assert.equal(asset.width, resolution.width, template.id);
      assert.equal(asset.height, resolution.height, template.id);
    }
  }
});
