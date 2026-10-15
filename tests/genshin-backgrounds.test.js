import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryCategories, matchesGalleryCategory } from '../src/config/collections.js';
import { templateSchema } from '../shared/templateSchema.js';
import { genshinBackgroundTemplates } from '../src/assets/genshinBackgroundTemplates.js';
import { deviceResolutions } from '../src/assets/templates.js';
import { readFileSync } from 'node:fs';

test('Genshin backgrounds appear in the main Genshin filter with schedule-safe settings', () => {
  assert.ok(galleryCategories.some(category => category.id === 'genshin' && category.name === 'Genshin'));
  const template = { ...genshinBackgroundTemplates[0], status: 'published' };
  const parsed = templateSchema.parse(template);
  assert.equal(matchesGalleryCategory(parsed, 'genshin'), true);
  assert.equal(matchesGalleryCategory(parsed, 'scenic'), false);
  assert.equal(parsed.artworkFooter, false);
  assert.equal(parsed.showScheduleTitle, true);
});

test('the eleven namecard and sky designs have all three exact opaque image assets', () => {
  assert.equal(genshinBackgroundTemplates.length, 11);
  assert.equal(genshinBackgroundTemplates.some(template => template.id.includes('columbina')), false);
  for (const template of genshinBackgroundTemplates) {
    assert.equal(template.collection, 'genshin');
    templateSchema.parse({ ...template, status: 'published' });
    for (const resolution of Object.values(deviceResolutions)) {
      const png = readFileSync(new URL(`../public${template.deviceImages[resolution.id]}`, import.meta.url));
      assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', template.id);
      assert.equal(png.readUInt32BE(16), resolution.width, template.id);
      assert.equal(png.readUInt32BE(20), resolution.height, template.id);
    }
  }
});
