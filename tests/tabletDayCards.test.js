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
  assert.deepEqual(scheduleLayoutOptions('laptop').map(o => o.value), ['stacked', 'day-cards', 'weekly']);
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

test('Timeline preserves weekdays and times with connected rings and divider lines instead of containers', () => {
  const allWeek = { classes: [...sampleSchedule.classes, ...['Saturday', 'Sunday'].map(day => ({ subject: 'Capstone seminar', courseCode: 'IT 490', meetings: [{ day, startTime: '08:00', endTime: '09:30', room: 'Lab 3', dateLabel: 'Oct 15–Dec 10' }] }))] };
  for (const resolution of [{ id: 'mobile', width: 1080, height: 2400 }, { id: 'tablet', width: 1600, height: 2560 }]) {
    const { layout, text, lines, rings, containers } = render(allWeek, { scheduleLayout: 'timeline' }, resolution);
    assert.equal(layout.overflow, false);
    assert.equal(layout.plans.length, 7);
    assert.equal(rings.length, 7);
    assert.equal(lines.filter(line => line[0] === line[2]).length, 6);
    assert.equal(lines.filter(line => line[1] === line[3]).length, 6);
    assert.equal(containers.length, 0);
    assert.ok(text.includes('Monday') && text.includes('Sunday') && !text.includes('Notes'));
    assert.deepEqual(layout.plans[0].entries[0].timeLines, ['8:00 AM', '9:30 AM']);
    assert.ok(layout.plans[0].timeX < layout.plans[0].subjectX && layout.plans[0].subjectX < layout.plans[0].roomX);
    for (const line of lines.filter(line => line[0] === line[2])) assert.ok(line[1] < line[3]);
    const thumbnail = { ...resolution, width: resolution.width / 2, height: resolution.height / 2 };
    assert.deepEqual(render(allWeek, { scheduleLayout: 'timeline' }, thumbnail).layout, layout);
    const dense = { classes: [{ subject: 'Research', meetings: Array.from({ length: 90 }, () => ({ day: 'Monday', startTime: '08:00', endTime: '09:00' })) }] };
    assert.equal(render(dense, { scheduleLayout: 'timeline' }, resolution).layout.overflow, true);
  }
});

test('Timeline grows type for available space, separates multiple meetings, and stays open without container settings', () => {
  const twoMeetings = { classes: sampleSchedule.classes.map(course => ({ ...course, meetings: [...course.meetings, { ...course.meetings[0], startTime: '16:00', endTime: '17:30' }] })) };
  const larger = render(sampleSchedule, { scheduleLayout: 'timeline' }).layout;
  assert.ok(larger.timeLineHeight > render(sampleSchedule, { scheduleLayout: 'stacked' }).layout.timeLineHeight);
  for (const resolution of [{ id: 'mobile', width: 1080, height: 2400 }, { id: 'tablet', width: 1600, height: 2560 }]) {
    const { layout, containers, lines } = render(twoMeetings, { scheduleLayout: 'timeline', containerFill: false, containerBorder: false }, resolution);
    assert.equal(layout.overflow, false);
    assert.equal(containers.length, 0);
    assert.equal(lines.filter(line => line[1] === line[3]).length, 9);
    for (const plan of layout.plans) assert.ok(plan.entries[1].y - plan.entries[0].bottom >= (resolution.id === 'mobile' ? 16 : 20));
  }
});

test('mobile Timeline uses wider rows and larger type with compact readable gaps', () => {
  const mobile = { id: 'mobile', width: 1080, height: 2400 };
  const { layout } = render(sampleSchedule, { scheduleLayout: 'timeline' }, mobile);
  assert.equal(layout.overflow, false);
  assert.ok(layout.size >= 56);
  assert.equal(layout.plans[0].x, 36);
  assert.equal(layout.plans[0].width, 1008);
  assert.ok(layout.bottom <= layout.limit);
  const enlarged = render({ classes: [sampleSchedule.classes[0]] }, { scheduleLayout: 'timeline', fontScale: 1.6, verticalPosition: -35 }, mobile).layout;
  assert.equal(enlarged.overflow, false);
  assert.ok(enlarged.scheduleBounds.y >= 412);
  for (const plan of enlarged.plans) for (const entry of plan.entries) assert.ok(entry.timeLines.every(line => line.length * enlarged.size * 0.78 * 0.55 <= plan.timeWidth - 8));
  const doubled = { classes: sampleSchedule.classes.map(course => ({ ...course, meetings: [...course.meetings, { ...course.meetings[0], startTime: '16:00', endTime: '17:30' }] })) };
  const dense = render(doubled, { scheduleLayout: 'timeline' }, mobile).layout;
  assert.equal(dense.overflow, false);
  assert.equal(dense.plans.flatMap(plan => plan.entries).length, 10);
  for (const plan of dense.plans) {
    assert.equal(plan.entries[1].y - plan.entries[0].bottom, 16);
    for (const entry of plan.entries) {
      assert.ok(entry.timeLines.every(line => line.length * dense.size * 0.78 * 0.55 <= plan.timeWidth));
      assert.ok(entry.codeY >= entry.y && entry.subjectY + entry.subjectHeight <= entry.bottom);
    }
  }
  assert.deepEqual(render(sampleSchedule, { scheduleLayout: 'timeline' }, { ...mobile, width: 540, height: 1200 }).layout, layout);
});

