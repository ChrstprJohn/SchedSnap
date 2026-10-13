/* global console */
import process from 'node:process';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { onepieceTemplates } from '../src/assets/onepieceTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
assert.equal(onepieceTemplates.length, 12);
for (const template of onepieceTemplates) {
  templateSchema.parse({ ...template, status: 'published' });
  for (const path of Object.values(template.deviceImages)) assert.ok(manifest[path]?.url, `Upload missing: ${path}`);
}
const store = createCatalogStore(process.env);
const catalog = await store.read(true);
const ids = new Set(catalog.templates.map(template => template.id));
const additions = onepieceTemplates.filter(template => !ids.has(template.id))
  .map(template => ({ ...template, status: 'published', publishedAt: new Date().toISOString() }));
if (process.argv.includes('--dry-run')) {
  console.log(`${additions.length} reference-inspired Chiikawa designs pending publication.`);
} else if (additions.length) {
  const latest = await store.read(true);
  assert.equal(latest.revision, catalog.revision, 'Catalog changed; rerun to preserve concurrent edits.');
  const saved = await store.write({ ...latest, templates: [...additions, ...latest.templates] });
  const verified = await createCatalogStore(process.env).read(true);
  assert.equal(verified.revision, saved.revision);
  for (const template of additions) assert.ok(verified.templates.some(item => item.id === template.id && item.collection === template.collection));
  for (const template of latest.templates) assert.deepEqual(verified.templates.find(item => item.id === template.id), template);
  console.log(`Published ${additions.length} Chiikawa designs; all existing records preserved.`);
} else {
  console.log('All 12 reference-inspired Chiikawa designs are already published.');
}
