import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { genshinElementalTemplates } from '../src/assets/genshinElementalTemplates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { galleryPreviewTemplate } from '../src/utils/wallpaperTheme.js';

test('eight local elemental previews have exact device assets and retain lower schedule placement', () => {
  assert.equal(genshinElementalTemplates.length, 8);
  for (const template of genshinElementalTemplates) {
    templateSchema.parse(template);
    assert.equal(galleryPreviewTemplate(template).verticalPosition, 100);
    for (const [device, size] of Object.entries({ mobile: [1080, 2400], tablet: [1600, 2560], laptop: [1920, 1080] })) {
      const bytes = readFileSync(new URL(`../public${template.deviceImages[device]}`, import.meta.url));
      assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], size);
    }
  }
});
