import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { CREATOR_PATH, SEO_PAGES, SITE_URL } from '../shared/seo.js';

for (const path of Object.keys(SEO_PAGES)) {
  const file = path === '/' ? 'index.html' : `${path.slice(1)}/index.html`;
  const html = await readFile(resolve('dist', file), 'utf8');
  assert.equal((html.match(/<title>/g) || []).length, 1, path);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, path);
  assert.ok(html.includes(`href="${SITE_URL}${path}"`), path);
  assert.ok(html.includes('content="index, follow"'), path);
  assert.ok(html.includes('type="image/png" sizes="96x96" href="/favicon.png"'), path);
  assert.ok(!html.includes('rel="icon" type="image/webp"'), path);
  if (path !== CREATOR_PATH) assert.ok(html.includes('<h1'), path);
  if (path === '/') {
    const schema = JSON.parse(html.match(/id="website-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.alternateName, 'Sched Snap');
    assert.ok(html.includes('SchedSnap (Sched Snap) turns your class schedule'));
    assert.ok(html.includes('Your schedule.'));
    assert.ok(html.includes('href="/services/schedule-wallpaper"'));
    assert.ok(html.includes('How it works'));
  }
  for (const [, asset] of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) {
    await stat(resolve('dist', asset.slice(1)));
  }
}
for (const file of ['admin.html', 'app.html']) {
  const html = await readFile(resolve('dist', file), 'utf8');
  assert.ok(html.includes('content="noindex, follow"'), file);
  assert.ok(!html.includes('Your schedule.'), file);
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, Object.keys(SEO_PAGES).length);
assert.ok(!sitemap.includes('/admin'));
for (const [, url] of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) assert.ok(!url.includes('?'));
assert.ok(!sitemap.includes('/wallpapers/'));
const robots = await readFile('dist/robots.txt', 'utf8');
for (const file of ['favicon.png', 'favicon.ico', 'apple-touch-icon.png']) {
  assert.deepEqual(await readFile(resolve('dist', file)), await readFile(resolve('public', file)));
}
assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
assert.equal(await readFile('dist/google82dfedb9e6c18663.html', 'utf8'), await readFile('public/google82dfedb9e6c18663.html', 'utf8'));
console.log('SEO checks passed: public HTML, links/assets, canonical URLs, sitemap, robots, noindex shells, and Google verification.');
