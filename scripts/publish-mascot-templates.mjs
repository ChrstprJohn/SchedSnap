/* global console, URL */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedMascotTemplates } from '../src/assets/generatedMascotTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

const root = fileURLToPath(new URL('..', import.meta.url));
for (const file of ['.env.local', '.env']) {
  if (existsSync(resolve(root, file))) process.loadEnvFile(resolve(root, file));
}
for (const template of generatedMascotTemplates) {
  templateSchema.parse({ ...template, status: 'published' });
  if (!manifest[template.image]?.url) throw new Error(`Upload missing for ${template.id}.`);
}
const store = createCatalogStore(process.env);
const catalog = await store.read(true);
const existing = new Set(catalog.templates.map(template => template.id));
const definitions = new Map(generatedMascotTemplates.map(template => [template.id, template]));
let migrated = 0;
const preserved = catalog.templates.map(template => {
  const definition = definitions.get(template.id);
  // Move only our original local reference; retain any administrator replacements.
  if (definition && template.image === definition.image) {
    migrated++;
    return { ...template, image: manifest[definition.image].url };
  }
  return template;
});
const additions = generatedMascotTemplates.filter(template => !existing.has(template.id))
  .map(template => ({ ...template, image: manifest[template.image].url, status: 'published', publishedAt: new Date().toISOString() }));
if (!additions.length && !migrated) {
  console.log('All 61 generated mascot templates are already in the catalog.');
} else {
  const saved = await store.write({ ...catalog, templates: [...additions, ...preserved] });
  if (!additions.every(template => saved.templates.some(item => item.id === template.id))) throw new Error('Publication verification failed.');
  console.log(`Published ${additions.length} additions and resolved ${migrated} mascot references to Cloudinary; existing designs preserved.`);
}
