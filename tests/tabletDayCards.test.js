import test from 'node:test';
import assert from 'node:assert/strict';
import { drawWallpaper, scheduleLayout, scheduleLayoutOptions } from '../src/utils/canvasHelpers.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';

const template = { background: '#fafafa', ink: '#172033', muted: '#526074', surface: '#f8fafc', line: '#ccd4df', containerStyle: 'solid', scheduleLayout: 'day-cards' };
function render(schedule = sampleSchedule, settings = {}, resolution = { id: 'tablet', width: 1600, height: 2560 }) {
  const text = [];
  const lines = [], rings = [], containers = [];
  let start;
  const ctx = { measureText(value) { return { width: value.length * (parseFloat(this.font?.match(/([\d.]+)px/)?.[1]) || 30) * 0.55 }; }, scale() {}, translate() {}, fillRect() {}, fillText(value) { text.push(value); }, beginPath() {}, roundRect(...args) { containers.push(args); }, fill() {}, stroke() {}, arc(...args) { rings.push(args); }, save() {}, restore() {}, moveTo(x, y) { start = [x, y]; }, lineTo(x, y) { lines.push([...start, x, y]); } };
  const layout = drawWallpaper({ getContext: () => ctx }, { schedule, template: { ...template, device: resolution.id, ...settings }, resolution });
  return { layout, text, lines, rings, containers };
}

