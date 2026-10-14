import test from 'node:test';
import assert from 'node:assert/strict';
import { drawWallpaper, tabletBoxSpacing } from '../src/utils/canvasHelpers.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';

test('box spacing separates tablet days in either orientation without changing other devices', () => {
  const ctx = { measureText: text => ({ width: text.length * 20 }), scale() {}, translate() {}, fillRect() {}, fillText() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  const canvas = { getContext: () => ctx };
  const template = { background: '#fff', ink: '#000', muted: '#333', surface: '#fff', line: '#ccc' };
  for (const resolution of [{ id: 'tablet', width: 1600, height: 2560 }, { id: 'tablet', width: 2560, height: 1600 }, { id: 'mobile', width: 1080, height: 2400 }, { id: 'laptop', width: 1920, height: 1080 }]) {
    const render = spacing => drawWallpaper(canvas, { schedule: sampleSchedule, template: { ...template, tabletBoxSpacing: spacing }, resolution });
    const before = render(16), after = render(100);
    assert.equal(after.overflow, false);
    assert.equal(after.plans.reduce((n, p) => n + p.entries.length, 0), 5);
    const gap = layout => layout.plans[1].y - layout.plans[0].y - layout.plans[0].height;
    if (resolution.id === 'tablet') assert.ok(gap(after) > gap(before));
    else assert.deepEqual(after, before);
    if (resolution.id === 'tablet' && resolution.height > resolution.width) {
      const spacious = render(300);
      assert.equal(spacious.overflow, false);
      assert.equal(spacious.plans.reduce((n, p) => n + p.entries.length, 0), 5);
      assert.ok(gap(spacious) > gap(after));
    }
  }
  assert.equal(tabletBoxSpacing({}), 80);
  assert.equal(tabletBoxSpacing({ tabletBoxSpacing: 240 }), 240);
  assert.equal(tabletBoxSpacing({ tabletBoxSpacing: 999 }), 300);
});
