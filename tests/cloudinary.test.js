import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../src/assets/cloudinaryManifest.js';
import { cloudinaryAssetUrl } from '../src/utils/cloudinaryAssets.js';
import { wallpaperTemplates } from '../src/assets/templates.js';

test('every built-in artwork has Cloudinary delivery without local originals', () => {
  for (const template of wallpaperTemplates) {
    for (const path of [template.image, ...Object.values(template.deviceImages || {})].filter(Boolean)) {
      const asset = manifest[path];
      assert.ok(asset, `${template.id}: missing uploaded artwork ${path}`);
      assert.match(asset.url, /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\//i);
      assert.ok(asset.width > 0 && asset.height > 0, path);
      assert.match(cloudinaryAssetUrl(path), /^https:\/\/res\.cloudinary\.com\//);
    }
  }
});

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

test('direct Cloudinary pixel masters without dimensions remain lossless and unscaled', () => {
  const url = 'https://res.cloudinary.com/example/image/upload/v123/schedsnap/images/pixel-mascots/masters/pixel-cat-0123456789abcdef.png';
  assert.equal(cloudinaryAssetUrl(url), url.replace('/image/upload/', '/image/upload/f_png/'));
});
