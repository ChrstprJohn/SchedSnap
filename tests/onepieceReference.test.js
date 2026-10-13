import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { onepieceReferenceTemplates } from '../src/assets/onepieceReferenceTemplates.js';
import { wallpaperTemplates, deviceResolutions } from '../src/assets/templates.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { templateSchema } from '../shared/templateSchema.js';
import manifest from '../src/assets/cloudinaryManifest.js';

test('four One Piece reference families supply twelve unique designs and 36 exact opaque PNGs', () => {
  assert.equal(onepieceReferenceTemplates.length, 12);
  const hashes = new Set();
  const families = new Map();
  for (const template of onepieceReferenceTemplates) {
    templateSchema.parse({ ...template, status: 'published' });
    assert.equal(matchesGalleryCategory(template, 'onepiece'), true);
    assert.equal(wallpaperTemplates.filter(item => item.id === template.id).length, 1);
    assert.equal(template.image, template.deviceImages.mobile);
    families.set(template.family, (families.get(template.family) || 0) + 1);
    for (const [device, { width, height }] of Object.entries(deviceResolutions)) {
      const path = template.deviceImages[device];
      assert.equal(path, `/wallpapers/scenic/${template.id}/${device}.png`);
      assert.equal(manifest[path]?.width, width, path);
      assert.equal(manifest[path]?.height, height, path);
      const local = new URL(`../public${path}`, import.meta.url);
      // Originals are gitignored; deployed metadata remains required in clean checkouts.
      if (existsSync(local)) {
        const png = readFileSync(local);
        assert.equal(png.subarray(1, 4).toString(), 'PNG');
        assert.equal(png.readUInt32BE(16), width, path);
        assert.equal(png.readUInt32BE(20), height, path);
        assert.equal(png[25], 2, 'Opaque RGB artwork');
        hashes.add(createHash('sha256').update(png).digest('hex'));
      } else hashes.add(manifest[path].publicId);
    }
  }
  assert.equal(families.size, 4);
  assert.deepEqual([...families.values()], [3, 3, 3, 3]);
  assert.equal(hashes.size, 36, 'Every device composition is distinct');
});

test('every generated composition retains its exact prompt and source provenance', () => {
  const files = ['sunset', 'zoro', 'chopper', 'spirals', 'distinct-fruits'];
  const records = files.flatMap(family => {
    const doc = JSON.parse(readFileSync(new URL(`../documentation/onepiece-${family}-provenance.json`, import.meta.url), 'utf8'));
    assert.ok(doc.reference);
    return doc.assets || doc.records;
  });
  assert.equal(records.length, 36);
  for (const template of onepieceReferenceTemplates) {
    const assets = records.filter(record => record.id === template.id);
    assert.equal(assets.length, 3, template.id);
    assert.deepEqual(assets.map(asset => asset.device).sort(), ['laptop', 'mobile', 'tablet']);
    for (const asset of assets) {
      assert.ok(asset.prompt && (asset.source || asset.sourcePath), template.id);
    }
  }
});
