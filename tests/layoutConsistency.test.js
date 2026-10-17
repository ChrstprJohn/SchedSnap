import test from 'node:test';
import assert from 'node:assert/strict';
import { drawWallpaper, scheduleLayoutOptions } from '../src/utils/canvasHelpers.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';
import { deviceResolutions, galleryScheduleFor, templateSchedule } from '../src/assets/templates.js';
import { getScheduleIssues } from '../shared/scheduleSchema.js';

test('day-column examples have varied stacks without changing other layout samples', () => {
  const sample = galleryScheduleFor({ scheduleLayout: 'day-columns' });
  const counts = {};
  for (const course of sample.classes) for (const meeting of course.meetings) counts[meeting.day] = (counts[meeting.day] || 0) + 1;
  assert.deepEqual(counts, { Monday: 4, Tuesday: 2, Wednesday: 3, Thursday: 2, Friday: 3 });
  assert.deepEqual(getScheduleIssues(sample), []);
  assert.equal(galleryScheduleFor({ scheduleLayout: 'stacked' }), templateSchedule);
});

test('all phone layouts share the title position and protect the clock from upward movement', () => {
  for (const verticalPosition of [0, -35, -100]) {
    const bounds = [];
    for (const { value } of scheduleLayoutOptions('mobile')) {
      const headings = [];
      const target = {
        font: '',
        measureText(text) { return { width: text.length * Number(this.font.match(/([\d.]+)px/)?.[1] || 36) * .52 }; },
        fillText(text, x, y) { if (text === 'Class Schedule') headings.push(y); },
      };
      const ctx = new Proxy(target, { get: (object, key) => key in object ? object[key] : () => {} });
      const canvas = { getContext: () => ctx };
      const result = drawWallpaper(canvas, { schedule: value === 'day-columns' ? galleryScheduleFor({ scheduleLayout: value }) : sampleSchedule, resolution: deviceResolutions.mobile,
        template: { background: '#fff', ink: '#123', muted: '#456', surface: '#fff', line: '#ddd', scheduleLayout: value, verticalPosition } });
      assert.equal(result.overflow, false, value);
      assert.deepEqual(headings, [650], value);
      assert.ok(result.scheduleBounds.y >= 480, `${value} must remain below the clock`);
      bounds.push(result.scheduleBounds.y);
    }
    assert.equal(new Set(bounds).size, 1, 'changing layouts must not shift the title');
  }
});
