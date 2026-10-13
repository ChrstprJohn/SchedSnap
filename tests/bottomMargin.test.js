import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduleBottomMargin, scheduleSideMargin, drawWallpaper } from '../src/utils/canvasHelpers.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';
import { patternTemplates } from '../src/assets/patternTemplates.js';

test('bottom margin visibly moves the whole mobile schedule upward and combines with top margin', () => {
  assert.equal(scheduleBottomMargin({ bottomMargin: -5 }), 0);
  assert.equal(scheduleBottomMargin({ bottomMargin: 100 }), 20);
  assert.equal(scheduleBottomMargin({ bottomMargin: 'invalid' }), 0);
  const headings = [];
  const ctx = { measureText(text) { return { width: text.length * 20 }; }, scale() {}, fillRect() {}, fillText(text, x, y) { if (text === 'Class Schedule') headings.push(y); }, beginPath() {}, roundRect() {}, moveTo() {}, bezierCurveTo() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  const render = (settings, resolution = { id: 'mobile', width: 1080, height: 2400 }) => drawWallpaper({ getContext() { return ctx; } }, { schedule: sampleSchedule, template: { ...patternTemplates[0], ...settings }, resolution });
  const before = render({});
  for (const bottomMargin of [5, 10, 20]) {
    const after = render({ bottomMargin });
    assert.equal(after.overflow, false);
    assert.equal(headings.at(-1), 650 - 24 * bottomMargin);
    assert.equal(after.size, before.size, 'Moving must not resize the schedule');
    assert.equal(after.plans.length, before.plans.length);
    after.plans.forEach((plan, index) => assert.equal(plan.y, before.plans[index].y - 24 * bottomMargin));
    const preview = render({ bottomMargin }, { id: 'mobile', width: 540, height: 1200 });
    assert.deepEqual(preview.plans, after.plans, 'Preview and export use the same placement');
  }
  assert.deepEqual(render({ topMargin: 10, bottomMargin: 10 }).plans, before.plans);
  assert.deepEqual(render({ bottomMargin: 0 }).plans, before.plans);
});

test('legacy tablet side settings move the schedule without shrinking it', () => {
  assert.equal(scheduleSideMargin({ leftMargin: 20 }, 'left'), 0);
  assert.equal(scheduleSideMargin({ leftMargin: 100, leftMarginEnabled: true }, 'left'), 20);
  const ctx = { measureText(text) { return { width: text.length * 20 }; }, scale() {}, translate() {}, fillRect() {}, fillText() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  const canvas = { getContext() { return ctx; } };
  const template = { background: '#fff', ink: '#000', muted: '#333', surface: '#fff', line: '#ccc' };
  const resolution = { id: 'tablet', width: 1600, height: 2560 };
  const before = drawWallpaper(canvas, { schedule: sampleSchedule, template, resolution });
  const disabled = drawWallpaper(canvas, { schedule: sampleSchedule, template: { ...template, leftMargin: 20 }, resolution });
  const after = drawWallpaper(canvas, { schedule: sampleSchedule, template: { ...template, leftMargin: 20, leftMarginEnabled: true }, resolution });
  assert.deepEqual(disabled.scheduleBounds, before.scheduleBounds);
  assert.equal(after.overflow, false);
  assert.ok(after.scheduleBounds.x > before.scheduleBounds.x);
  assert.equal(after.scheduleBounds.width, before.scheduleBounds.width);
});
