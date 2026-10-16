import test from 'node:test';
import assert from 'node:assert/strict';
import { templateSchema } from '../shared/templateSchema.js';
import { hunterTemplates } from '../src/assets/hunterTemplates.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { readFileSync } from 'node:fs';
import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';

const template = {
  id: 'hxh-gon-plain', name: 'Gon', collection: 'hunter-x-hunter', status: 'published', mobileOnly: true,
  background: '#eef4ea', ink: '#223322', muted: '#223322', surface: '#ffffffee', line: '#22332245',
  image: '/wallpapers/scenic/hxh-gon-plain/mobile.png',
  deviceImages: { mobile: '/wallpapers/scenic/hxh-gon-plain/mobile.png' },
};

test('mobile-only backgrounds publish with a matching mobile image', () => {
  assert.equal(templateSchema.parse(template).mobileOnly, true);
  assert.equal(templateSchema.safeParse({ ...template, mobileOnly: false }).success, false);
  assert.equal(templateSchema.safeParse({ ...template, deviceImages: {} }).success, false);
  assert.equal(templateSchema.safeParse({ ...template, image: '/wallpapers/other.png' }).success, false);
});

test('Hunter designs can be found by character, color, motif and anime category', () => {
  for (const [query, id] of [
    ['Gon red orange manga', 'hxh-gon-manga'],
    ['Leorio yellow orange', 'hxh-leorio-manga'],
    ['Hisoka pink manga', 'hxh-hisoka-manga'],
    ['Killua blue lightning chibi', 'hxh-killua-chibi'],
    ['Kurapika burgundy chain', 'hxh-kurapika-chibi'],
    ['Leorio teal glasses briefcase', 'hxh-leorio-chibi'],
    ['Gon sage fishing', 'hxh-gon-chibi'],
  ]) {
    assert.ok(searchWallpaperTemplates(hunterTemplates, query).some(t => t.id === id), query);
  }
  assert.equal(searchWallpaperTemplates(hunterTemplates, 'anime').length, 15);
  for (const item of hunterTemplates) {
    assert.ok(item.keywords.length <= 500);
    assert.ok(item.keywords.includes(','));
  }
});

test('Hunter collection contains exactly fifteen mobile PNG templates', () => {
  assert.equal(hunterTemplates.length, 15);
  assert.equal(new Set(hunterTemplates.map(item => item.id)).size, 15);
  assert.deepEqual(['manga', 'plain', 'chibi', 'group'].map(family => hunterTemplates.filter(item => item.family === family).length), [5, 4, 4, 2]);
  for (const item of hunterTemplates) {
    assert.equal(matchesGalleryCategory(item, 'hunter-x-hunter'), true);
    assert.equal(templateSchema.parse({ ...item, status: 'published' }).mobileOnly, true);
    assert.deepEqual(Object.keys(item.deviceImages), ['mobile']);
    const png = readFileSync(new URL(`../public${item.image}`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1080);
    assert.equal(png.readUInt32BE(20), 2400);
  }
});
