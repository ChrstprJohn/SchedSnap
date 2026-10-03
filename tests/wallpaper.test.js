import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';
import { mascotTemplateSchedule, mobileResolution, templateSchedule, wallpaperTemplates } from '../src/assets/templates.js';
import { mascotTemplates } from '../src/assets/mascotTemplates.js';
import { patternTemplates } from '../src/assets/patternTemplates.js';
import { drawWallpaper, findOverlaps, formatTime, formatWallpaperTime, groupSchedule, layoutSchedule, wrapText } from '../src/utils/canvasHelpers.js';
import { getScheduleIssues } from '../shared/scheduleSchema.js';
import { colorInputValue, customizeWallpaperTemplate } from '../src/utils/wallpaperTheme.js';

const measurementContext = { font: '', measureText(text) { const size = Number(this.font.match(/(\d+(\.\d+)?)px/)?.[1] || 36); return { width: text.length * size * 0.52 }; } };

test('groups repeated class meetings by weekday, preserving all occurrences', () => {
  const groups = groupSchedule(sampleSchedule);
  assert.deepEqual(groups.map((group) => group.day), ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  assert.equal(groups.reduce((sum, group) => sum + group.entries.length, 0), 5);
  assert.equal(formatTime('13:00'), '1:00 PM');
  assert.equal(formatTime('00:05'), '12:05 AM');
  assert.equal(formatWallpaperTime('07:00'), '7:00 AM');
  assert.equal(formatWallpaperTime('10:00'), '10:00 AM');
  assert.equal(formatWallpaperTime('13:30'), '1:30 PM');
  assert.equal(formatWallpaperTime('00:05'), '12:05 AM');
  assert.equal(formatWallpaperTime(null), 'Time needed');
});

test('detects incomplete times, reverse ranges, and overlapping classes', () => {
  const schedule = structuredClone(sampleSchedule);
  schedule.classes[0].meetings[0].endTime = '07:00';
  assert.ok(getScheduleIssues(schedule).some((issue) => issue.includes('later')));
  schedule.classes[0].meetings[0].startTime = null;
  assert.ok(getScheduleIssues(schedule).some((issue) => issue.includes('incomplete')));
  const overlap = structuredClone(sampleSchedule);
  overlap.classes.push({ subject: 'Overlapping class', courseCode: null, meetings: [{ day: 'Monday', startTime: '09:00', endTime: '10:00', room: null, dateLabel: null }] });
  assert.equal(findOverlaps(overlap).length, 1);
});

test('all templates fit sample data and dense data is explicitly rejected', () => {
  for (const template of wallpaperTemplates) {
    assert.equal(layoutSchedule(measurementContext, sampleSchedule, template, 2400).overflow, false);
    const crowded = { classes: Array.from({ length: 40 }, (_, i) => ({ subject: `Very long subject number ${i}`, courseCode: 'LONG 101', meetings: [{ day: 'Monday', startTime: '08:00', endTime: '09:00', room: 'Room 101', dateLabel: null }] })) };
    assert.equal(layoutSchedule(measurementContext, crowded, template, 2400).overflow, true);
  }
});

test('the collection has twenty animals, six editable patterns and sixteen originals', () => {
  assert.equal(wallpaperTemplates.length, 42);
  assert.equal(new Set(wallpaperTemplates.map((template) => template.id)).size, 42);
  assert.equal(mascotTemplates.length, 20);
  assert.equal(new Set(mascotTemplates.map((template) => template.mascot)).size, 20);
  assert.equal(patternTemplates.length, 6);
  assert.equal(new Set(patternTemplates.map((template) => template.pattern)).size, 6);
  assert.ok(patternTemplates.every((template) => !template.image && template.patternColor));
  const removed = ['paper', 'sage', 'midnight', 'lilac', 'slate', 'peach', 'ocean', 'charcoal'];
  assert.ok(wallpaperTemplates.every((template) => !removed.includes(template.id)));
  assert.ok(templateSchedule.classes.every((course) => course.subject === 'Subject name'));
});

test('every mobile template renders real class details inside the canvas', () => {
  for (const template of wallpaperTemplates) {
    const text = [];
    const context = { ...measurementContext, scale() {}, fillRect() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, createLinearGradient() { return { addColorStop() {} }; }, fillText(value) { text.push(value); } };
    const canvas = { getContext() { return context; } };
    const layout = drawWallpaper(canvas, { schedule: sampleSchedule, template });
    assert.equal(layout.overflow, false, template.name);
    assert.equal(canvas.width, mobileResolution.width);
    assert.equal(canvas.height, mobileResolution.height);
    assert.equal(text.includes('Subject name'), false);
    assert.equal(layout.plans.reduce((sum, plan) => sum + plan.entries.length, 0), 5);
    assert.ok(layout.plans.every((plan) => plan.x >= 0 && plan.x + plan.width <= 1080 && plan.y + plan.height < 2250));
    for (const plan of layout.plans) for (const entry of plan.entries) {
      assert.equal(entry.subjectLines.length, 1);
      assert.ok(entry.subjectLines[0] === entry.subject || entry.subjectLines[0].endsWith('…'));
      assert.equal(entry.timeLines.join(''), `${formatWallpaperTime(entry.startTime)}–${formatWallpaperTime(entry.endTime)}`);
    }
  }
});

test('every template fits a typical fifteen-meeting week without dropping rows', () => {
  const schedule = { classes: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => ({ subject: 'Subject name', courseCode: 'CS 101', meetings: ['08:00', '10:00', '13:00'].map((time) => ({ day, startTime: time, endTime: '15:00', room: 'Lab 2', dateLabel: null })) })), warnings: [] };
  for (const template of wallpaperTemplates) {
    const layout = layoutSchedule(measurementContext, schedule, template);
    assert.equal(layout.overflow, false, template.name);
    assert.equal(layout.plans.reduce((sum, plan) => sum + plan.entries.length, 0), 15);
  }
});