test('day cards preserve meetings, connect time dots, and expand Friday across the unused space', () => {
  const schedule = { classes: sampleSchedule.classes.map(course => ({ ...course, meetings: [...course.meetings, { ...course.meetings[0], startTime: '16:00', endTime: '17:00' }] })) };
  const { layout, text, lines } = render(schedule);
  assert.equal(layout.overflow, false);
  assert.deepEqual(layout.plans.map(p => p.day), ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  assert.equal(layout.plans.reduce((sum, plan) => sum + plan.entries.length, 0), 10);
  for (const index of [0, 2]) {
    assert.equal(layout.plans[index].y, layout.plans[index + 1].y);
    assert.equal(layout.plans[index].height, layout.plans[index + 1].height);
    assert.ok(layout.plans[index].x + layout.plans[index].width < layout.plans[index + 1].x);
  }
  assert.equal(layout.plans[4].x, layout.plans[0].x);
  assert.equal(layout.plans[4].width, layout.plans[1].x + layout.plans[1].width - layout.plans[0].x);
  assert.ok(text.includes('MONDAY') && !text.includes('Notes'));
  assert.equal(lines.length, 5);
  for (const [index, line] of lines.entries()) {
    const plan = layout.plans[index];
    assert.deepEqual(line, [plan.x + 46, plan.entries[0].y + layout.smallLineHeight / 2, plan.x + 46, plan.entries.at(-1).y + layout.smallLineHeight / 2]);
  }
  assert.ok(text.includes('CS 101') && text.includes('Lab 2'));
});

test('tablet card layout retains weekends and adapts its last open cell', () => {
  const saturday = { subject: 'Research Seminar', meetings: [{ day: 'Saturday', startTime: '08:00', endTime: '09:00' }] };
  const sunday = { subject: 'Community Project', meetings: [{ day: 'Sunday', startTime: '08:00', endTime: '09:00' }] };
  const six = render({ classes: [...sampleSchedule.classes, saturday] }).layout;
  assert.equal(six.plans.length, 6);
  assert.equal(six.notes, undefined);
  const seven = render({ classes: [...sampleSchedule.classes, saturday, sunday] }).layout;
  assert.equal(seven.plans.length, 7);
  assert.equal(seven.overflow, false);
  assert.ok(seven.plans[6].width > seven.plans[5].width);
});

test('tablet layout matches preview and export, honors movement, and blocks overcrowded schedules', () => {
  const before = render().layout;
  assert.deepEqual(render(sampleSchedule, {}, { id: 'tablet', width: 750, height: 1200 }).layout, before);
  for (const axis of ['horizontal', 'vertical']) for (const amount of [-100, 100]) {
    const after = render(sampleSchedule, { [`${axis}Position`]: amount }).layout;
    assert.equal(after.overflow, false);
    assert.equal(after.scheduleBounds.width, before.scheduleBounds.width);
    assert.equal(after.scheduleBounds.height, before.scheduleBounds.height);
    assert.ok(after.scheduleBounds.x >= -0.001);
    assert.ok(after.scheduleBounds.x + after.scheduleBounds.width <= 1920.001);
    assert.ok(after.scheduleBounds.y >= -0.001);
    assert.ok(after.scheduleBounds.y + after.scheduleBounds.height <= 3072 * 0.965 + 0.001);
  }
  const dense = { classes: [{ subject: 'Research', meetings: Array.from({ length: 90 }, () => ({ day: 'Monday', startTime: '08:00', endTime: '09:00' })) }] };
  assert.equal(render(dense).layout.overflow, true);
});

test('device layout choices expose mobile timeline, tablet all three, and laptop day cards', () => {
  assert.equal(scheduleLayout({}), 'stacked');
  assert.equal(scheduleLayout({ scheduleLayout: 'unknown' }), 'stacked');
  assert.deepEqual(scheduleLayoutOptions('mobile').map(o => o.value), ['stacked', 'timeline']);
  assert.deepEqual(scheduleLayoutOptions('tablet').map(o => o.value), ['stacked', 'day-cards', 'timeline']);
  assert.deepEqual(scheduleLayoutOptions('laptop').map(o => o.value), ['stacked', 'day-cards']);
  const mobile = { id: 'mobile', width: 1080, height: 2400 }, laptop = { id: 'laptop', width: 1920, height: 1080 };
  assert.deepEqual(render(sampleSchedule, {}, mobile).layout, render(sampleSchedule, { scheduleLayout: 'stacked' }, mobile).layout);
  const laptopCards = render(sampleSchedule, {}, laptop).layout;
  assert.equal(laptopCards.overflow, false);
  assert.equal(laptopCards.plans[0].y, laptopCards.plans[1].y);
  assert.ok(laptopCards.plans[4].width > laptopCards.plans[0].width);
  assert.deepEqual(render(sampleSchedule, { scheduleLayout: 'timeline' }, laptop).layout, render(sampleSchedule, { scheduleLayout: 'stacked' }, laptop).layout);
  const before = render(sampleSchedule, { tabletBoxSpacing: 20 }).layout;
  const after = render(sampleSchedule, { tabletBoxSpacing: 100 }).layout;
  assert.ok(after.plans[1].x - after.plans[0].x - after.plans[0].width > before.plans[1].x - before.plans[0].x - before.plans[0].width);
  assert.ok(after.plans[2].y - after.plans[0].y - after.plans[0].height > before.plans[2].y - before.plans[0].y - before.plans[0].height);
});

test('open Timeline keeps all weekdays, separate start/end times, and connects weekday rings without containers', () => {
  const allWeek = { classes: [...sampleSchedule.classes, ...['Saturday', 'Sunday'].map(day => ({ subject: 'Capstone seminar', courseCode: 'IT 490', meetings: [{ day, startTime: '08:00', endTime: '09:30', room: 'Lab 3', dateLabel: 'Oct 15–Dec 10' }] }))] };
  for (const resolution of [{ id: 'mobile', width: 1080, height: 2400 }, { id: 'tablet', width: 1600, height: 2560 }]) {
    const { layout, text, lines, rings, containers } = render(allWeek, { scheduleLayout: 'timeline' }, resolution);
    assert.equal(layout.overflow, false);
    assert.equal(layout.plans.length, 7);
    assert.equal(rings.length, 7);
    assert.equal(lines.length, 6);
    assert.equal(containers.length, 0);
    assert.ok(text.includes('Monday') && text.includes('Sunday') && !text.includes('Notes'));
    assert.deepEqual(layout.plans[0].entries[0].timeLines, ['8:00 AM', '9:30 AM']);
    assert.ok(layout.plans[0].timeX < layout.plans[0].subjectX && layout.plans[0].subjectX < layout.plans[0].roomX);
    for (const line of lines) assert.ok(line[0] === line[2] && line[1] < line[3]);
    const thumbnail = { ...resolution, width: resolution.width / 2, height: resolution.height / 2 };
    assert.deepEqual(render(allWeek, { scheduleLayout: 'timeline' }, thumbnail).layout, layout);
    const dense = { classes: [{ subject: 'Research', meetings: Array.from({ length: 90 }, () => ({ day: 'Monday', startTime: '08:00', endTime: '09:00' })) }] };
    assert.equal(render(dense, { scheduleLayout: 'timeline' }, resolution).layout.overflow, true);
  }
});
