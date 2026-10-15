import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { genshinChibiTemplates } from '../src/assets/genshinChibiTemplates.js';
import { wallpaperTemplates, deviceResolutions } from '../src/assets/templates.js';
import { templateSchema } from '../shared/templateSchema.js';

test('five chibi backgrounds are selectable and have fifteen exact device assets', () => {
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
      const png = readFileSync(new URL('../public' + path, import.meta.url));
      assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      assert.equal(png.readUInt32BE(16), device.width, path);
      assert.equal(png.readUInt32BE(20), device.height, path);
    }
  }
  assert.equal(paths.size, 15);
});
