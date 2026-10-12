import test from 'node:test';
import assert from 'node:assert/strict';
import { draftKey, readDraft, saveDraft } from '../src/lib/scheduleDraft.js';

const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};
const schedule = { classes: [{ subject: '', courseCode: null, meetings: [{ day: null, startTime: null, endTime: null, room: null, dateLabel: null }] }], warnings: [] };

test('unfinished classes and the title survive a draft round trip; clearing classes removes it', () => {
  const store = storage();
  assert.equal(saveDraft(store, schedule, 'My timetable'), true);
  assert.deepEqual(readDraft(store), { schedule, title: 'My timetable' });
  saveDraft(store, { classes: [], warnings: [] }, 'Class Schedule');
  assert.equal(readDraft(store), null);
});
test('malformed drafts are rejected and unavailable storage does not interrupt editing', () => {
  const store = storage();
  store.setItem(draftKey, JSON.stringify({ schedule: { classes: [{}] }, title: 'Invalid' }));
  assert.equal(readDraft(store), null);
  assert.equal(store.getItem(draftKey), null);
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('full'); } };
  assert.equal(readDraft(blocked), null);
  assert.equal(saveDraft(blocked, schedule, 'My timetable'), false);
});
