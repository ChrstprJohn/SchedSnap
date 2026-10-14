import test from 'node:test';
import assert from 'node:assert/strict';
import { deviceResolutions, templateSchedule, wallpaperTemplates } from '../src/assets/templates.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { customizeWallpaperTemplate, galleryPreviewTemplate } from '../src/utils/wallpaperTheme.js';

function render(template, resolution) {
  const ctx = new Proxy({ measureText(text) { return { width: text.length * 20 }; },
    createLinearGradient() { return { addColorStop() {} }; } }, {
    get(target, key) { return key in target ? target[key] : ['canvas', 'getTransform'].includes(key) ? undefined : () => {}; },
  });
  return drawWallpaper({ getContext: () => ctx }, { schedule: templateSchedule, template, resolution });
}

test('all gallery phone samples share the same schedule bounds despite preset margins', () => {
  const expected = render(galleryPreviewTemplate(wallpaperTemplates[0]), deviceResolutions.mobile).scheduleBounds;
  for (const original of wallpaperTemplates) {
    const result = render(galleryPreviewTemplate(original), deviceResolutions.mobile);
    assert.equal(result.overflow, false, original.id);
    assert.deepEqual(result.scheduleBounds, expected, original.id);
  }
});

test('portrait tablet samples align while explicit user placement remains available', () => {
  const original = wallpaperTemplates.find(template => template.collection === 'chikawa');
  const originalCopy = structuredClone(original);
  const expected = render(customizeWallpaperTemplate(galleryPreviewTemplate(original), {}, 'tablet'), deviceResolutions.tablet).scheduleBounds;
  for (const template of wallpaperTemplates.filter(template => template.collection === 'chikawa')) {
    assert.deepEqual(render(customizeWallpaperTemplate(galleryPreviewTemplate(template), {}, 'tablet'), deviceResolutions.tablet).scheduleBounds, expected, template.id);
  }
  const moved = customizeWallpaperTemplate(galleryPreviewTemplate(original), { verticalPosition: 50 }, 'mobile');
  assert.notDeepEqual(render(moved, deviceResolutions.mobile).scheduleBounds, render(galleryPreviewTemplate(original), deviceResolutions.mobile).scheduleBounds);
  assert.deepEqual(original, originalCopy);
});
