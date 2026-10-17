import test from 'node:test';
import assert from 'node:assert/strict';
import { wallpaperTemplates } from '../src/assets/templates.js';
import { backgroundColorKeywords, templateColorKeywords, withTemplateKeywords } from '../shared/templateKeywords.js';
import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';
import { createPublicCatalogHandler } from '../api/catalog.js';

test('every built-in template has deduplicated color and theme keywords within the editor limit', () => {
  assert.ok(wallpaperTemplates.length >= 235);
  for (const template of wallpaperTemplates) {
    const tags = template.keywords.toLowerCase().split(', ');
    assert.ok(template.keywords.length <= 500, template.id);
    assert.equal(new Set(tags).size, tags.length, template.id);
    for (const color of templateColorKeywords(template)) assert.ok(tags.includes(color), `${template.id}: ${color}`);
    assert.ok(tags.length >= 4, template.id);
    assert.equal(withTemplateKeywords(template).keywords, template.keywords, `${template.id}: stable on repeated reads`);
  }
});

test('color names include real palette colors and metadata details without importing unrelated characters', () => {
  const expected = [
    ['sanrio-pixel-lilac', ['purple', 'Hello Kitty', 'pixel art', 'ribbons']],
    ['snoopy-navy-cool', ['blue', 'white', 'Snoopy', 'hand drawn']],
    ['wbb-dusk-book-club', ['purple', 'Ice Bear', 'reading']],
    ['domo-velvet-cosmos', ['brown', 'celestial', 'fabric']],
    ['little-friends-kitten-snooze', ['Hachiware', 'cat', 'pastel']],
    ['ghibli-jiji-sage-paper', ['green', 'Jiji', "Kiki's Delivery Service"]],
    ['hxh-kurapika-plain', ['red', 'Hunter x Hunter', 'Kurapika']],
  ];
  for (const [id, terms] of expected) {
    const template = wallpaperTemplates.find(item => item.id === id);
    for (const term of terms) assert.ok(template.keywords.toLowerCase().split(', ').includes(term.toLowerCase()), `${id}: ${term}`);
  }
  assert.ok(!wallpaperTemplates.find(t => t.id === 'sanrio-pixel-lilac').keywords.includes('Kuromi'));
});

test('existing author keywords are preserved and only the keyword field changes', () => {
  const template = { id: 'custom', name: 'Custom', background: '#abc', keywords: 'My special phrase, WHITE, white', status: 'hidden', deviceImages: { mobile: '/custom.png' } };
  const result = withTemplateKeywords(template);
  const { keywords: _keywords, ...rest } = result;
  const { keywords: _original, ...original } = template;
  assert.deepEqual(rest, original);
  assert.ok(result.keywords.startsWith('My special phrase, WHITE'));
  assert.equal(result.keywords.toLowerCase().split(', ').filter(term => term === 'white').length, 1);
  assert.deepEqual(backgroundColorKeywords('#fff'), ['white']);
  assert.deepEqual(backgroundColorKeywords('#000000'), ['black', 'dark']);
  assert.deepEqual(backgroundColorKeywords('invalid'), []);
  const manga = withTemplateKeywords({ name: 'Gon · Manga', collection: 'hunter-x-hunter', background: '#288b50', keywords: 'red, orange, black' });
  assert.ok(!manga.keywords.split(', ').includes('green'), 'authored artwork colors take precedence over fallback canvas colors');
});

test('search can find designs by combined color, theme and character tags', () => {
  for (const [query, id] of [['purple Hello Kitty pixel', 'sanrio-pixel-lilac'], ['blue Snoopy', 'snoopy-navy-cool'], ['brown celestial Domo', 'domo-velvet-cosmos'], ['green Jiji', 'ghibli-jiji-sage-paper']]) {
    assert.ok(searchWallpaperTemplates(wallpaperTemplates, query).some(t => t.id === id), query);
  }
});

test('remote-only and newly added templates receive keywords in the public API without exposing hidden templates', async () => {
  const remote = { id: 'custom-green-garden', name: 'Garden', description: 'Green leaves on cream paper', collection: 'original', background: '#e2efdf', status: 'published' };
  const handler = createPublicCatalogHandler({ env: { CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'key', CLOUDINARY_API_SECRET: 'secret' }, store: { read: async () => ({ templates: [remote, { ...remote, id: 'hidden', status: 'hidden' }] }) } });
  const response = { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; } };
  await handler({ method: 'GET' }, response);
  assert.equal(response.code, 200);
  assert.equal(response.data.templates.length, 1);
  assert.ok(response.data.templates[0].keywords.includes('green'));
  assert.ok(response.data.templates[0].keywords.includes('nature'));
  assert.equal(response.data.templates[0].status, undefined);
});
