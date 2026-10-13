import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { onepieceTemplates } from '../src/assets/onepieceTemplates.js';
import { wallpaperTemplates, deviceResolutions } from '../src/assets/templates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';

test('12 reference-inspired Chiikawa designs have 36 exact device backgrounds', () => {
  assert.equal(onepieceTemplates.length, 12);
  assert.equal(new Set(onepieceTemplates.map(template => template.id)).size, 12);
  const paths = new Set();
  for (const template of onepieceTemplates) {
    assert.equal(matchesGalleryCategory(template, 'little-friends'), true);
    assert.equal(matchesGalleryCategory(template, 'onepiece'), false);
    assert.equal(wallpaperTemplates.filter(item => item.id === template.id).length, 1);
    templateSchema.parse({ ...template, status: 'published' });
    for (const [device, { width, height }] of Object.entries(deviceResolutions)) {
      const path = template.deviceImages[device];
      paths.add(path);
      const png = readFileSync(new URL(`../public${path}`, import.meta.url));
      assert.equal(png.subarray(1, 4).toString(), 'PNG');
      assert.equal(png.readUInt32BE(16), width, path);
      assert.equal(png.readUInt32BE(20), height, path);
    }
  }
  assert.equal(paths.size, 36);
});

test('each reference contributes three designs with all three device compositions', () => {
  const paths = new Set();
  for (const index of [1, 2, 3, 4]) {
    const record = JSON.parse(readFileSync(new URL(`../documentation/onepiece-reference-${index}.json`, import.meta.url), 'utf8'));
    assert.equal(record.reference, `image-${index}`);
    assert.equal(record.variants.length, 9);
    assert.equal(new Set(record.variants.map(variant => variant.id)).size, 3);
    for (const variant of record.variants) {
      const template = onepieceTemplates.find(item => item.id === variant.id);
      assert.ok(template, variant.id);
      assert.equal(variant.destination, `public${template.deviceImages[variant.device]}`);
      assert.equal(variant.width, deviceResolutions[variant.device].width);
      assert.equal(variant.height, deviceResolutions[variant.device].height);
      assert.ok(variant.prompt && variant.source);
      paths.add(variant.destination);
    }
  }
  assert.equal(paths.size, 36);
});
