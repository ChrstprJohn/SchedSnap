import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { sanrioTemplates } from '../src/assets/sanrioTemplates.js';
import { deviceResolutions, templateSchedule, wallpaperTemplates } from '../src/assets/templates.js';
import { designCollections, galleryCategories, matchesGalleryCategory } from '../src/config/collections.js';
import { templateSchema } from '../shared/templateSchema.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { cloudinaryAssetUrl } from '../src/utils/cloudinaryAssets.js';
import { prepareWallpaperAssets } from '../src/utils/wallpaperAssets.js';
import { galleryPreviewTemplate, customizeWallpaperTemplate } from '../src/utils/wallpaperTheme.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { artworkIds } from '../server/deleteArtwork.js';

test('immutable uploaded backgrounds can be published without requiring a new client manifest', () => {
  const deviceImages = Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `https://res.cloudinary.com/example/image/upload/v123/schedsnap/wallpapers/scenic/sanrio-melody-lace/${device}-0123456789abcdef.png`]));
  const template = { ...sanrioTemplates[0], status: 'published', image: deviceImages.mobile, deviceImages };
  assert.equal(templateSchema.safeParse(template).success, true);
  assert.equal(artworkIds(template, { CLOUDINARY_CLOUD_NAME: 'example' }).length, 3);
  assert.throws(() => artworkIds(template, { CLOUDINARY_CLOUD_NAME: 'foreign' }), /another account/);
  for (const image of [deviceImages.mobile.replace('-0123456789abcdef', ''), deviceImages.mobile.replace('https:', 'http:'), deviceImages.mobile.replace('res.cloudinary.com', 'example.com')]) {
    assert.equal(templateSchema.safeParse({ ...template, image, deviceImages: { ...deviceImages, mobile: image } }).success, false);
  }
});

test('Sanrio supplies forty-four selectable designs in fifteen families with 132 uploaded device compositions', () => {
  assert.equal(sanrioTemplates.length, 44);
  assert.equal(new Set(sanrioTemplates.map(template => template.id)).size, 44);
  assert.equal(designCollections.find(collection => collection.id === 'sanrio')?.name, 'Sanrio');
  assert.equal(galleryCategories.filter(category => category.id === 'sanrio').length, 1);
  const families = new Map();
  const hashes = new Set();
  for (const template of sanrioTemplates) {
    assert.equal(template.collection, 'sanrio');
    assert.equal(templateSchema.parse({ ...template, status: 'published' }).collection, 'sanrio');
    assert.equal(wallpaperTemplates.filter(item => item.id === template.id).length, 1);
    assert.equal(template.image, template.deviceImages.mobile);
    assert.equal(new Set(Object.values(template.deviceImages)).size, 3);
    families.set(template.family, (families.get(template.family) || 0) + 1);
    for (const [device, { width, height }] of Object.entries(deviceResolutions)) {
      const path = template.deviceImages[device];
      assert.equal(path, `/wallpapers/scenic/${template.id}/${device}.png`);
      const asset = manifest[path];
      assert.equal(asset?.width, width, path);
      assert.equal(asset?.height, height, path);
      assert.ok(asset.url.startsWith(`https://res.cloudinary.com/${asset.cloud}/image/upload/`), path);
      assert.ok(asset.url.endsWith(`/${asset.publicId}.png`), path);
      const local = new URL(`../public${path}`, import.meta.url);
      // PNG masters are gitignored; an uploaded composition remains required
      // when validating a clean checkout that does not retain local masters.
      if (existsSync(local)) {
        const png = readFileSync(local);
        assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        assert.equal(png.readUInt32BE(16), width, path);
        assert.equal(png.readUInt32BE(20), height, path);
        assert.equal(png[25], 2, 'Opaque RGB artwork');
        const hash = createHash('sha256').update(png).digest('hex');
        assert.equal(asset.publicId, `schedsnap${path.replace(/\.png$/, '')}-${hash.slice(0, 16)}`, path);
        hashes.add(hash);
      } else hashes.add(asset.publicId);
    }
  }
  assert.deepEqual(Object.fromEntries(families), { 'sanrio-cinnamon-reference': 4, 'sanrio-kuromi': 4, 'sanrio-cinnamon-bow': 3, 'sanrio-cinnamon-flower': 3, 'sanrio-cinnamon-lace': 3, 'sanrio-cinnamon-ribbon': 3, 'sanrio-stationery': 4, 'sanrio-melody': 4, 'sanrio-nursery': 2, 'sanrio-plush': 1, 'sanrio-friends': 1, 'sanrio-parade': 3, 'sanrio-pixel': 3, 'sanrio-tea': 3, 'sanrio-gingham': 3 });
  assert.equal(hashes.size, 132);
  assert.equal(templateSchema.safeParse({
    ...sanrioTemplates[0], status: 'published',
    deviceImages: { ...sanrioTemplates[0].deviceImages, tablet: undefined },
  }).success, false, 'Publishing still requires three device backgrounds');
});

