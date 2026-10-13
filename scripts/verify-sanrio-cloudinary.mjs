/* global fetch, AbortSignal, console */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import manifest from '../src/assets/cloudinaryManifest.js';

const artwork = JSON.parse(await readFile('output/sanrio/manifest.json', 'utf8'));
const originalSource = await readFile('output/sanrio/review/cloudinaryManifest-before.js', 'utf8');
const before = JSON.parse(originalSource.slice(originalSource.indexOf('export default ') + 15).trim().replace(/;$/, ''));
if (artwork.assets.length !== 36) throw new Error('Expected exactly 36 audited assets.');
const alteredPrevious = Object.keys(before).filter(path => JSON.stringify(before[path]) !== JSON.stringify(manifest[path]));
if (alteredPrevious.length) throw new Error(`Previous asset metadata changed: ${alteredPrevious.length} paths.`);
const paths = artwork.assets.map(asset => '/' + asset.path.slice('public/'.length));
const addedPaths = Object.keys(manifest).filter(path => !before[path]);
if (addedPaths.length !== 36 || addedPaths.some(path => !paths.includes(path))) throw new Error('Upload scope differs from the 36 audited assets.');
const reports = [];
for (const asset of artwork.assets) {
  const path = '/' + asset.path.slice('public/'.length);
  const uploaded = manifest[path];
  const bytes = await readFile(asset.path);
  const hash = createHash('sha256').update(bytes).digest('hex');
  const expectedId = `schedsnap${path.replace(/\.png$/, '')}-${hash.slice(0, 16)}`;
  if (hash !== asset.sha256 || uploaded?.publicId !== expectedId || uploaded.width !== asset.width || uploaded.height !== asset.height
    || !uploaded.url.startsWith(`https://res.cloudinary.com/${uploaded.cloud}/`)) throw new Error(`Uploaded metadata mismatch: ${path}`);
  reports.push({ path, ...uploaded, hashVerified: true, dimensionsVerified: true });
}
if (process.argv.includes('--delivery')) {
  let index = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (index < reports.length) {
      const report = reports[index++];
      const response = await fetch(report.url, { method: 'HEAD', headers: { Origin: 'https://schedsnap.example' }, signal: AbortSignal.timeout(60000) });
      report.delivery = { status: response.status, contentType: response.headers.get('content-type'), cors: response.headers.get('access-control-allow-origin') };
      if (!response.ok || !report.delivery.contentType?.startsWith('image/png') || report.delivery.cors !== '*') throw new Error(`PNG delivery or canvas CORS failed: ${report.path}`);
    }
  }));
}
const report = { auditedAssets: reports.length, previousEntriesPreserved: Object.keys(before).length, newEntries: addedPaths.length, deliveryChecked: process.argv.includes('--delivery'), assets: reports };
await writeFile('output/sanrio/cloudinary-verification.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ auditedAssets: report.auditedAssets, previousEntriesPreserved: report.previousEntriesPreserved, newEntries: report.newEntries, deliveryChecked: report.deliveryChecked }));