test('wrapping retains long unbroken names without drawing outside the width', () => {
  const text = 'A'.repeat(80);
  const lines = wrapText(measurementContext, text, 180);
  assert.equal(lines.join(''), text);
  assert.ok(lines.every((line) => measurementContext.measureText(line).width <= 180));
});

test('long subjects and metadata leave clear space between every meeting in all templates', () => {
  const schedule = { classes: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => ({
    subject: 'Integrative Programming and Technologies 2 (Electives)', courseCode: 'IPT102',
    meetings: ['07:00', '11:30'].map((time) => ({ day, startTime: time, endTime: '13:30', room: 'IL606a', dateLabel: null })),
  })) };
  for (const template of wallpaperTemplates) {
    const layout = layoutSchedule(measurementContext, schedule, template);
    assert.equal(layout.overflow, false, template.name);
    assert.equal(layout.plans.flatMap((plan) => plan.entries).length, 10);
    for (const plan of layout.plans) {
      for (const [index, entry] of plan.entries.entries()) {
        assert.ok(entry.subjectY >= plan.y + 14, template.name);
        assert.ok(entry.bottom <= plan.y + plan.height - 14 + 0.001, template.name);
        assert.ok(entry.detailY >= entry.subjectY + entry.subjectHeight + 6);
        if (index) assert.ok(entry.y - plan.entries[index - 1].bottom >= 8 - 0.001, template.name);
      }
    }
  }
});

