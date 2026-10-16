import test from 'node:test';
import assert from 'node:assert/strict';
import { searchWallpaperTemplates, scoreSearchPattern } from '../src/utils/wallpaperSearch.js';

test('searches collection ids, display names and style categories without duplicating results', () => {
  const templates = [
    { id: 'hu-tao', name: 'Hu Tao · Cozy Nap', collection: 'genshin' },
    { id: 'bear', name: 'Quiet Afternoon', collection: 'we-bare-bears' },
    { id: 'pixel', name: 'Tiny Friend', collection: 'mascot', layout: 'mascot', mascotStyle: 'pixel' },
    { id: 'other', name: 'Notebook Hours' },
  ];
  assert.deepEqual(searchWallpaperTemplates(templates, ' GENSHIN '), [templates[0]]);
  assert.deepEqual(searchWallpaperTemplates(templates, 'We Bare Bears'), [templates[1]]);
  assert.deepEqual(searchWallpaperTemplates(templates, 'Pixel art'), [templates[2]]);
  assert.deepEqual(searchWallpaperTemplates([{ ...templates[0], name: 'Genshin Nap' }], 'genshin').length, 1);
});

test('Genshin search includes every design in the real Genshin collection', async () => {
  const { wallpaperTemplates } = await import('../src/assets/templates.js');
  const results = searchWallpaperTemplates(wallpaperTemplates, 'genshin');
  const genshin = wallpaperTemplates.filter(template => template.collection === 'genshin');
  assert.ok(genshin.length > 0);
  for (const template of genshin) {
    assert.ok(results.includes(template), template.name);
    assert.ok(template.keywords.includes('Genshin Impact'), template.id);
    assert.ok(template.keywords.length <= 500, template.id);
  }
  const fullNameResults = searchWallpaperTemplates(wallpaperTemplates, 'Genshin Impact');
  for (const template of genshin) assert.ok(fullNameResults.includes(template), template.name);
});

test('Genshin context keywords distinguish namecards from chibi wallpapers', async () => {
  const { wallpaperTemplates } = await import('../src/assets/templates.js');
  const genshin = wallpaperTemplates.filter(template => template.collection === 'genshin');
  for (const query of ['background', 'wallpaper', 'Teyvat', 'anime']) {
    const results = searchWallpaperTemplates(wallpaperTemplates, query);
    for (const template of genshin) assert.ok(results.includes(template), `${query}: ${template.id}`);
  }
  const huTao = genshin.find(template => template.id === 'genshin-card-hutao-spirit');
  const nap = genshin.find(template => template.id === 'genshin-hutao-nap');
  for (const query of ['namecard', 'name card', 'banner', 'Hu Tao namecard', 'genshin impact banner']) {
    const results = searchWallpaperTemplates(wallpaperTemplates, query);
    assert.ok(results.includes(huTao), query);
    assert.ok(!results.includes(nap), query);
  }
  assert.ok(searchWallpaperTemplates(wallpaperTemplates, 'chibi background').includes(nap));
  assert.ok(!searchWallpaperTemplates(wallpaperTemplates, 'sanrio namecard').includes(huTao));
  assert.equal(searchWallpaperTemplates(wallpaperTemplates, 'Hu Tao · Spirit Soother')[0], huTao);
});

test('character keywords cover Genshin chibi and namecards, including supporting characters', async () => {
  const { wallpaperTemplates } = await import('../src/assets/templates.js');
  const cases = [
    ['character chibi', 'genshin-hutao-nap'],
    ['character namecard', 'genshin-card-hutao-spirit'],
    ['Hu Tao chibi', 'genshin-hutao-nap'],
    ['Hu Tao namecard', 'genshin-card-hutao-spirit'],
    ['Kaeya namecard', 'genshin-kaeya-atlas'],
    ['Arlecchino namecard', 'genshin-original-kaeya-map'],
    ['Arlecchino chibi', 'genshin-arlecchino-ember'],
    ['Paimon chibi', 'genshin-tidal-sketches'],
  ];
  for (const [query, id] of cases) {
    assert.ok(searchWallpaperTemplates(wallpaperTemplates, query).some(template => template.id === id), query);
  }
  assert.ok(!searchWallpaperTemplates(wallpaperTemplates, 'character namecard').some(template => template.id === 'genshin-sky-welkin'));
});

test('plural Genshin context keywords match their singular forms', async () => {
  const { wallpaperTemplates } = await import('../src/assets/templates.js');
  for (const [singular, plural] of [
    ['namecard', 'namecards'], ['name card', 'name cards'], ['banner', 'banners'],
    ['background', 'backgrounds'], ['wallpaper', 'wallpapers'], ['character', 'characters'],
    ['Hu Tao namecard', 'Hu Tao namecards'], ['chibi background', 'chibi backgrounds'],
  ]) {
    const ids = query => searchWallpaperTemplates(wallpaperTemplates, query)
      .filter(template => template.collection === 'genshin').map(template => template.id).sort();
    assert.ok(ids(singular).length > 0, singular);
    assert.deepEqual(ids(plural), ids(singular), plural);
  }
});

test('admin keywords support phrases, character combinations and plurals in any collection', () => {
  const template = { id: 'custom', name: 'Evening Study', collection: 'sanrio', keywords: 'moonlight, cozy background, sleepy cat' };
  for (const query of ['moonlight', 'cozy background', 'Evening moonlight', 'sleepy cats']) {
    assert.deepEqual(searchWallpaperTemplates([template], query), [template], query);
  }
  assert.deepEqual(searchWallpaperTemplates([{ ...template, keywords: '' }], 'moonlight'), []);
  assert.deepEqual(searchWallpaperTemplates([{ ...template, collection: 'genshin', keywords: '' }], 'background'), []);
});

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
  // Genshin descriptions provide context beyond the displayed title.
  for (const r of results) {
    assert.ok(scoreSearchPattern('cloud', r.name) > 0 || (r.collection === 'genshin' && r.description?.toLowerCase().includes('cloud')));
  }
  // The first result should be the highest score
  const firstScore = scoreSearchPattern('cloud', results[0].name);
  const lastScore = scoreSearchPattern('cloud', results[results.length - 1].name);
  assert.ok(firstScore >= lastScore);
});
