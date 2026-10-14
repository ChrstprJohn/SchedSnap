import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { weBareBearsTemplates } from '../src/assets/weBareBearsTemplates.js';
import { wallpaperTemplates, deviceResolutions } from '../src/assets/templates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';

test('WBB catalog includes 12 designs backed by 36 approved immutable device uploads', () => {
  const review = JSON.parse(readFileSync(new URL('../output/we-bare-bears/manifest.json', import.meta.url)));
  assert.equal(weBareBearsTemplates.length, 12);
  assert.equal(new Set(review.assets.map(a => a.sha256)).size, 36);
  for (const definition of weBareBearsTemplates) {
    templateSchema.parse({ ...definition, status: 'published' });
    assert.equal(matchesGalleryCategory(definition, 'we-bare-bears'), true);
    assert.equal(wallpaperTemplates.filter(t => t.id === definition.id).length, 1);
    for (const [device, size] of Object.entries(deviceResolutions)) {
      const path = definition.deviceImages[device];
      const asset = review.assets.find(a => a.path === `public${path}`);
      assert.ok(asset?.visuallyReviewed && asset.opaque && asset.dimensionsValid, path);
      assert.equal(manifest[path].width, size.width);
      assert.equal(manifest[path].height, size.height);
      assert.equal(manifest[path].publicId, `schedsnap${path.slice(0, -4)}-${asset.sha256.slice(0, 16)}`);
    }
  }
});
