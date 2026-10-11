import test from 'node:test';
import assert from 'node:assert/strict';
import { isNewTemplate, NEW_TEMPLATE_WINDOW_MS } from '../src/utils/templateFreshness.js';

const now = Date.parse('2026-10-11T12:00:00Z');
const iso = age => new Date(now - age).toISOString();
test('New badge covers exactly seven days including launch but excluding expiry', () => {
  assert.equal(isNewTemplate({ createdAt: iso(0) }, now), true);
  assert.equal(isNewTemplate({ createdAt: iso(NEW_TEMPLATE_WINDOW_MS - 1) }, now), true);
  assert.equal(isNewTemplate({ createdAt: iso(NEW_TEMPLATE_WINDOW_MS) }, now), false);
  assert.equal(isNewTemplate({ createdAt: iso(NEW_TEMPLATE_WINDOW_MS + 1) }, now), false);
});
test('future, invalid, absent dates and updates do not make designs New', () => {
  for (const createdAt of [iso(-1), 'invalid', '', undefined, null, 0]) assert.equal(isNewTemplate({ createdAt, updatedAt: iso(0) }, now), false);
  assert.equal(isNewTemplate({ createdAt: iso(NEW_TEMPLATE_WINDOW_MS + 1), updatedAt: iso(0) }, now), false);
});
test('first publication starts the window after draft creation', () => {
  assert.equal(isNewTemplate({ createdAt: iso(NEW_TEMPLATE_WINDOW_MS * 2), publishedAt: iso(0) }, now), true);
  assert.equal(isNewTemplate({ createdAt: iso(0), publishedAt: 'invalid' }, now), false);
});
