import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { isPublicDeploymentAsset } from '../scripts/public-assets.mjs';

test('deployment copies runtime assets while excluding retired, draft and source artwork', async () => {
  const root = await mkdtemp(join(tmpdir(), 'schedsnap-deployment-'));
  const source = join(root, 'public');
  const output = join(root, 'dist');
  const shipped = ['favicon.ico', 'fonts/face.woff2', 'images/hero/hero-phones-stacked-640.webp', 'images/hero/hero-phones.webp', 'images/collections/refreshed/laptop/featured-960.webp', 'brand/schedsnap-mark-128.webp'];
  const excluded = ['wallpapers/retired/mobile.png', 'wallpapers/unpublished/new.webp', 'images/mascots/masters/draft.png', 'images/doodle-mascots/masters/old.webp', 'images/collections/refreshed/laptop/featured.png', 'images/collections/catalog-mobile/featured.png', 'images/hero/hero-phones-stacked.png', 'images/maker/maker-capybara-static.png'];
  try {
    for (const file of [...shipped, ...excluded]) {
      const target = join(source, file);
      await mkdir(join(target, '..'), { recursive: true });
      await writeFile(target, file);
    }
    await cp(source, output, { recursive: true, filter: path => isPublicDeploymentAsset(relative(source, path).split(sep).join('/')) });
    assert.deepEqual((await readdir(output, { recursive: true })).filter(path => shipped.includes(path.split(sep).join('/'))).map(path => path.split(sep).join('/')).sort(), shipped.sort());
    for (const path of excluded) await assert.rejects(readdir(join(output, path)), { code: 'ENOENT' });
  } finally {
    assert.equal(dirname(root), resolve(tmpdir()));
    await rm(root, { recursive: true, force: true });
  }
});
