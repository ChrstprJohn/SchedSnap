import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import cloudinaryManifest from '../src/assets/cloudinaryManifest.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';
import { deviceResolutions, mascotTemplateSchedule, mobileResolution, templateSchedule, wallpaperTemplates } from '../src/assets/templates.js';
import { mascotTemplates } from '../src/assets/mascotTemplates.js';
import { littleFriendsTemplates } from '../src/assets/littleFriendsTemplates.js';
import { patternTemplates } from '../src/assets/patternTemplates.js';
import { scenicTemplates } from '../src/assets/scenicTemplates.js';
import { onepieceTemplates } from '../src/assets/onepieceTemplates.js';
import { onepieceAdventureTemplates } from '../src/assets/onepieceAdventureTemplates.js';
import { onepieceReferenceTemplates } from '../src/assets/onepieceReferenceTemplates.js';
import { sanrioTemplates } from '../src/assets/sanrioTemplates.js';
import { domoTemplates } from '../src/assets/domoTemplates.js';
import { scenicFamilies } from '../src/config/collections.js';
import { drawWallpaper, drawSampleClock, findOverlaps, formatTime, formatWallpaperTime, groupSchedule, layoutSchedule, schedulePosition, scheduleTopMargin, wrapText } from '../src/utils/canvasHelpers.js';
import { getScheduleIssues } from '../shared/scheduleSchema.js';
import { colorInputValue, customizeWallpaperTemplate } from '../src/utils/wallpaperTheme.js';
import { isNewTemplate, NEW_TEMPLATE_WINDOW_MS } from '../src/utils/templateFreshness.js';

const measurementContext = { font: '', translate() {}, measureText(text) { const size = Number(this.font.match(/(\d+(\.\d+)?)px/)?.[1] || 36); return { width: text.length * size * 0.52 }; } };

test('new pattern variants cover all supported prints and expire their New badge after seven days', () => {
  const variants = patternTemplates.slice(6);
  assert.equal(variants.length, 18);
  for (const pattern of ['checker', 'grid', 'ruled', 'circle', 'dots', 'stripes', 'diamonds', 'waves', 'frame']) {
    assert.equal(variants.filter(template => template.pattern === pattern).length, 2, pattern);
  }
  for (const template of variants) {
    const created = Date.parse(template.createdAt);
    assert.ok(Number.isFinite(created));
    assert.ok(isNewTemplate(template, created));
    assert.ok(isNewTemplate(template, created + NEW_TEMPLATE_WINDOW_MS - 1));
    assert.equal(isNewTemplate(template, created + NEW_TEMPLATE_WINDOW_MS), false);
    const customized = customizeWallpaperTemplate(template, { patternColor: '#809f88' });
    assert.equal(customized.pattern, template.pattern);
    assert.equal(customized.patternColor, '#809f88');
    assert.equal(template.collection, 'pattern');
  }
});

test('every illustrated variant has three correctly sized device assets and every theme has at least three variants', () => {
  assert.equal(scenicTemplates.length, 55);
  const devices = Object.fromEntries(Object.values(deviceResolutions).map(({ id, width, height }) => [id, [width, height]]));
  for (const family of scenicFamilies) assert.ok(scenicTemplates.filter((template) => template.family === family.id).length >= 3, family.id);
  for (const template of scenicTemplates) {
    assert.ok(!/kittens|sentinel|ranger|violet-watch/.test(template.id), template.id);
    for (const [device, [width, height]] of Object.entries(devices)) {
      const expected = `/wallpapers/scenic/${template.id}/${device}.png`;
      assert.equal(template.deviceImages[device], expected);
      const asset = cloudinaryManifest[expected];
      assert.equal(asset.width, width, `${template.id}/${device} width`);
      assert.equal(asset.height, height, `${template.id}/${device} height`);
      const local = new URL(`../public${expected}`, import.meta.url);
      if (existsSync(local)) {
        const png = readFileSync(local);
        assert.equal(png.subarray(1, 4).toString(), 'PNG');
        assert.equal(png.readUInt32BE(16), width);
        assert.equal(png.readUInt32BE(20), height);
      }
    }
  }
});

