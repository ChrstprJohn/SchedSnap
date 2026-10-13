import test from 'node:test';
import assert from 'node:assert/strict';
import { searchWallpaperTemplates, scoreSearchPattern } from '../src/utils/wallpaperSearch.js';

test('empty or whitespace query returns all templates in original order', () => {
  const templates = [
    { id: '1', name: 'Notebook Hours' },
    { id: '2', name: 'Checker Study' },
    { id: '3', name: 'Bear Mode' },
  ];
  assert.deepEqual(searchWallpaperTemplates(templates, ''), templates);
  assert.deepEqual(searchWallpaperTemplates(templates, '   '), templates);
  assert.deepEqual(searchWallpaperTemplates(templates, null), templates);
  assert.deepEqual(searchWallpaperTemplates(templates, undefined), templates);
});

test('exact match or prefix match scores higher than scattered subsequence match', () => {
  const exactScore = scoreSearchPattern('bear', 'Bear');
  const prefixScore = scoreSearchPattern('bear', 'Bear Mode');
  const subsequenceScore = scoreSearchPattern('bear', 'Blue Sea Star'); // b...e...a...r scattered

  assert.ok(exactScore > 0);
  assert.ok(prefixScore > 0);
  assert.ok(exactScore >= prefixScore);
  assert.ok(prefixScore > subsequenceScore);
});

test('pattern matching matches non-exact spelling and typos', () => {
  // e.g. "notebk" matches "Notebook Hours"
  const templates = [
    { id: '1', name: 'Notebook Hours' },
    { id: '2', name: 'Checker Study' },
    { id: '3', name: 'Bear Mode' },
  ];
  const results = searchWallpaperTemplates(templates, 'notebk');
  assert.equal(results.length, 1);
  assert.equal(results[0].id, '1');
});

test('sorts results from most to least matching score', () => {
  const templates = [
    { id: '1', name: 'Cherry Blossom' },
    { id: '2', name: 'Blossom Clouds' },
    { id: '3', name: 'Blue Sky' },
  ];
  // Query "blossom" should rank "Blossom Clouds" (starts with blossom) or "Cherry Blossom" over "Blue Sky" (which doesn't match)
  const results = searchWallpaperTemplates(templates, 'blossom');
  assert.equal(results.length, 2);
  assert.equal(results[0].name, 'Blossom Clouds');
  assert.equal(results[1].name, 'Cherry Blossom');
});

test('tolerates case insensitivity and accents or punctuation', () => {
  const templates = [
    { id: '1', name: 'Café Study' },
    { id: '2', name: 'Night Owl' },
  ];
  const results = searchWallpaperTemplates(templates, 'cafe');
  assert.equal(results.length, 1);
  assert.equal(results[0].id, '1');
});

test('returns empty array when pattern does not match any template', () => {
  const templates = [
    { id: '1', name: 'Notebook Hours' },
    { id: '2', name: 'Checker Study' },
  ];
  const results = searchWallpaperTemplates(templates, 'zzzzzzxyz');
  assert.deepEqual(results, []);
});

test('ranks real templates appropriately when searching', async () => {
  const { wallpaperTemplates } = await import('../src/assets/templates.js');
  const results = searchWallpaperTemplates(wallpaperTemplates, 'cloud');
  assert.ok(results.length > 0);
  // All results must have matching pattern in name
  for (const r of results) {
    assert.ok(scoreSearchPattern('cloud', r.name) > 0);
  }
  // The first result should be the highest score
  const firstScore = scoreSearchPattern('cloud', results[0].name);
  const lastScore = scoreSearchPattern('cloud', results[results.length - 1].name);
  assert.ok(firstScore >= lastScore);
});

