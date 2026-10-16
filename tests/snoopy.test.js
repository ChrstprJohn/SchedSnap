import test from 'node:test';
import assert from 'node:assert/strict';
import { snoopyTemplates } from '../src/assets/snoopyTemplates.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';
import { templateSchema } from '../shared/templateSchema.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { customizeWallpaperTemplate, galleryPreviewTemplate } from '../src/utils/wallpaperTheme.js';
import { deviceResolutions } from '../src/assets/templates.js';

test('Snoopy designs publish in their own category and are found through Peanuts and Woodstock', () => {
  assert.equal(snoopyTemplates.length, 8);
  for (const template of snoopyTemplates) {
    const parsed = templateSchema.parse({ ...template, status: 'published' });
    assert.equal(matchesGalleryCategory(parsed, 'snoopy'), true);
    assert.equal(matchesGalleryCategory(parsed, 'sanrio'), false);
  }
  for (const query of ['Snoopy', 'Peanuts', 'Woodstock']) {
    assert.deepEqual(new Set(searchWallpaperTemplates(snoopyTemplates, query)), new Set(snoopyTemplates));
  }
});

test('Snoopy sample and dense timetables retain all meetings on each device', () => {
  for (const design of snoopyTemplates) for (const [device, resolution] of Object.entries(deviceResolutions)) {
    for (const count of [1, 3]) {
      const schedule = { classes: Array.from({ length: count }, (_, i) => ({
        subject: 'Computer Science', courseCode: `CS ${101 + i}`,
        meetings: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({
          day, startTime: `${8 + i * 3}:00`, endTime: `${9 + i * 3}:30`, room: 'Room 101',
        })),
      })) };
      const ctx = { font: '', measureText(text) { return { width: text.length * Number(this.font.match(/([\d.]+)px/)?.[1] || 36) * 0.52 }; },
        scale() {}, translate() {}, fillRect() {}, fillText() {}, beginPath() {}, roundRect() {}, arc() {}, fill() {}, stroke() {}, save() {}, restore() {}, moveTo() {}, lineTo() {} };
      const template = customizeWallpaperTemplate(galleryPreviewTemplate(design), {}, device);
      const result = drawWallpaper({ getContext: () => ctx }, { schedule, template, resolution });
      assert.equal(result.overflow, false, `${design.id}/${device}/${count}`);
      assert.equal(result.plans.flatMap(plan => plan.entries).length, count * 5);
      const height = device === 'mobile' ? 2400 : 1920 * resolution.height / resolution.width;
      assert.ok(result.scheduleBounds.y >= 0);
      assert.ok(result.scheduleBounds.y + result.scheduleBounds.height < height * (device === 'laptop' ? 0.965 : 0.70), `${device} footer remains clear`);
    }
  }
});