test('Sanrio paths, creation dates and all prompts match the twenty-two source provenance records', () => {
  const records = ['cinnamon-reference', 'kuromi', 'cinnamon-bow', 'cinnamon-flower', 'cinnamon-lace', 'cinnamon-ribbon', 'parade', 'pixel', 'tea', 'gingham', 'kitty-nursery', 'melody-lace', 'melody-peek', 'melody-corner', 'melody-dream', 'kitty-vanity', 'plush-pals', 'friends-gingham', 'strawberry-patchwork', 'melody-bedtime', 'pastel-scrapbook', 'melody-piano-stationery'].flatMap(group => {
    const doc = JSON.parse(readFileSync(new URL(`../documentation/sanrio-${group}-prompts.json`, import.meta.url), 'utf8'));
    return doc.assets.map(asset => ({ ...asset, path: '/' + (asset.destination || asset.output).replace(/^public\//, ''),
      createdAt: asset.createdAt || doc.createdAt || doc.generatedAt }));
  });
  assert.equal(records.length, 132);
  for (const template of sanrioTemplates) {
    const mobile = records.find(record => record.path === template.image);
    assert.equal(template.createdAt, mobile.createdAt, template.id);
    assert.ok(Number.isFinite(Date.parse(template.createdAt)), template.id);
    for (const [device, path] of Object.entries(template.deviceImages)) {
      const record = records.find(item => item.path === path);
      assert.equal(record?.device, device, path);
      assert.ok(record.prompt && record.source, path);
    }
  }
});

test('Sanrio gallery samples match on mobile, tablet and laptop and load each device artwork', async () => {
  const originalDocument = globalThis.document;
  const originalImage = globalThis.Image;
  globalThis.document = { fonts: { load: async () => [] } };
  globalThis.Image = class {
    set src(value) { this.source = value; queueMicrotask(() => this.onload()); }
  };
  const render = (template, resolution) => {
    const context = new Proxy({ measureText(text) { return { width: text.length * 20 }; },
      createLinearGradient() { return { addColorStop() {} }; } }, {
      get(target, key) { return key in target ? target[key] : ['canvas', 'getTransform'].includes(key) ? undefined : () => {}; },
    });
    return drawWallpaper({ getContext: () => context }, { schedule: templateSchedule, template, resolution });
  };
  try {
    for (const [device, resolution] of Object.entries(deviceResolutions)) {
      const originalCopies = structuredClone(sanrioTemplates);
      const expectedBounds = render({ ...customizeWallpaperTemplate(galleryPreviewTemplate(sanrioTemplates[0]), {}, device), schedulePosition: 'center' }, resolution).scheduleBounds;
      for (const original of sanrioTemplates) {
        assert.equal(matchesGalleryCategory(original, 'sanrio'), true);
        assert.equal(matchesGalleryCategory(original, 'all'), true);
        assert.equal(matchesGalleryCategory(original, 'scenic'), false);
        const template = customizeWallpaperTemplate(galleryPreviewTemplate(original), {}, device);
        const image = await prepareWallpaperAssets(template, resolution);
        assert.equal(image.source, cloudinaryAssetUrl(original.deviceImages[device], original.pixelArt ? undefined : resolution));
        const result = render(template, resolution);
        assert.equal(result.overflow, false, `${original.id}/${device}`);
        const bounds = device === 'laptop' && (original.family.startsWith('sanrio-cinnamon-') || original.family === 'sanrio-kuromi')
          ? render({ ...customizeWallpaperTemplate(galleryPreviewTemplate(sanrioTemplates[0]), {}, device), schedulePosition: 'left' }, resolution).scheduleBounds
          : expectedBounds;
        assert.deepEqual(result.scheduleBounds, bounds, `${original.id}/${device}`);
      }
      assert.deepEqual(sanrioTemplates, originalCopies, 'Gallery preview must not mutate editor defaults');
    }
  } finally {
    globalThis.document = originalDocument;
    globalThis.Image = originalImage;
  }
});