test('groups repeated class meetings by weekday, preserving all occurrences', () => {
  const repeated = structuredClone(sampleSchedule);
  repeated.classes[0].meetings.push({ ...repeated.classes[0].meetings[0], day: 'Wednesday' });
  const groups = groupSchedule(repeated);
  assert.deepEqual(groups.map((group) => group.day), ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  assert.equal(groups.reduce((sum, group) => sum + group.entries.length, 0), 6);
  assert.equal(groups.find((group) => group.day === 'Wednesday').entries.length, 2);
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

test('the existing collections are preserved alongside device-specific illustrated designs', () => {
  assert.equal(wallpaperTemplates.length, 40 + patternTemplates.length + scenicTemplates.length + onepieceTemplates.length + onepieceAdventureTemplates.length + onepieceReferenceTemplates.length + sanrioTemplates.length + domoTemplates.length + 61);
  assert.ok(wallpaperTemplates.filter(template => template.image && template.layout !== 'mascot')
    .every(template => ['mobile', 'tablet', 'laptop'].every(device => template.deviceImages?.[device])));
  assert.equal(new Set(wallpaperTemplates.map((template) => template.id)).size, wallpaperTemplates.length);
  assert.equal(wallpaperTemplates.filter((template) => template.collection === 'scenic').length, scenicTemplates.length);
  assert.equal(littleFriendsTemplates.length, 20);
  assert.equal(new Set(littleFriendsTemplates.map((template) => template.mascot)).size, 20);
  assert.equal(littleFriendsTemplates.filter((template) => template.mascotSide === 'left').length, 10);
  assert.equal(littleFriendsTemplates.filter((template) => template.mascotSide === 'right').length, 10);
  assert.equal(mascotTemplates.length, 20);
  assert.equal(new Set(mascotTemplates.map((template) => template.mascot)).size, 20);
  assert.equal(patternTemplates.length, 24);
  assert.equal(new Set(patternTemplates.map((template) => template.id)).size, 24);
  assert.deepEqual([...new Set(patternTemplates.map((template) => template.pattern))].sort(), ['checker', 'circle', 'diamonds', 'dots', 'frame', 'grid', 'ruled', 'stripes', 'waves']);
  assert.ok(patternTemplates.every((template) => !template.image && template.patternColor));
  const removed = ['paper', 'sage', 'midnight', 'lilac', 'slate', 'peach', 'ocean', 'charcoal', 'window-light', 'blue-hour', 'blush-club', 'after-hours'];
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

test('a new editor renders artwork without example classes and blocks empty export', () => {
  const schedule = { classes: [], warnings: [] };
  assert.ok(getScheduleIssues(schedule).length > 0);
  for (const template of wallpaperTemplates) {
    const text = [];
    const context = { ...measurementContext, scale() {}, fillRect() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, createLinearGradient() { return { addColorStop() {} }; }, fillText(value) { text.push(value); } };
    const canvas = { getContext() { return context; } };
    const layout = drawWallpaper(canvas, { schedule, template });
    assert.equal(layout.overflow, false, template.name);
    assert.equal(layout.plans.length, 0, template.name);
    assert.ok(text.includes('Class Schedule'), template.name);
    assert.equal(text.includes('Subject name'), false, template.name);
    assert.equal(text.includes('Subject needed'), false, template.name);
  }
});

test('custom schedule titles render once and fit within the wallpaper heading area', () => {
  for (const scheduleTitle of ['Semester 1', 'A very long schedule title for the new school year', '   ']) {
    const headings = [];
    const context = { ...measurementContext, scale() {}, fillRect() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, createLinearGradient() { return { addColorStop() {} }; }, fillText(value, x, y, maxWidth) { if (y === 650) headings.push({ value, x, maxWidth, measured: this.measureText(value).width }); } };
    drawWallpaper({ getContext() { return context; } }, { schedule: sampleSchedule, template: { ...wallpaperTemplates[0], scheduleTitle } });
    assert.equal(headings.length, 1);
    assert.equal(headings[0].value, scheduleTitle.trim() || 'Class Schedule');
    assert.equal(headings[0].x, 540);
    assert.equal(headings[0].maxWidth, 924);
    assert.ok(headings[0].measured <= 924);
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
  for (const template of [...mascotTemplates, ...littleFriendsTemplates]) {
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
  for (const template of [...mascotTemplates, ...littleFriendsTemplates]) {
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
      assert.ok(!text.some((value) => value.startsWith('EDITION ')));
      assert.ok(!text.includes(template.name.toUpperCase()));
      return width;
    };
    assert.equal(render(busy), render(mascotTemplateSchedule), template.name);
  }
});

test('every mascot template references an uploaded square PNG; local originals preserve alpha', () => {
  for (const template of [...mascotTemplates, ...littleFriendsTemplates]) {
    const asset = cloudinaryManifest[template.image];
    assert.match(asset.url, /\.png$/);
    assert.equal(asset.width, asset.height);
    assert.ok(asset.width >= 1024, template.name);
    const local = new URL(`../public${template.image}`, import.meta.url);
    if (!existsSync(local)) continue;
    const bytes = readFileSync(local);
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
  const originalBase = { ...wallpaperTemplates.find(({ id }) => id === 'blue-contours'), overlay: 'rgba(10,19,38,0.65)' };
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


test('tablet and laptop schedules preserve every meeting, fit the screen and stay clear of characters', () => {
  const image = { width: 1254, height: 1254, mascotBounds: { x: 80, y: 120, width: 920, height: 1100 } };
  for (const resolution of [{ id: 'tablet', width: 1600, height: 2560 }, { id: 'tablet', width: 2560, height: 1600 }, { id: 'laptop', width: 1920, height: 1080 }]) {
    for (const schedulePosition of ['left', 'center', 'right']) {
      const labels = [];
      const ctx = { ...measurementContext, scale() {}, translate() {}, fillRect() {}, beginPath() {}, roundRect() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, fillText(value) { labels.push(value); }, drawImage() {} };
      const canvas = { getContext() { return ctx; } };
      const template = { ...littleFriendsTemplates[1], schedulePosition };
      const layout = drawWallpaper(canvas, { schedule: templateSchedule, template, resolution, backgroundImage: image });
      assert.equal(layout.overflow, false);
      assert.equal(layout.position, schedulePosition);
      assert.equal(layout.plans.flatMap((plan) => plan.entries).length, 5);
      assert.equal(canvas.width, resolution.width);
      assert.equal(canvas.height, resolution.height);
      const { scheduleBounds: bounds, art } = layout;
      const height = 1920 * resolution.height / resolution.width;
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 1920);
      assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= height);
      assert.ok(art.x + art.width <= bounds.x || art.x >= bounds.x + bounds.width || art.y >= bounds.y + bounds.height || art.y + art.height <= bounds.y);
      assert.ok(!labels.some((label) => label.startsWith('EDITION ')));
      assert.ok(!labels.includes(template.name.toUpperCase()));
      const busy = structuredClone(templateSchedule);
      for (const course of busy.classes) course.meetings.push({ ...course.meetings[0], startTime: '10:00', endTime: '11:30' }, { ...course.meetings[0], startTime: '13:00', endTime: '14:30' });
      const denseLayout = drawWallpaper(canvas, { schedule: busy, template, resolution, backgroundImage: image });
      assert.equal(denseLayout.overflow, false, `${resolution.id} ${resolution.width} ${schedulePosition}`);
      assert.equal(denseLayout.plans.flatMap((plan) => plan.entries).length, 15);
    }
  }
});


test('laptop backgrounds honor schedule alignment and character presets reserve the opposite side or center footer', () => {
  for (const template of wallpaperTemplates) {
    const laptop = { ...template, device: 'laptop' };
    if (template.layout !== 'mascot') {
      assert.equal(schedulePosition(laptop), template.schedulePosition || 'center');
      for (const position of ['left', 'center', 'right']) assert.equal(schedulePosition({ ...laptop, schedulePosition: position }), position);
    } else {
      const characterPosition = template.mascotPosition || template.mascotSide || 'left';
      assert.equal(schedulePosition(laptop), characterPosition === 'center' ? 'center' : characterPosition === 'left' ? 'right' : 'left');
      for (const position of ['left', 'center', 'right']) assert.equal(schedulePosition({ ...laptop, schedulePosition: position }), position);
    }
  }
});


test('visible weekday glyph bounds are centered inside badges for every device', () => {
  for (const resolution of [mobileResolution, { id: 'tablet', width: 1600, height: 2560 }, { id: 'laptop', width: 1920, height: 1080 }]) {
    const badges = [], glyphs = [];
    const context = { ...measurementContext, scale() {}, translate() {}, fillRect() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, save() {}, restore() {},
      arc(x, y) { badges.push({ x, y }); },
      measureText(text) { const measured = measurementContext.measureText.call(this, text); return { ...measured, actualBoundingBoxLeft: -2, actualBoundingBoxRight: measured.width - 4, actualBoundingBoxAscent: 30, actualBoundingBoxDescent: 2 }; },
      fillText(value, x, y) { if (['M', 'T', 'W', 'TH', 'F'].includes(value)) { const metrics = this.measureText(value); glyphs.push({ x: x + (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2, y: y - (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2 }); } },
    };
    drawWallpaper({ getContext() { return context; } }, { schedule: templateSchedule, template: { ...mascotTemplates[0], containerStyle: 'solid' }, resolution });
    assert.equal(glyphs.length, 5);
    for (let index = 0; index < glyphs.length; index++) {
      assert.ok(Math.abs(glyphs[index].x - badges[index].x) < 0.001);
      assert.ok(Math.abs(glyphs[index].y - badges[index].y) < 0.001);
    }
  }
});


test('tablet and laptop badge size and leading spacing match mobile row proportions', () => {
  const resolutions = [mobileResolution, { id: 'tablet', width: 1600, height: 2560 }, { id: 'tablet', width: 2560, height: 1600 }, { id: 'laptop', width: 1920, height: 1080 }];
  let mobile;
  for (const resolution of resolutions) {
    const badges = [];
    const context = { ...measurementContext, scale() {}, translate() {}, fillRect() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, save() {}, restore() {}, fillText() {},
      arc(x, y, radius) { badges.push({ x, y, radius }); },
    };
    const layout = drawWallpaper({ getContext() { return context; } }, { schedule: templateSchedule, template: { ...mascotTemplates[0], containerStyle: 'solid' }, resolution });
    assert.equal(layout.overflow, false);
    assert.equal(badges.length, 5);
    for (const [index, plan] of layout.plans.entries()) {
      const badge = badges[index];
      const proportions = {
        inset: (badge.x - badge.radius - plan.x) / plan.height,
        diameter: badge.radius * 2 / plan.height,
        timeStart: (plan.timeX - plan.x) / plan.height,
      };
      if (!mobile) {
        mobile = proportions;
        assert.equal(badge.x - plan.x, 94);
        assert.equal(badge.radius, 65);
      }
      for (const key of Object.keys(mobile)) assert.ok(Math.abs(proportions[key] - mobile[key]) < 0.001, `${resolution.id}: ${key}`);
      assert.equal(badge.y, plan.y + plan.height / 2);
      assert.ok(badge.x + badge.radius < plan.timeX);
    }
  }
});


test('tablet and laptop characters anchor to the bottom corner without overlapping schedules', () => {
  const image = { width: 1254, height: 1254, mascotBounds: { x: 80, y: 120, width: 920, height: 1100 } };
  for (const resolution of [{ id: 'tablet', width: 1600, height: 2560 }, { id: 'tablet', width: 2560, height: 1600 }, { id: 'laptop', width: 1920, height: 1080 }]) {
    for (const mascotSide of ['left', 'right']) for (const schedulePosition of ['left', 'center', 'right']) {
      const ctx = { ...measurementContext, scale() {}, translate() {}, fillRect() {}, beginPath() {}, roundRect() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, fillText() {}, drawImage() {} };
      const { art, scheduleBounds: bounds, position } = drawWallpaper({ getContext() { return ctx; } }, { schedule: templateSchedule, template: { ...mascotTemplates[0], mascotSide, schedulePosition }, resolution, backgroundImage: image });
      const height = 1920 * resolution.height / resolution.width;
      assert.ok(Math.abs(art.y + art.height - height) < 0.001);
      const right = resolution.width > resolution.height ? position === 'left' || (position === 'center' && mascotSide === 'right') : mascotSide === 'right';
      assert.ok(Math.abs(right ? art.x + art.width - 1920 : art.x) < 0.001);
      assert.ok(art.x + art.width <= bounds.x || art.x >= bounds.x + bounds.width || art.y >= bounds.y + bounds.height || art.y + art.height <= bounds.y);
    }
  }
});

test('explicit mascot placements preserve positive bounds and avoid schedules on each device', () => {
  const image = { width: 1254, height: 1254, mascotBounds: { x: 80, y: 120, width: 920, height: 1100 } };
  for (const resolution of [{ id: 'mobile', width: 1080, height: 2400 }, { id: 'tablet', width: 1600, height: 2560 }, { id: 'tablet', width: 2560, height: 1600 }, { id: 'laptop', width: 1920, height: 1080 }]) {
    for (const mascotPosition of ['left', 'center', 'right']) for (const schedulePosition of ['left', 'center', 'right']) {
      const images = [];
      const ctx = { ...measurementContext, scale() {}, translate() {}, fillRect() {}, beginPath() {}, roundRect() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, fillText() {}, drawImage(...args) { images.push(args); } };
      const layout = drawWallpaper({ getContext() { return ctx; } }, { schedule: templateSchedule, template: { ...mascotTemplates[0], mascotPosition, schedulePosition }, resolution, backgroundImage: image });
      const logicalWidth = resolution.id === 'mobile' ? 1080 : 1920;
      const logicalHeight = logicalWidth * resolution.height / resolution.width;
      const art = layout.art || { x: images[0][5], y: images[0][6], width: images[0][7], height: images[0][8] };
      const bounds = layout.scheduleBounds || { x: 78, y: 460, width: 924, height: layout.bottom - 460 };
      assert.ok(art.width > 0 && art.height > 0);
      assert.ok(Math.abs(art.y + art.height - logicalHeight) < .001);
      if (mascotPosition === 'center') assert.ok(Math.abs(art.x + art.width / 2 - logicalWidth / 2) < .001);
      else assert.ok(Math.abs(mascotPosition === 'right' ? art.x + art.width - logicalWidth : art.x) < .001);
      assert.ok(art.x + art.width <= bounds.x || art.x >= bounds.x + bounds.width || art.y >= bounds.y + bounds.height || art.y + art.height <= bounds.y, `${resolution.id}/${mascotPosition}/${schedulePosition}`);
    }
  }
});

test('character placement customizations preserve template defaults without mutating them', () => {
  const template = { ...mascotTemplates[0], mascotPosition: 'center' };
  const customized = customizeWallpaperTemplate(template, { mascotPosition: 'right' });
  assert.equal(customized.mascotPosition, 'right'); assert.equal(template.mascotPosition, 'center');
});

test('schedule placement moves between left, center and right on larger devices while phones stay centered', () => {
  const ctx = { ...measurementContext, scale() {}, translate() {}, fillRect() {}, beginPath() {}, roundRect() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, fillText() {} };
  const canvas = { getContext() { return ctx; } };
  for (const resolution of [deviceResolutions.tablet, { ...deviceResolutions.tablet, width: 2560, height: 1600 }, deviceResolutions.laptop]) {
    const positions = ['left', 'center', 'right'].map(position => drawWallpaper(canvas, { schedule: sampleSchedule, template: { ...patternTemplates[0], schedulePosition: position }, resolution }).scheduleBounds.x);
    assert.ok(positions[0] < positions[1] && positions[1] < positions[2], resolution.id);
  }
  for (const position of ['left', 'center', 'right']) assert.equal(schedulePosition({ device: 'mobile', schedulePosition: position }), 'center');
});

test('top margin moves the title and all meetings below the sample clock, preserves exports, and rejects overflow', () => {
  const headings = [], text = [];
  const ctx = { ...measurementContext, scale() {}, translate() {}, fillRect() {}, beginPath() {}, roundRect() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, fillText(value, x, y) { text.push(value); if (value === 'Class Schedule') headings.push(y); } };
  const canvas = { getContext() { return ctx; } };
  for (const resolution of [mobileResolution, deviceResolutions.tablet, { ...deviceResolutions.tablet, width: 2560, height: 1600 }, deviceResolutions.laptop]) {
    const template = { ...patternTemplates[0], device: resolution.id };
    const before = drawWallpaper(canvas, { schedule: sampleSchedule, template, resolution });
    const after = drawWallpaper(canvas, { schedule: sampleSchedule, template: { ...template, topMargin: 5 }, resolution });
    assert.equal(after.overflow, false);
    assert.equal(after.plans.flatMap(plan => plan.entries).length, 5);
    if (resolution.id === 'mobile') {
      assert.equal(after.plans[0].y - before.plans[0].y, 120);
      assert.equal(headings.at(-1) - headings.at(-2), 120);
      assert.ok(headings.at(-2) - 88 > 2400 * 0.20);
    } else {
      assert.ok(after.scheduleBounds.y > before.scheduleBounds.y);
      if (resolution.id === 'tablet') assert.ok(before.scheduleBounds.y >= 1920 * resolution.height / resolution.width * 0.22);
    }
  }
  assert.equal(text.includes('9:41'), false, 'sample clock must never be part of wallpaper exports');
  assert.equal(text.includes('AM'), false, 'clock period must never be part of wallpaper exports');
  const dense = structuredClone(sampleSchedule);
  for (const course of dense.classes) course.meetings.push({ ...course.meetings[0], startTime: '10:00', endTime: '11:00' }, { ...course.meetings[0], startTime: '13:00', endTime: '14:00' });
  assert.equal(drawWallpaper(canvas, { schedule: dense, template: { ...mascotTemplates[0], topMargin: 20 } }).overflow, true);
  assert.equal(scheduleTopMargin({ topMargin: -10 }), 0);
  assert.equal(scheduleTopMargin({ topMargin: 100 }), 20);
  assert.equal(scheduleTopMargin({ topMargin: 'invalid' }), 0);
});

test('sample clock uses the actual preview dimensions and resets the wallpaper transform', () => {
  const draws = [], transforms = [];
  const ctx = { ...measurementContext, save() {}, restore() {}, setTransform(...args) { transforms.push(args); }, fillText(value, x, y) { draws.push({ value, x, y, font: this.font }); } };
  drawSampleClock({ width: 540, height: 1200, getContext() { return ctx; } }, patternTemplates[0]);
  assert.deepEqual(transforms, [[1, 0, 0, 1, 0, 0]]);
  assert.deepEqual(draws.map(draw => draw.value), ['9:41', 'AM']);
  assert.ok(draws.every(draw => draw.y === 192));
  assert.match(draws[0].font, /108px/);
  assert.match(draws[1].font, /33.6px/);
  const right = draws[1].x + 33.6 * 2 * 0.52;
  assert.ok(Math.abs((draws[0].x + right) / 2 - 270) < 0.001, 'time and AM together are horizontally centered');
});