test('tablet Timeline uses more width, larger type and compact rows within its wallpaper bounds', () => {
  const { layout } = render(sampleSchedule, { scheduleLayout: 'timeline', verticalPosition: -35 });
  assert.equal(layout.overflow, false);
  assert.ok(layout.scheduleBounds.width > 1920 * 0.83);
  assert.ok(layout.size >= 54);
  assert.ok(layout.scheduleBounds.height <= 3072 * 0.68);
  assert.ok(layout.scheduleBounds.y + layout.scheduleBounds.height <= 3072 * 0.965);
  assert.ok(layout.scheduleBounds.y + 12 * layout.scheduleBounds.width / 1244 >= 3072 * 0.18);
  for (const amount of [-100, 100]) {
    const moved = render(sampleSchedule, { scheduleLayout: 'timeline', verticalPosition: amount }).layout;
    assert.equal(moved.overflow, false);
    assert.ok(moved.scheduleBounds.y + moved.scheduleBounds.height <= 3072 * 0.965 + 0.001);
  }
});

test('weekly timetable places blocks by time, includes weekend days, and shares preview/export geometry', () => {
  const laptop = { id: 'laptop', width: 1920, height: 1080 };
  const { layout, text, lines } = render(sampleSchedule, { scheduleLayout: 'weekly' }, laptop);
  assert.equal(layout.overflow, false);
  assert.equal(layout.plans.length, 5);
  assert.equal(layout.plans.flatMap(plan => plan.entries).length, 5);
  assert.ok(text.includes('Time') && text.includes('Monday') && text.includes('CS 101'));
  for (const plan of layout.plans) for (const entry of plan.entries) {
    assert.equal(entry.x, plan.x);
    assert.equal(entry.width, plan.width);
    assert.equal(entry.y, layout.gridTop + (entry.start - layout.startMinute) / (layout.endMinute - layout.startMinute) * layout.bodyHeight);
    assert.ok(Math.abs(entry.y + entry.height - (layout.gridTop + (entry.end - layout.startMinute) / (layout.endMinute - layout.startMinute) * layout.bodyHeight)) < 0.001);
    assert.ok(entry.contentHeight <= entry.height - 20);
    assert.equal(entry.subjectLines.join(' '), entry.subject);
    assert.equal(entry.timeLines, undefined);
  }
  assert.ok(text.includes('3:00 PM'));
  assert.ok(text.includes('8:30 AM'));
  assert.ok(!text.some(value => value.includes('AM–') || value.includes('PM–')));
  const halfHourY = layout.gridTop + 30 / (layout.endMinute - layout.startMinute) * layout.bodyHeight;
  assert.ok(lines.some(line => line[1] === halfHourY && line[3] === halfHourY));
  assert.deepEqual(render(sampleSchedule, { scheduleLayout: 'weekly' }, { ...laptop, width: 960, height: 540 }).layout, layout);
  const saturday = { subject: 'Research Lab', courseCode: 'IT 490', meetings: [{ day: 'Saturday', startTime: '09:00', endTime: '12:00', room: 'Lab 3' }] };
  const weekend = render({ classes: [...sampleSchedule.classes, saturday] }, { scheduleLayout: 'weekly' }, laptop).layout;
  assert.equal(weekend.plans.length, 6);
  assert.equal(weekend.plans[5].entries.length, 1);
  assert.equal(weekend.overflow, false);
});

test('weekly timetable displays overlaps side by side, aligns adjacent classes, and rejects unreadable short events', () => {
  const laptop = { id: 'laptop', width: 1920, height: 1080 };
  const course = (code, startTime, endTime) => ({ subject: 'Capstone Seminar', courseCode: code, meetings: [{ day: 'Monday', startTime, endTime, room: 'Lab 2' }] });
  const schedule = { classes: [course('IT 401', '08:00', '10:00'), course('IT 402', '09:00', '11:00'), course('IT 403', '11:00', '13:00')] };
  const layout = render(schedule, { scheduleLayout: 'weekly' }, laptop).layout;
  assert.equal(layout.overflow, false);
  const [first, second, third] = layout.plans[0].entries;
  assert.equal(first.x, layout.plans[0].x);
  assert.equal(first.x + first.width, second.x);
  assert.equal(second.x + second.width, layout.plans[0].x + layout.plans[0].width);
  assert.equal(second.y + second.height, third.y);
  assert.equal(first.lanes, 2);
  assert.equal(second.lanes, 2);
  assert.equal(third.lanes, 1);
  assert.ok(third.width > first.width);
  assert.equal(render({ classes: [course('IT 401', '08:00', '08:05')] }, { scheduleLayout: 'weekly' }, laptop).layout.overflow, true);
});

test('weekly timetable gives one-hour classes enough room for subject names', () => {
  const schedule = { classes: sampleSchedule.classes.map((course, index) => index ? course : { ...course, meetings: [{ ...course.meetings[0], endTime: '09:00' }] }) };
  const resolution = { id: 'laptop', width: 1920, height: 1080 };
  const { layout } = render(schedule, { scheduleLayout: 'weekly' }, resolution);
  assert.equal(layout.overflow, false);
  for (const entry of layout.plans.flatMap(plan => plan.entries)) {
    assert.equal(entry.subjectLines.join(' '), entry.subject);
    assert.ok(entry.contentHeight <= entry.height - 20);
  }
  assert.deepEqual(render(schedule, { scheduleLayout: 'weekly' }, { ...resolution, width: 960, height: 540 }).layout, layout);
});
