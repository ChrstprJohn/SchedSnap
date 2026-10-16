import process from 'node:process';
import { existsSync } from 'node:fs';
import { writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { snoopyTemplates } from '../src/assets/snoopyTemplates.js';
import { deviceResolutions } from '../src/assets/templates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

for (const path of ['.env.local', '.env']) if (existsSync(path)) process.loadEnvFile(path);
const store = createCatalogStore(process.env);
const catalog = await store.read(true);
const additions = [];
for (const template of snoopyTemplates) {
  if (catalog.templates.some(record => record.id === template.id)) continue;
  const deviceImages = {};
  for (const [device, size] of Object.entries(deviceResolutions)) {
    const path = template.deviceImages[device], asset = manifest[path];
    const hash = createHash('sha256').update(await readFile(`public${path}`)).digest('hex');
    if (!asset || asset.cloud !== process.env.CLOUDINARY_CLOUD_NAME || asset.publicId !== `schedsnap${path.slice(0, -4)}-${hash.slice(0, 16)}` || asset.width !== size.width || asset.height !== size.height) throw new Error(`Unverified upload: ${path}`);
    deviceImages[device] = asset.url;
  }
  additions.push(templateSchema.parse({ ...template, image: deviceImages.mobile, deviceImages, status: 'published', publishedAt: new Date().toISOString() }));
}
console.log(JSON.stringify({ revision: catalog.revision, additions: additions.map(t => t.id), existing: catalog.templates.length }));
if (process.argv.includes('--publish') && additions.length) {
  const fresh = await store.read(true);
  if (!isDeepStrictEqual(fresh, catalog)) throw new Error('Catalog changed; run again against the new revision.');
  const proposed = { ...fresh, templates: [...additions, ...fresh.templates] };
  await store.write(proposed);
  const verified = await createCatalogStore(process.env).read(true);
  if (!isDeepStrictEqual(verified.templates, proposed.templates)) throw new Error('Catalog save did not match.');
  await writeFile('output/snoopy/publication.json', JSON.stringify({ revision: verified.revision, added: additions.map(t => t.id), existingRecordsUnchanged: true, verifiedAt: new Date().toISOString() }, null, 2) + '\n');
  console.log(`Published ${additions.length} Snoopy designs; preserved ${fresh.templates.length} existing records.`);
}
