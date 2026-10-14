/* global console */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { chikawaReferenceTemplates as chikawaTemplates } from '../src/assets/chikawaReferenceTemplates.js';
import { onepieceTemplates } from '../src/assets/onepieceTemplates.js';
import { onepieceAdventureTemplates } from '../src/assets/onepieceAdventureTemplates.js';
import { onepieceReferenceTemplates } from '../src/assets/onepieceReferenceTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';
import { galleryCategories } from '../src/config/collections.js';

const digest = value => createHash('sha256').update(value).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
const inspection = JSON.parse(await readFile('output/chikawa-reference-collection/manifest.json', 'utf8'));
const reviewed = new Map(inspection.assets.map(asset => [asset.path, asset]));
if (inspection.assets.length !== 36 || reviewed.size !== 36) throw Error('Expected 36 reviewed assets.');
const fileBytes = new Map(await Promise.all(chikawaTemplates.flatMap(t => Object.values(t.deviceImages))
  .map(async path => [path, await readFile(resolve('public', path.slice(1)))])));
const store = createCatalogStore(process.env);
const before = await store.read(true);
// Retain filters from other concurrently published collections. This standalone
// process shares the same category array with catalogStore's writer.
for (const category of before.categories || []) {
  if (category.id !== 'onepiece' && !galleryCategories.some(item => item.id === category.id)) galleryCategories.push(category);
}
const retiredIds = new Set([...onepieceTemplates, ...onepieceAdventureTemplates, ...onepieceReferenceTemplates].map(t => t.id));
const newIds = new Set(chikawaTemplates.map(t => t.id));
const removed = before.templates.filter(t => retiredIds.has(t.id) || t.collection === 'onepiece');
const preserved = before.templates.filter(t => !retiredIds.has(t.id) && t.collection !== 'onepiece' && !newIds.has(t.id));
const now = new Date().toISOString();
const replacements = chikawaTemplates.map(definition => {
  const old = before.templates.find(t => t.id === definition.id);
  const deviceImages = Object.fromEntries(Object.entries(definition.deviceImages).map(([device, path]) => {
    const inspectionEntry = reviewed.get('public' + path);
    const bytes = checkedBytes(path, inspectionEntry, device);
    const sha = digest(bytes);
    const uploaded = manifest[path];
    if (!uploaded || uploaded.cloud !== process.env.CLOUDINARY_CLOUD_NAME
      || uploaded.publicId !== `schedsnap${path.slice(0, -4)}-${sha.slice(0, 16)}`
      || uploaded.width !== bytes.readUInt32BE(16) || uploaded.height !== bytes.readUInt32BE(20)) {
      throw Error(`Current reviewed artwork has not been uploaded: ${path}`);
    }
    return [device, uploaded.url];
  }));
  return templateSchema.parse({ ...definition, status: 'published', image: deviceImages.mobile, deviceImages,
    createdAt: old?.createdAt || definition.createdAt, publishedAt: old?.publishedAt || now });
});

// Load only the 36 scoped PNGs before computing the publication proposal.
function checkedBytes(path, entry, device) {
  const bytes = fileBytes.get(path);
  const dimensions = { mobile: [1080, 2400], tablet: [1600, 2560], laptop: [1920, 1080] }[device];
  if (!entry?.likenessApproved || !entry.opaque || !entry.dimensionsValid || !bytes
    || digest(bytes) !== entry.sha256 || bytes.readUInt32BE(16) !== dimensions[0] || bytes.readUInt32BE(20) !== dimensions[1]) {
    throw Error(`Artwork is not approved or changed since inspection: ${path}`);
  }
  return bytes;
}

const proposed = { ...before, templates: [...replacements, ...preserved] };
const review = {
  reviewedAt: now, previousRevision: before.revision, removedIds: removed.map(t => t.id),
  uploadedDesigns: replacements.map(t => t.id), preservedCount: preserved.length,
  preservedSha256: digest(JSON.stringify(preserved)), total: proposed.templates.length,
};
await mkdir('output/chikawa-reference-collection', { recursive: true });
await writeFile('output/chikawa-reference-collection/publication-review.json', JSON.stringify(review, null, 2) + '\n');
console.log(`Reviewed catalog: ${replacements.length} Chiikawa designs, ${removed.length} retired designs removed, ${preserved.length} other designs preserved. Revision: ${before.revision}`);
if (process.argv.includes('--publish')) {
  const index = process.argv.indexOf('--expect-revision');
  if (index < 0 || process.argv[index + 1] !== before.revision) throw Error('Catalog revision must match the reviewed revision.');
  const latest = await store.read(true);
  if (!same(latest, before)) throw Error('Catalog changed; review again before publication.');
  const changed = !same(before.templates, proposed.templates) || !same(before.categories, galleryCategories);
  if (changed) await store.write(proposed);
  const saved = await store.read(true);
  const kept = saved.templates.filter(t => !newIds.has(t.id));
  if (!same(kept, preserved) || saved.templates.some(t => retiredIds.has(t.id) || t.collection === 'onepiece')
    || replacements.some(t => saved.templates.filter(x => x.id === t.id).length !== 1
      || !same(saved.templates.find(x => x.id === t.id), t))) throw Error('Catalog verification failed.');
  await writeFile('output/chikawa-reference-collection/publication-result.json', JSON.stringify({ ...review, revision: saved.revision,
    verifiedAt: new Date().toISOString(), uploadedAssetCount: 36, retiredCollectionAbsent: true, unaffectedRecordsPreserved: true }, null, 2) + '\n');
  console.log('Verified: 12 Chiikawa designs published with 36 reviewed assets; retired collection absent.');
}
