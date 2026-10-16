import test from 'node:test';
import assert from 'node:assert/strict';
import { drawWallpaper, scheduleLayoutOptions } from '../src/utils/canvasHelpers.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';

const resolutions = [{ id: 'mobile', width: 1080, height: 2400 }, { id: 'tablet', width: 1600, height: 2560 }, { id: 'laptop', width: 1920, height: 1080 }];
function render(kind, resolution, settings = {}, schedule = sampleSchedule) {
  const text = [], boxes = [], strokes = [], runs = [];
  const ctx = { measureText(value) { return { width: value.length * (parseFloat(this.font?.match(/([\d.]+)px/)?.[1]) || 30) * 0.55 }; }, scale() {}, translate() {}, fillRect() {}, fillText(value, x, y) { text.push(value); runs.push({ value, x, y, size: parseFloat(this.font?.match(/([\d.]+)px/)?.[1]) }); }, beginPath() {}, roundRect(...args) { boxes.push(args); }, fill() {}, stroke() { strokes.push(this.strokeStyle); }, arc() {}, save() {}, restore() {}, moveTo() {}, lineTo() {} };
  const template = { background: '#fff', ink: '#123456', muted: '#123456', surface: '#eee', line: '#d04080', containerStyle: 'solid', scheduleLayout: kind, ...settings };
  return { layout: drawWallpaper({ getContext: () => ctx }, { schedule, template, resolution }), text, boxes, strokes, runs };
}

test('reference layouts have the requested device availability', () => {
  for (const resolution of resolutions) {
    const values = scheduleLayoutOptions(resolution.id).map(option => option.value);
    assert.ok(values.includes('grouped-list'));
    assert.equal(values.includes('day-columns'), resolution.id !== 'laptop');
  }
});

test('reference layouts preserve meetings, fit, and use one shared panel or one column per day', () => {
  for (const resolution of resolutions) for (const kind of ['grouped-list', ...(resolution.id !== 'laptop' ? ['day-columns'] : [])]) {
    const { layout, boxes, text, strokes } = render(kind, resolution);
    assert.equal(layout.overflow, false, `${kind} ${resolution.id}`);
    assert.equal(layout.plans.flatMap(plan => plan.entries).length, 5);
    assert.equal(boxes.length, kind === 'grouped-list' ? 1 : 5);
    assert.equal(text.includes('CS 101'), kind === 'day-columns');
    assert.ok(text.includes('Lab 2'));
    assert.ok(strokes.every(color => color === '#d04080'));
    if (kind === 'day-columns') {
      assert.equal(new Set(layout.plans.map(plan => plan.y)).size, 1);
      assert.ok(layout.plans[1].x >= layout.plans[0].x + layout.plans[0].width);
    }
    assert.deepEqual(render(kind, { ...resolution, width: resolution.width / 2, height: resolution.height / 2 }).layout, layout);
    assert.equal(render(kind, resolution, { containerFill: false, containerBorder: false }).boxes.length, 0);
    const up = render(kind, resolution, { verticalPosition: -100 }).layout;
    const down = render(kind, resolution, { verticalPosition: 100 }).layout;
    assert.ok(up.scheduleBounds.y < down.scheduleBounds.y);
    assert.equal(up.size, down.size);
    const dense = { classes: [{ subject: 'Research', meetings: Array.from({ length: 150 }, () => ({ day: 'Monday', startTime: '08:00', endTime: '09:00' })) }] };
    assert.equal(render(kind, resolution, {}, dense).layout.overflow, true);
  }
});

test('corner radius choices apply to each layout while grouped lists omit codes and inset weekdays', () => {
  for (const resolution of resolutions) for (const { value: kind } of scheduleLayoutOptions(resolution.id)) {
    const defaultRadius = kind === 'stacked' ? 50 : kind === 'grouped-list' ? 5 : 10;
    for (const box of render(kind, resolution).boxes) assert.ok(Math.abs(box[4] - Math.min(box[2], box[3]) * defaultRadius / 100) < 0.001);
    for (const containerRadius of [0, 15, 50]) {
      const { boxes, layout, runs, text } = render(kind, resolution, { containerRadius });
      assert.equal(layout.overflow, false);
      for (const box of boxes) assert.ok(Math.abs(box[4] - Math.min(box[2], box[3]) * containerRadius / 100) < 0.001);
      if (kind === 'grouped-list') {
        assert.ok(!text.includes('CS 101'));
        assert.ok(runs.find(run => run.value === 'MON').x > layout.plans[0].x + layout.padding);
      }
    }
  }
});

