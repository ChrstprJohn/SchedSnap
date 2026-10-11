import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../src/assets/cloudinaryManifest.js';
import { cloudinaryAssetUrl } from '../src/utils/cloudinaryAssets.js';

test('unmapped images retain their local path', () => {
  assert.equal(cloudinaryAssetUrl('/unmapped.png', { width: 540, height: 1200 }), '/unmapped.png');
  assert.equal(cloudinaryAssetUrl(undefined), undefined);
});

test('mapped previews are resized without cropping; export artwork stays PNG', () => {
  const path = Object.keys(manifest)[0];
  assert.ok(path, 'Upload at least one artwork before testing delivery URLs');
  assert.match(cloudinaryAssetUrl(path, { width: 540, height: 1200 }), /c_limit,w_540,h_1200\/f_auto,q_auto:good\//);
  assert.match(cloudinaryAssetUrl(path, { width: 1080, height: 2400 }), /c_limit,w_1080,h_2400\/f_png\//);
  assert.match(cloudinaryAssetUrl(path, { width: 1920, height: 1080 }), /f_png\//);
});
