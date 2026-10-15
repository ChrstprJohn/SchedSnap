import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { chikawaReferenceTemplates as chikawaTemplates } from '../src/assets/chikawaReferenceTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { templateSchema } from '../shared/templateSchema.js';

test('Chiikawa has 12 unique designs, four reference families, and 36 current device uploads', () => {
  assert.equal(chikawaTemplates.length, 12);
  assert.equal(new Set(chikawaTemplates.map(t => t.id)).size, 12);
  const families = new Map();
  const hashes = new Set();
  const sizes = { mobile: [1080, 2400], tablet: [1600, 2560], laptop: [1920, 1080] };
  for (const template of chikawaTemplates) {
    templateSchema.parse({ ...template, status: 'published' });
    assert.equal(template.collection, 'chiikawa');
    families.set(template.family, (families.get(template.family) || 0) + 1);
    for (const [device, [width, height]] of Object.entries(sizes)) {
      const path = template.deviceImages[device];
      assert.equal(path, `/wallpapers/scenic/${template.id}/${device}.png`);
      const uploaded = manifest[path];
      assert.equal(uploaded?.width, width, path);
      assert.equal(uploaded?.height, height, path);
      const local = new URL(`../public${path}`, import.meta.url);
      if (existsSync(local)) {
        const bytes = readFileSync(local);
        assert.equal(bytes.readUInt32BE(16), width);
        assert.equal(bytes.readUInt32BE(20), height);
        const hash = createHash('sha256').update(bytes).digest('hex');
        assert.equal(uploaded.publicId, `schedsnap${path.slice(0, -4)}-${hash.slice(0, 16)}`);
        hashes.add(hash);
      } else hashes.add(uploaded.publicId);
    }
  }
  assert.equal(families.size, 4);
  assert.deepEqual([...families.values()], [3, 3, 3, 3]);
  assert.equal(hashes.size, 36);
});
