import test from 'node:test';
import assert from 'node:assert/strict';
import { sortTemplatesByLikes } from '../src/utils/sortTemplatesByLikes.js';

test('gallery orders most liked first, then newest, without changing the catalog', () => {
  const templates = [
    { id: 'undated' },
    { id: 'popular', publishedAt: '2026-01-01' },
    { id: 'older', publishedAt: '2026-10-10' },
    { id: 'newest', publishedAt: '2026-10-13' },
    { id: 'draft-date', createdAt: '2026-10-12' },
    { id: 'invalid-date', publishedAt: 'invalid' },
  ];
  const likes = { popular: { count: 12 }, older: { count: 1 }, newest: { count: 1 } };
  const ids = items => items.map(item => item.id);
  assert.deepEqual(ids(sortTemplatesByLikes(templates, likes)), ['popular', 'newest', 'older', 'draft-date', 'undated', 'invalid-date']);
  assert.deepEqual(ids(sortTemplatesByLikes(templates, {})), ['newest', 'draft-date', 'older', 'popular', 'undated', 'invalid-date']);
  assert.deepEqual(ids(templates), ['undated', 'popular', 'older', 'newest', 'draft-date', 'invalid-date']);
});