test('reference layouts retain weekends, full subject names and dates, and support hidden titles and font scaling', () => {
  const subject = 'Advanced Research Methods and Applied Community Development';
  const schedule = { classes: [{ subject, courseCode: 'RES 401', meetings: ['Monday', 'Saturday', 'Sunday'].map(day => ({ day, startTime: '08:00', endTime: '09:30', room: 'Research Lab', dateLabel: 'Oct 16–Dec 15' })) }] };
  for (const kind of ['grouped-list', 'day-columns']) for (const resolution of resolutions.filter(item => kind !== 'day-columns' || item.id !== 'laptop')) {
    for (const fontScale of [0.7, 1, 1.6]) {
      const { layout, text } = render(kind, resolution, { fontScale, showTitle: false }, schedule);
      assert.equal(layout.overflow, false);
      assert.ok(!text.includes('Class Schedule'));
      assert.deepEqual(layout.plans.map(plan => plan.day), ['Monday', 'Saturday', 'Sunday']);
      for (const plan of layout.plans) {
        assert.equal(plan.entries[0].subjectLines.join(' '), kind === 'day-columns' ? '' : subject);
        assert.equal(plan.entries[0].detailLines.join(' '), 'Oct 16–Dec 15');
      }
    }
  }
});

test('Day columns use compact clock labels, course codes, taller cells and padded weekday badges', () => {
  for (const resolution of resolutions.slice(0, 2)) {
    const { layout, text, runs } = render('day-columns', resolution);
    const first = layout.plans[0].entries[0];
    const time = runs.find(run => run.value === first.timeLines.at(-1));
    const code = runs.find(run => run.value === first.codeLines[0]);
    const room = runs.find(run => run.value === first.roomLines[0]);
    const day = runs.find(run => run.value === 'M');
    assert.ok(code.y - (time.y + time.size * 1.3) >= layout.size - 0.001);
    assert.ok(room.y - (code.y + code.size * 1.3) >= layout.size - 0.001);
    assert.ok(day.size > code.size);
    assert.ok(layout.size <= (resolution.id === 'mobile' ? 28 : 42));
    assert.ok(!text.some(value => /\b(?:AM|PM)\b/.test(value)));
    for (const plan of layout.plans) for (const entry of plan.entries) {
      assert.deepEqual(entry.subjectLines, []);
      assert.ok(entry.bottom - entry.y >= layout.size * 8);
    }
    assert.ok(text.includes('CS 101') && text.includes('Lab 2'));
  }
});

test('reference layout font choices scale sparse schedules and grouped lists fit fifteen meetings', () => {
  const sparse = { classes: [sampleSchedule.classes[0]] };
  const dense = { classes: sampleSchedule.classes.map(course => ({ ...course, meetings: [0, 1, 2].map(index => ({ ...course.meetings[0], startTime: `${8 + index * 2}:00`.padStart(5, '0'), endTime: `${9 + index * 2}:00`.padStart(5, '0') })) })) };
  for (const resolution of resolutions) {
    for (const kind of ['grouped-list', ...(resolution.id === 'laptop' ? [] : ['day-columns'])]) {
      const standard = render(kind, resolution, {}, sparse).layout;
      for (const fontScale of [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6]) {
        const layout = render(kind, resolution, { fontScale }, sparse).layout;
        assert.equal(layout.overflow, false);
        assert.ok(Math.abs(layout.size - standard.size * fontScale) < 0.001);
      }
    }
    const layout = render('grouped-list', resolution, {}, dense).layout;
    assert.equal(layout.overflow, false);
    assert.equal(layout.plans.flatMap(plan => plan.entries).length, 15);
    assert.ok(layout.padding <= 16);
  }
});
