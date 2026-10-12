import test from 'node:test';
import assert from 'node:assert/strict';
import { CREATOR_PATH, getPageSeo, SEO_PAGES, SITE_URL } from '../shared/seo.js';
import { seoHead, replaceSeoHead } from '../scripts/seo-html.mjs';

test('public pages have distinct titles, descriptions, and preferred URLs', () => {
  const titles = new Set();
  for (const path of Object.keys(SEO_PAGES)) {
    const page = getPageSeo(path);
    assert.equal(page.index, true);
    assert.equal(page.canonical, `${SITE_URL}${path}`);
    assert.ok(page.description.length > 50);
    titles.add(page.title);
  }
  assert.equal(titles.size, Object.keys(SEO_PAGES).length);
  assert.deepEqual(getPageSeo(`${CREATOR_PATH}/`), getPageSeo(CREATOR_PATH));
});

test('admin, editor sessions, and unknown URLs stay out of the search index', () => {
  for (const path of ['/admin', '/admin/catalog', `${CREATOR_PATH}/soft-bear`, '/missing']) {
    assert.equal(getPageSeo(path).index, false, path);
    assert.match(seoHead(path), /content="noindex, follow"/);
  }
  assert.equal(getPageSeo('/admin').canonical, null);
  assert.equal(getPageSeo('/missing').canonical, null);
  assert.equal(getPageSeo(`${CREATOR_PATH}/soft-bear`).canonical, `${SITE_URL}${CREATOR_PATH}`);
});

test('static route HTML replaces homepage metadata instead of accumulating duplicates', () => {
  const home = `<html><head>${seoHead('/')}</head><body><div id="root"></div></body></html>`;
  const creator = replaceSeoHead(home, CREATOR_PATH);
  assert.equal((creator.match(/<title>/g) || []).length, 1);
  assert.equal((creator.match(/rel="canonical"/g) || []).length, 1);
  assert.match(creator, /Create a Class Schedule Wallpaper/);
  assert.ok(!creator.includes('website-schema'));
  const schema = JSON.parse(home.match(/type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@type'], 'WebSite');
  assert.equal(schema.url, `${SITE_URL}/`);
});
