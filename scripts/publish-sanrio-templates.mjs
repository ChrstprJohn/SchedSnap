/* global console */
import process from 'node:process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanrioTemplates } from '../src/assets/sanrioTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { galleryCategories } from '../src/config/collections.js';
import { cloudConfigured, createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sizes = { mobile: [1080, 2400], tablet: [1600, 2560], laptop: [1920, 1080] };

// This publisher only appends missing Sanrio IDs. Existing records are copied
// untouched, including administrator replacements and all immutable dates.
export async function preparePublication(catalog, cloud, now = new Date().toISOString()) {
  if (sanrioTemplates.length !== 12 || new Set(sanrioTemplates.map(t => t.id)).size !== 12) {
    throw new Error('Expected exactly 12 unique Sanrio definitions.');
  }
  const existing = new Set(catalog.templates.map(t => t.id));
  const additions = [];
  const uploads = [];
  for (const definition of sanrioTemplates) {
    if (!definition.id.startsWith('sanrio-')) throw new Error('Unexpected non-Sanrio definition.');
    const candidate = templateSchema.parse({ ...definition, status: 'published', publishedAt: now });
    for (const [device, dimensions] of Object.entries(sizes)) {
      const path = candidate.deviceImages[device];
      if (path !== `/wallpapers/scenic/${candidate.id}/${device}.png`) throw new Error(`Unexpected artwork path for ${candidate.id}.`);
      const bytes = await readFile(resolve(root, 'public', path.slice(1)));
      if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a'
        || bytes.readUInt32BE(16) !== dimensions[0] || bytes.readUInt32BE(20) !== dimensions[1]) {
        throw new Error(`Invalid PNG dimensions: ${path}`);
      }
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      const expectedId = `schedsnap${path.slice(0, -4)}-${sha256.slice(0, 16)}`;
      const uploaded = manifest[path];
      const valid = Boolean(uploaded && uploaded.cloud === cloud && uploaded.publicId === expectedId
        && uploaded.width === dimensions[0] && uploaded.height === dimensions[1]
        && uploaded.url?.startsWith(`https://res.cloudinary.com/${cloud}/image/upload/`));
      uploads.push({ path, sha256, dimensions, uploaded: valid });
    }
    if (!existing.has(candidate.id)) additions.push(candidate);
  }
  const proposed = { ...catalog, templates: [...additions, ...catalog.templates] };
  const review = {
    generatedAt: now, mode: 'dry-run', cloud, catalogAsset: 'schedsnap/admin/catalog.json',
    warning: 'This remote catalog is shared by localhost and any deployed app configured for the same Cloudinary cloud.',
    revision: catalog.revision, existingCount: catalog.templates.length,
    proposedCount: proposed.templates.length, additions, skippedExistingIds: sanrioTemplates.filter(t => existing.has(t.id)).map(t => t.id),
    preservedExistingRecordsSha256: digest(catalog.templates),
    existingDates: catalog.templates.map(({ id, createdAt, publishedAt }) => ({ id, createdAt, publishedAt })),
    categoriesWillSyncToLocalDefinitions: digest(catalog.categories) !== digest(galleryCategories),
    categoriesBefore: catalog.categories, categoriesAfter: galleryCategories,
    uploads, pendingUploadCount: uploads.filter(t => !t.uploaded).length,
  };
  return { proposed, review };
}

async function main() {
  for (const file of ['.env.local', '.env']) {
    if (existsSync(resolve(root, file))) process.loadEnvFile(resolve(root, file));
  }
  if (!cloudConfigured(process.env)) throw new Error('Cloudinary is not configured.');
  const args = process.argv.slice(2);
  const publish = args.includes('--publish');
  const store = createCatalogStore(process.env);
  const catalog = await store.read(true);
  const { proposed, review } = await preparePublication(catalog, process.env.CLOUDINARY_CLOUD_NAME);
  const output = resolve(root, 'output/sanrio');
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'publication-review.json'), JSON.stringify(review, null, 2) + '\n');
  console.log(`Sanrio review: ${review.existingCount} preserved, ${review.additions.length} additions, ${review.pendingUploadCount}/36 uploads pending.`);
  console.log(`Catalog revision: ${review.revision}; shared Cloudinary catalog. Review saved to output/sanrio/publication-review.json.`);
  if (!publish) return;
  const index = args.indexOf('--expect-revision');
  if (index < 0 || args[index + 1] !== catalog.revision) throw new Error('Publication requires --expect-revision matching the reviewed catalog revision.');
  if (review.pendingUploadCount) throw new Error('Upload every current device asset before publication.');
  if (!review.additions.length) { console.log('All 12 Sanrio IDs already exist; no write performed.'); return; }
  const latest = await store.read(true);
  if (latest.revision !== catalog.revision || digest(latest.templates) !== digest(catalog.templates)
    || digest(latest.categories) !== digest(catalog.categories)) throw new Error('Catalog changed since review; rerun the dry run.');
  await store.write(proposed);
  const saved = await store.read(true);
  const addedIds = new Set(review.additions.map(t => t.id));
  if (digest(saved.templates.filter(t => !addedIds.has(t.id))) !== digest(catalog.templates)
    || review.additions.some(t => saved.templates.filter(item => item.id === t.id).length !== 1)
    || review.additions.some(t => digest(saved.templates.find(item => item.id === t.id)) !== digest(t))) {
    throw new Error('Post-publication verification failed.');
  }
  await writeFile(resolve(output, 'publication-result.json'), JSON.stringify({
    publishedAt: new Date().toISOString(), previousRevision: catalog.revision,
    revision: saved.revision, addedIds: [...addedIds], count: saved.templates.length,
    existingRecordsUnchanged: true,
  }, null, 2) + '\n');
  console.log(`Published ${addedIds.size} Sanrio additions; all ${catalog.templates.length} existing records and dates preserved.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
