import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../src/assets/cloudinaryManifest.js';
import { genshinChibiTemplates } from '../src/assets/genshinChibiTemplates.js';
import { wallpaperTemplates, deviceResolutions } from '../src/assets/templates.js';
import { templateSchema } from '../shared/templateSchema.js';

test('five chibi backgrounds are selectable and have fifteen Cloudinary device assets', () => {
  assert.equal(genshinChibiTemplates.length, 5);
  assert.equal(wallpaperTemplates.some(template => template.id === 'genshin-paimon-starlight'), false);
  const paths = new Set();
  for (const template of genshinChibiTemplates) {
    templateSchema.parse({ ...template, status: 'published' });
    assert.equal(template.collection, 'genshin');
    assert.equal(wallpaperTemplates.filter(item => item.id === template.id).length, 1);
    for (const device of Object.values(deviceResolutions)) {
      const path = template.deviceImages[device.id];
      paths.add(path);
      const asset = manifest[path];
      assert.ok(asset, path);
      assert.match(asset.url, /^https:\/\/res\.cloudinary\.com\/.*\.png$/);
      assert.equal(asset.width, device.width, path);
      assert.equal(asset.height, device.height, path);
    }
  }
  assert.equal(paths.size, 15);
});
