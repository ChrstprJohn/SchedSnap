import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduleBottomMargin, scheduleSideMargin, layoutSchedule, drawWallpaper } from '../src/utils/canvasHelpers.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';
import { patternTemplates } from '../src/assets/patternTemplates.js';

test('bottom margin is bounded and reduces the available schedule space', () => {
  assert.equal(scheduleBottomMargin({ bottomMargin: -5 }), 0);
  assert.equal(scheduleBottomMargin({ bottomMargin: 100 }), 20);
  assert.equal(scheduleBottomMargin({ bottomMargin: 'invalid' }), 0);
  const ctx = { measureText(text) { return { width: text.length * 20 }; } };
  const dense = structuredClone(sampleSchedule);
  for (const course of dense.classes) course.meetings.push(...Array.from({ length: 2 }, () => ({ ...course.meetings[0] })));
  const without = layoutSchedule(ctx, dense, patternTemplates[0], 2400);
  const withMargin = layoutSchedule(ctx, dense, patternTemplates[0], 2400 - 2400 * scheduleBottomMargin({ bottomMargin: 20 }) / 100);
  assert.equal(without.overflow, false);
  assert.ok(withMargin.overflow || withMargin.size <= without.size);
});

test('tablet side margins are opt-in and move/shrink the centered schedule within its remaining area', () => {
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
  assert.ok(after.scheduleBounds.width < before.scheduleBounds.width);
});