test('every template uses a separate growing day card, the same columns and the same title', () => {
  const schedule = { classes: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => ({
    subject: 'Integrative Programming and Technologies 2 (Electives)', courseCode: 'IPT102',
    meetings: ['07:00', '11:30'].map((time) => ({ day, startTime: time, endTime: '13:30', room: 'IL606a', dateLabel: null })),
  })) };
  let columns;
  for (const template of wallpaperTemplates) {
    const rectangles = [], text = [];
    const context = { ...measurementContext, scale() {}, fillRect() {}, beginPath() {}, roundRect(x, y, width, height) { rectangles.push({ x, y, width, height }); }, fill() {}, stroke() {}, arc() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, fillText(value) { text.push(value); }, createLinearGradient() { return { addColorStop() {} }; } };
    const layout = drawWallpaper({ getContext() { return context; } }, { schedule, template });
    assert.equal(layout.overflow, false, template.name);
    const currentColumns = layout.plans.map(({ timeX, subjectX }) => [timeX, subjectX]);
    columns ??= currentColumns;
    assert.deepEqual(currentColumns, columns, template.name);
    assert.equal(rectangles.length, layout.plans.length);
    assert.equal(text.filter((value) => value === 'Class Schedule').length, 1);
    for (const [index, plan] of layout.plans.entries()) {
      assert.equal(rectangles[index].height, plan.height);
      assert.equal(rectangles[index].y, plan.y);
      assert.ok(plan.entries.at(-1).bottom <= plan.y + plan.height - 13.99);
      if (index) assert.ok(plan.y - (layout.plans[index - 1].y + layout.plans[index - 1].height) >= 15.99);
    }
  }
});

test('day badges and meeting times stay centered with one or three meetings', () => {
  const schedule = { classes: [1, 3].map((count, index) => ({
    subject: 'Introduction to Computing and Programming Fundamentals',
    courseCode: 'CS 101',
    meetings: Array.from({ length: count }, (_, meeting) => ({
      day: index ? 'Thursday' : 'Monday', startTime: `${7 + meeting * 3}:00`, endTime: `${9 + meeting * 3}:00`,
    })),
  })) };
  const circles = [], labels = [];
  const context = { ...measurementContext, scale() {}, fillRect() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {}, save() {}, restore() {}, arc(x, y, radius) { circles.push({ x, y, radius }); }, fillText(value, x, y) { labels.push({ value, x, y }); } };
  const layout = drawWallpaper({ getContext() { return context; } }, { schedule, template: mascotTemplates[0] });
  assert.equal(layout.overflow, false);
  assert.equal(circles.length, 2);
  for (const [index, plan] of layout.plans.entries()) {
    assert.equal(circles[index].y, plan.y + plan.height / 2);
    assert.equal(circles[index].radius, 65);
    assert.ok(labels.some(({ value, x }) => value === (index ? 'TH' : 'M') && x === circles[index].x));
    for (const entry of plan.entries) {
      const timeCenter = entry.timeY + entry.timeLines.length * layout.timeLineHeight / 2;
      assert.ok(Math.abs(timeCenter - (entry.y + entry.entryHeight / 2)) < 0.001);
    }
  }
});

test('container shape, border, fill and row separators apply to the shared wallpaper renderer', () => {
  const schedule = { classes: [{ subject: 'Programming', courseCode: 'CS 101', meetings: [
    { day: 'Monday', startTime: '07:00', endTime: '10:00', room: 'IL506a' },
    { day: 'Monday', startTime: '11:00', endTime: '14:00', room: 'IL505a' },
  ] }] };
  function render(settings) {
    const radii = [], times = [];
    let fills = 0, strokes = 0;
    const context = { ...measurementContext, scale() {}, fillRect() {}, beginPath() {},
      roundRect(x, y, width, height, radius) { radii.push(radius); },
      fill() { fills++; }, stroke() { strokes++; }, arc() {}, moveTo() {}, lineTo() {}, save() {}, restore() {},
      fillText(value, x) { if (value.includes('AM') || value.includes('PM')) times.push({ x, align: this.textAlign }); },
    };
    const template = customizeWallpaperTemplate(mascotTemplates[0], settings);
    const layout = drawWallpaper({ getContext() { return context; } }, { schedule, template });
    return { radii, fills, strokes, times, layout };
  }
  const pill = render({});
  assert.equal(pill.radii[0], pill.layout.plans[0].height / 2);
  assert.equal(pill.strokes, 1);
  assert.equal(pill.fills, 2);
  assert.ok(pill.times.every(({ x, align }) => align === 'center' && x === pill.layout.plans[0].timeX + 130));
  const plain = render({ containerBorder: false, containerFill: false });
  assert.equal(plain.strokes, 0);
  assert.equal(plain.fills, 1);
  const rounded = render({ containerShape: 'rounded', showSeparators: true });
  assert.equal(rounded.radii[0], 22);
  assert.equal(rounded.strokes, 2);
});

