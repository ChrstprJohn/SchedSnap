import test from 'node:test';
import assert from 'node:assert/strict';
import { templateSchema } from '../shared/templateSchema.js';
import { hunterTemplates } from '../src/assets/hunterTemplates.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { readFileSync } from 'node:fs';
import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';
import { galleryPreviewTemplate, customizeWallpaperTemplate } from '../src/utils/wallpaperTheme.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { templateSchedule, deviceResolutions } from '../src/assets/templates.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';

const template = {
  id: 'hxh-gon-plain', name: 'Gon', collection: 'hunter-x-hunter', status: 'published', mobileOnly: true,
  background: '#eef4ea', ink: '#223322', muted: '#223322', surface: '#ffffffee', line: '#22332245',
  image: '/wallpapers/scenic/hxh-gon-plain/mobile.png',
  deviceImages: { mobile: '/wallpapers/scenic/hxh-gon-plain/mobile.png' },
};

test('Hunter manga and plain use consistent reference-style presets per variant', () => {
  for (const family of ['manga', 'plain']) {
    const designs = hunterTemplates.filter(item => item.family === family);
    for (const schedule of [templateSchedule, sampleSchedule]) {
      const bounds = [];
      for (const item of designs) {
        assert.equal(item.containerStyle, 'glass');
        assert.equal(item.containerShape, 'pill');
        assert.equal(item.showTitle, family === 'manga');
        assert.equal(item.verticalPosition, family === 'manga' ? -20 : -30);
        const ctx = new Proxy({ measureText(value) { return { width: value.length * 20 }; }, createLinearGradient: () => ({ addColorStop() {} }) }, {
          get: (target, key) => key in target ? target[key] : ['canvas', 'getTransform'].includes(key) ? undefined : () => {},
        });
        const render = preset => drawWallpaper({ getContext: () => ctx }, { schedule, template: preset, resolution: deviceResolutions.mobile });
        const editor = render(customizeWallpaperTemplate(item, {}, 'mobile'));
        assert.equal(editor.overflow, false, item.id);
        assert.deepEqual(render(galleryPreviewTemplate(item)).scheduleBounds, editor.scheduleBounds, item.id);
        bounds.push(editor.scheduleBounds);
        assert.equal(customizeWallpaperTemplate(item, { verticalPosition: 10, surface: '#123456', showScheduleTitle: true }, 'mobile').surface, '#123456');
      }
      assert.ok(bounds.every(value => JSON.stringify(value) === JSON.stringify(bounds[0])), family);
    }
  }
});

test('Hunter chibi schedules fit below the character and match gallery and editor placement', () => {
  for (const item of hunterTemplates.filter(item => item.family === 'chibi')) {
    assert.equal(item.containerOpacity, 85);
    assert.equal(item.fontScale, 0.9);
    assert.equal(item.showTitle, false);
    const ctx = new Proxy({ measureText(value) { return { width: value.length * 20 }; }, createLinearGradient: () => ({ addColorStop() {} }) }, {
      get: (target, key) => key in target ? target[key] : ['canvas', 'getTransform'].includes(key) ? undefined : () => {},
    });
    const render = (preset, schedule) => drawWallpaper({ getContext: () => ctx }, { schedule, template: preset, resolution: deviceResolutions.mobile });
    for (const schedule of [templateSchedule, sampleSchedule]) {
      const editor = render(customizeWallpaperTemplate(item, {}, 'mobile'), schedule);
      assert.equal(editor.overflow, false, item.id);
      assert.ok(editor.plans[0].y >= 1240, item.id);
      assert.ok(editor.bottom <= 2250, item.id);
      assert.deepEqual(render(galleryPreviewTemplate(item), schedule).scheduleBounds, editor.scheduleBounds, item.id);
    }
    const crowded = { classes: Array.from({ length: 40 }, () => sampleSchedule.classes[0]) };
    assert.equal(render(item, crowded).overflow, true);
    assert.equal(customizeWallpaperTemplate(galleryPreviewTemplate(item), { verticalPosition: -25 }, 'mobile').verticalPosition, -25);
  }
});

test('mobile-only backgrounds publish with a matching mobile image', () => {
  assert.equal(templateSchema.parse(template).mobileOnly, true);
  assert.equal(templateSchema.safeParse({ ...template, mobileOnly: false }).success, false);
  assert.equal(templateSchema.safeParse({ ...template, deviceImages: {} }).success, false);
  assert.equal(templateSchema.safeParse({ ...template, image: '/wallpapers/other.png' }).success, false);
});

test('Hunter designs can be found by character, color, motif and anime category', () => {
  for (const [query, id] of [
    ['Gon red orange manga', 'hxh-gon-manga'],
    ['Leorio yellow orange', 'hxh-leorio-manga'],
    ['Hisoka pink manga', 'hxh-hisoka-manga'],
    ['Killua blue white hair chibi', 'hxh-killua-chibi'],
    ['Kurapika burgundy chain', 'hxh-kurapika-chibi'],
    ['Leorio teal glasses briefcase', 'hxh-leorio-chibi'],
    ['Gon sage seated', 'hxh-gon-chibi'],
  ]) {
    assert.ok(searchWallpaperTemplates(hunterTemplates, query).some(t => t.id === id), query);
  }
  assert.equal(searchWallpaperTemplates(hunterTemplates, 'anime').length, 15);
  for (const item of hunterTemplates) {
    assert.ok(item.keywords.length <= 500);
    assert.ok(item.keywords.includes(','));
  }
});

test('Hunter collection contains exactly fifteen mobile PNG templates', () => {
  assert.equal(hunterTemplates.length, 15);
  assert.equal(new Set(hunterTemplates.map(item => item.id)).size, 15);
  assert.deepEqual(['manga', 'plain', 'chibi', 'group'].map(family => hunterTemplates.filter(item => item.family === family).length), [5, 4, 4, 2]);
  for (const item of hunterTemplates) {
    assert.equal(matchesGalleryCategory(item, 'hunter-x-hunter'), true);
    assert.equal(templateSchema.parse({ ...item, status: 'published' }).mobileOnly, true);
    assert.deepEqual(Object.keys(item.deviceImages), ['mobile']);
    const png = readFileSync(new URL(`../public${item.image}`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1080);
    assert.equal(png.readUInt32BE(20), 2400);
  }
});
