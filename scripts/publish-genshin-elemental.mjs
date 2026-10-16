/* global console */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { genshinElementalTemplates } from '../src/assets/genshinElementalTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore, cloudConfigured } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

const root = fileURLToPath(new URL('..', import.meta.url));
for (const file of ['.env.local', '.env']) if (existsSync(resolve(root, file))) process.loadEnvFile(resolve(root, file));
if (!cloudConfigured(process.env)) throw new Error('Cloudinary is not configured.');

const store = createCatalogStore(process.env);
const catalog = await store.read(true);
const existing = new Set(catalog.templates.map(t => t.id));
const publishedAt = new Date().toISOString();

const additions = genshinElementalTemplates
  .filter(t => !existing.has(t.id))
  .map(t => {
    for (const path of [t.image, ...Object.values(t.deviceImages || {})].filter(Boolean)) {
      const asset = manifest[path];
      if (!asset?.url || asset.cloud !== process.env.CLOUDINARY_CLOUD_NAME) {
        throw new Error(`Upload missing for ${path}.`);
      }
    }
    return templateSchema.parse({ ...t, status: 'published', publishedAt });
  });

console.log(JSON.stringify({
  revision: catalog.revision,
  additions: additions.map(t => t.id),
  existing: catalog.templates.length,
}));

if (process.argv.includes('--publish') && additions.length) {
  const fresh = await store.read(true);
  if (!isDeepStrictEqual(fresh, catalog)) throw new Error('Catalog changed; run again against the new revision.');
  const proposed = { ...fresh, templates: [...additions, ...fresh.templates] };
  await store.write(proposed);
  const verified = await createCatalogStore(process.env).read(true);
  if (!isDeepStrictEqual(verified.templates, proposed.templates)) throw new Error('Catalog save did not match.');
  console.log(`Published ${additions.length} Genshin elemental designs; preserved ${fresh.templates.length} existing records.`);
}