test('gallery examples contain exactly one neutral meeting on each weekday', () => {
  for (const schedule of [templateSchedule, mascotTemplateSchedule]) {
    const groups = groupSchedule(schedule);
    assert.deepEqual(groups.map((group) => group.day), ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    assert.ok(groups.every((group) => group.entries.length === 1 && group.entries[0].subject === 'Subject name'));
  }
});

test('course codes lead smaller subjects, rooms stay separate, and missing codes keep subjects readable', () => {
  const schedule = { classes: [
    { subject: 'Integrative Programming and Technologies 2', courseCode: 'IPT102', meetings: [{ day: 'Monday', startTime: '07:00', endTime: '10:00', room: 'IL606a', dateLabel: 'October 5–9' }] },
    { subject: 'Subject without a class code', courseCode: null, meetings: [{ day: 'Monday', startTime: '11:30', endTime: '13:30', room: null }] },
  ] };
  for (const template of wallpaperTemplates) {
    const drawn = [];
    const context = { ...measurementContext, scale() {}, fillRect() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, createLinearGradient() { return { addColorStop() {} }; }, fillText(value, x, y) { drawn.push({ value, x, y, font: this.font }); } };
    const layout = drawWallpaper({ getContext() { return context; } }, { schedule, template });
    assert.equal(layout.overflow, false, template.name);
    const plan = layout.plans[0], [coded, uncoded] = plan.entries;
    assert.ok(coded.subjectSize < layout.size);
    assert.ok(uncoded.subjectSize <= layout.size && uncoded.subjectSize >= layout.size * 0.8);
    assert.deepEqual(uncoded.codeLines, []);
    assert.equal(coded.subjectLines.length, 1);
    assert.ok(coded.subjectLines[0].endsWith('…'));
    assert.deepEqual(coded.detailLines, ['October 5–9']);
    const code = drawn.find(({ value }) => value === 'IPT102');
    const subject = drawn.find(({ value }) => value === coded.subjectLines[0]);
    const room = drawn.find(({ value }) => value === 'IL606a');
    assert.ok(code.y < subject.y && code.font.startsWith('750 '));
    assert.equal(code.x, subject.x);
    assert.ok(room.x > plan.subjectX + plan.subjectWidth);
    assert.ok(Math.abs(coded.roomY + coded.roomLines.length * layout.roomLineHeight / 2 - (coded.y + coded.entryHeight / 2)) < 0.001);
    for (const entry of plan.entries) {
      assert.ok(entry.subjectY + entry.subjectHeight <= entry.bottom);
      assert.ok(entry.codeY >= entry.y);
    }
  }
});

test('actual mascot schedules grow Monday, fit subjects on one line and omit empty days', () => {
  const actual = { classes: [
    { subject: 'Long subject name that wraps onto another line', courseCode: 'CS 101', meetings: [{ day: 'Monday', startTime: '08:00', endTime: '09:30', room: 'Lab 2' }] },
    { subject: 'Another subject', courseCode: null, meetings: [{ day: 'Monday', startTime: '10:00', endTime: '11:30' }, { day: 'Tuesday', startTime: '13:00', endTime: '14:30' }, { day: 'Wednesday', startTime: '08:00', endTime: '09:30' }, { day: 'Friday', startTime: '10:00', endTime: '12:00' }] },
  ] };
  for (const template of mascotTemplates) {
    const layout = layoutSchedule(measurementContext, actual, template);
    assert.equal(layout.overflow, false, template.name);
    assert.deepEqual(layout.plans.map((plan) => plan.day), ['Monday', 'Tuesday', 'Wednesday', 'Friday']);
    assert.equal(layout.plans[0].entries.length, 2);
    assert.ok(layout.plans[0].height > layout.plans[1].height);
    const entry = layout.plans[0].entries[0];
    assert.equal(entry.subjectLines.length, 1);
    assert.ok(entry.subjectLines[0].endsWith('…'));
    measurementContext.font = `500 ${entry.subjectSize}px sans-serif`;
    assert.ok(measurementContext.measureText(entry.subjectLines[0]).width <= layout.plans[0].subjectWidth);
    assert.equal(layout.plans.flatMap((plan) => plan.entries).length, 5);
  }
});

test('mascots keep a fixed size below every meeting, including denser schedules', () => {
  const busy = structuredClone(templateSchedule);
  for (const course of busy.classes) {
    course.courseCode = 'CS 101';
    const first = course.meetings[0];
    course.meetings.push({ ...first, startTime: '10:00', endTime: '11:30' }, { ...first, startTime: '13:00', endTime: '14:30' });
  }
  for (const template of mascotTemplates) {
    const image = { width: 1254, height: 1254, mascotBounds: { x: 80, y: 120, width: 920, height: 1100 } };
    const render = (schedule) => {
      const drawn = [], text = [];
      const ctx = { ...measurementContext, scale() {}, fillRect() {}, beginPath() {}, roundRect() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {}, save() {}, restore() {}, fillText(value) { text.push(value); }, drawImage(...args) { drawn.push(args); } };
      const layout = drawWallpaper({ getContext() { return ctx; } }, { schedule, template, backgroundImage: image });
      assert.equal(layout.overflow, false, template.name);
      assert.equal(drawn.length, 1);
      const [, , , , , x, y, width, height] = drawn[0];
      assert.ok(y >= layout.bottom + 39.99, template.name);
      assert.ok(x >= 0 && x + width <= 1080 && y + height <= 2400);
      assert.equal(Math.max(width, height), 620);
      assert.ok(text.includes(`EDITION ${template.edition}`));
      return width;
    };
    assert.equal(render(busy), render(mascotTemplateSchedule), template.name);
  }
});

test('every animal template references a real square RGBA PNG asset', () => {
  for (const template of mascotTemplates) {
    const bytes = readFileSync(new URL(`../public${template.image}`, import.meta.url));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', template.name);
    assert.equal(bytes.readUInt32BE(16), bytes.readUInt32BE(20));
    assert.ok(bytes.readUInt32BE(16) >= 1024, template.name);
    assert.equal(bytes[25], 6, `${template.name} must preserve alpha`);
  }
});

test('appearance settings preserve image artwork and patterns and drive the shared renderer', () => {
  const settings = { background: '#f5daca', surface: '#ffffff', ink: '#71394d', line: '#b98c96', fontFamily: 'Georgia' };
  const base = mascotTemplates[0];
  const customized = customizeWallpaperTemplate(base, settings);
  assert.equal(customized.image, base.image);
  assert.equal(customized.muted, settings.ink);
  assert.notEqual(base.background, settings.background);
  assert.equal(customizeWallpaperTemplate(base, {}), base);
  const originalBase = wallpaperTemplates.find(({ id }) => id === 'after-hours');
  const original = customizeWallpaperTemplate(originalBase, settings);
  assert.equal(original.image, originalBase.image);
  assert.equal(original.overlay, originalBase.overlay);
  assert.equal(original.background, originalBase.background);
  const pattern = customizeWallpaperTemplate(patternTemplates[0], { ...settings, patternColor: '#c8d7b7' });
  assert.equal(pattern.pattern, patternTemplates[0].pattern);
  assert.equal(pattern.patternColor, '#c8d7b7');
  assert.equal(pattern.background, settings.background);
  assert.equal(colorInputValue('#ffffff80'), '#ffffff');
  assert.equal(colorInputValue('rgba(36,61,81,0.78)'), '#243d51');
  const text = [], fills = [];
  const context = { ...measurementContext, scale() {}, fillRect() { fills.push(this.fillStyle); }, beginPath() {}, roundRect() {}, fill() { fills.push(this.fillStyle); }, stroke() {}, arc() {}, moveTo() {}, lineTo() {}, save() {}, restore() {}, fillText(value) { text.push({ value, font: this.font, color: this.fillStyle }); } };
  drawWallpaper({ getContext() { return context; } }, { schedule: sampleSchedule, template: customized });
  assert.equal(fills[0], settings.background);
  assert.ok(fills.includes(settings.surface));
  assert.ok(text.every(({ font, color }) => font.includes('"Georgia"') && color === settings.ink));
});
