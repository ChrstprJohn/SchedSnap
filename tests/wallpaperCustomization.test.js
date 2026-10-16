import test from 'node:test';
import assert from 'node:assert/strict';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { templateSchedule, deviceResolutions } from '../src/assets/templates.js';
import { sanrioTemplates } from '../src/assets/sanrioTemplates.js';
import { customizeWallpaperTemplate, snapSchedulePosition, wallpaperFontScale, wallpaperCornerRadius } from '../src/utils/wallpaperTheme.js';
import { templateSchema } from '../shared/templateSchema.js';

test('font size accepts 70–160 percent and defaults to 100 percent', () => {
  assert.equal(wallpaperFontScale({}), 1);
  assert.equal(wallpaperFontScale({ fontScale: NaN }), 1);
  assert.equal(wallpaperFontScale({ fontScale: 0.1 }), 0.7);
  for (const fontScale of [0.7, 0.8, 0.9, 1, 1.6]) {
    assert.equal(wallpaperFontScale({ fontScale }), fontScale);
    assert.equal(templateSchema.parse({ ...sanrioTemplates[0], status: 'draft', fontScale }).fontScale, fontScale);
  }
});

test('corner radius is bounded to 0–50 percent and survives template validation', () => {
  assert.equal(wallpaperCornerRadius({ containerRadius: -10 }), 0);
  assert.equal(wallpaperCornerRadius({ containerRadius: 90 }), 50);
  assert.equal(wallpaperCornerRadius({ containerRadius: NaN }), 50);
  for (const [scheduleLayout, expected] of [['stacked', 50], ['grouped-list', 5], ['timeline', 10], ['day-columns', 10], ['day-cards', 10], ['weekly', 10]]) {
    assert.equal(wallpaperCornerRadius({ scheduleLayout }), expected);
    assert.equal(wallpaperCornerRadius({ scheduleLayout, containerRadius: 17 }), 17);
    assert.equal(wallpaperCornerRadius({ scheduleLayout, containerRadius: undefined }), expected);
  }
  for (const containerRadius of [0, 15, 50]) assert.equal(templateSchema.parse({ ...sanrioTemplates[0], status: 'draft', containerRadius }).containerRadius, containerRadius);
  for (const containerRadius of [-1, 51]) assert.equal(templateSchema.safeParse({ ...sanrioTemplates[0], status: 'draft', containerRadius }).success, false);
});

test('Sanrio uses white frosted pills, with explicit user choices preserved', () => {
  for (const template of sanrioTemplates) for (const device of Object.keys(deviceResolutions)) {
    const preset = customizeWallpaperTemplate(template, {}, device);
    assert.equal(preset.containerStyle, 'glass');
    assert.equal(preset.surface, '#ffffff');
    assert.equal(preset.containerShape, 'pill');
    assert.equal(preset.containerFill, true);
    const custom = customizeWallpaperTemplate(template, { containerFill: false, containerShape: 'rounded', containerStyle: 'solid' }, device);
    assert.equal(custom.containerFill, false);
    assert.equal(custom.containerShape, 'rounded');
    assert.equal(custom.containerStyle, 'solid');
  }
});

test('modest font enlargement preserves meetings and fits all sample device layouts', () => {
  const ctx = { measureText: text => ({ width: text.length * 20 }), scale() {}, translate() {}, fillRect() {}, fillText() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  for (const resolution of Object.values(deviceResolutions)) {
    const render = fontScale => drawWallpaper({ getContext: () => ctx }, { schedule: templateSchedule, template: { ...sanrioTemplates[0], fontScale }, resolution });
    const before = render(1);
    for (const scale of [1.1, 1.2, 1.3, 1.4, 1.5, 1.6]) {
      const after = render(scale);
      assert.equal(after.overflow, false);
      assert.ok(after.size > before.size);
      assert.equal(after.plans.reduce((n, p) => n + p.entries.length, 0), 5);
    }
  }
  assert.equal(wallpaperFontScale({ fontScale: 10 }), 1.6);
});

test('pointer dragging snaps near default while keyboard steps stay precise', () => {
  for (const value of [-5, -1, 0, 1, 5]) assert.equal(snapSchedulePosition(value, true), 0);
  assert.equal(snapSchedulePosition(6, true), 6);
  assert.equal(snapSchedulePosition(-6, true), -6);
  assert.equal(snapSchedulePosition(1, false), 1);
  assert.equal(snapSchedulePosition(-32, true, -35), -35);
  assert.equal(snapSchedulePosition(-29, true, -35), -29);
});
