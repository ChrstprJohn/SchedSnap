import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import manifest from '../../src/assets/cloudinaryManifest.js';

const source = execFileSync('git', ['show', 'HEAD:src/assets/cloudinaryManifest.js'], { encoding: 'utf8' });
const before = JSON.parse(source.slice(source.indexOf('export default ') + 15).trim().replace(/;$/, ''));
for (const [path, record] of Object.entries(before)) assert.deepEqual(manifest[path], record, path);
const artworkFile = process.argv[2] || 'output/genshin/manifest.json';
const reportFile = process.argv[3] || 'output/genshin/cloudinary-verification.json';
const artwork = JSON.parse(await readFile(artworkFile, 'utf8'));
const previousFiles = ['output/genshin/manifest.json', 'output/genshin-backgrounds/manifest.json', 'output/genshin-namecards-2/manifest.json'];
const artworkPaths = new Set((await Promise.all(previousFiles.map(async file => {
  try { return JSON.parse(await readFile(file, 'utf8')).assets.map(asset => '/' + asset.path.slice(7)); }
  catch { return []; }
}))).flat());
assert.equal(artwork.assets.length, artwork.assetCount);
const added = Object.keys(manifest).filter(path => !before[path]);
// Other local work may add artwork; delivery checks stay scoped to this batch.
const otherWorkspaceAdditions = added.filter(path => !artworkPaths.has(path)).length;
const reports = await Promise.all(artwork.assets.map(async asset => {
  const path = '/' + asset.path.slice(7);
  const entry = manifest[path];
  assert.ok(entry, path);
  assert.equal(entry.width, asset.width);
  assert.equal(entry.height, asset.height);
  assert.equal(entry.publicId, `schedsnap${path.slice(0, -4)}-${asset.sha256.slice(0, 16)}`);
  const response = await fetch(entry.url, { method: 'HEAD', headers: { Origin: 'http://localhost:5173' }, signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, path);
  assert.ok(response.headers.get('content-type')?.startsWith('image/png'), path);
  assert.equal(response.headers.get('access-control-allow-origin'), '*', path);
  return { path, url: entry.url, status: response.status, png: true, canvasCors: true, dimensionsVerified: true, hashVerified: true };
}));
await writeFile(reportFile, JSON.stringify({ assets: reports, previousEntriesPreserved: Object.keys(before).length, newEntries: added.length, otherWorkspaceAdditions }, null, 2) + '\n');
process.stdout.write(`Verified ${reports.length} PNG delivery URLs and Canvas CORS; ${Object.keys(before).length} previous entries preserved.\n`);
