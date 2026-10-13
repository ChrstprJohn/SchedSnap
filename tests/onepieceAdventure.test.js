import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { onepieceAdventureTemplates as onepieceTemplates } from '../src/assets/onepieceAdventureTemplates.js';
import { wallpaperTemplates, deviceResolutions } from '../src/assets/templates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import manifest from '../src/assets/cloudinaryManifest.js';

test('Onepiece contains 12 unique published-ready designs with 36 exact device backgrounds', () => {
  assert.equal(onepieceTemplates.length, 12);
  assert.equal(new Set(onepieceTemplates.map(template => template.id)).size, 12);
  const paths = new Set();
  for (const template of onepieceTemplates) {
    assert.equal(template.collection, 'onepiece');
    assert.equal(matchesGalleryCategory(template, 'onepiece'), true);
    assert.equal(wallpaperTemplates.filter(item => item.id === template.id).length, 1);
    templateSchema.parse({ ...template, status: 'published' });
    assert.equal(template.image, template.deviceImages.mobile);
    for (const [device, { width, height }] of Object.entries(deviceResolutions)) {
      const path = template.deviceImages[device];
      paths.add(path);
      assert.equal(manifest[path]?.width, width, path);
      assert.equal(manifest[path]?.height, height, path);
      const local = new URL(`../public${path}`, import.meta.url);
      if (existsSync(local)) {
        const png = readFileSync(local);
        assert.equal(png.subarray(1, 4).toString(), 'PNG');
        assert.equal(png.readUInt32BE(16), width, path);
        assert.equal(png.readUInt32BE(20), height, path);
      }
    }
  }
  assert.equal(paths.size, 36);
});

test('each supplied reference contributes three Onepiece variants', () => {
  const metadata = [1, 2, 3, 4].map(index => JSON.parse(readFileSync(new URL(`../documentation/onepiece-adventure-reference-${index}.json`, import.meta.url), 'utf8')));
  assert.equal(metadata.length, 4);
  const ids = new Set(onepieceTemplates.map(template => template.id));
  for (const record of metadata) {
    assert.ok(JSON.stringify(record).includes('image-'), 'Reference source recorded');
    assert.equal(record.variants.length, 3);
    for (const variant of record.variants) {
      assert.ok(ids.has(variant.id), variant.id);
      assert.equal(variant.assets.length, 3);
      assert.equal(new Set(variant.assets.map(asset => asset.device)).size, 3);
      assert.ok(variant.assets.every(asset => asset.prompt && asset.sourcePath));
    }
  }
});
