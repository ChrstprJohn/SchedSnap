/* global console */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { onepieceAdventureTemplates as onepieceTemplates } from '../src/assets/onepieceAdventureTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

for (const file of ['.env.local', '.env']) {
  if (existsSync(resolve(file))) process.loadEnvFile(resolve(file));
}
if (onepieceTemplates.length !== 12) throw new Error('Expected 12 Onepiece designs.');
for (const template of onepieceTemplates) {
  templateSchema.parse({ ...template, status: 'published' });
  for (const path of Object.values(template.deviceImages)) {
    if (!manifest[path]?.url) throw new Error(`Upload missing for ${path}.`);
  }
}
const store = createCatalogStore(process.env);
const catalog = await store.read(true);
const existing = new Set(catalog.templates.map(template => template.id));
const additions = onepieceTemplates.filter(template => !existing.has(template.id))
  .map(template => ({ ...template, status: 'published', publishedAt: new Date().toISOString() }));
if (process.argv.includes('--dry-run')) {
  console.log(`${additions.length} Onepiece designs pending publication; existing designs preserved.`);
} else if (additions.length) {
  await store.write({ ...catalog, templates: [...additions, ...catalog.templates] });
  const saved = await store.read(true);
  if (!onepieceTemplates.every(template => saved.templates.some(item => item.id === template.id && item.collection === 'onepiece'))) {
    throw new Error('Onepiece publication verification failed.');
  }
  console.log(`Published ${additions.length} Onepiece designs; existing designs preserved.`);
} else {
  console.log('All 12 Onepiece designs are already in the catalog.');
}
