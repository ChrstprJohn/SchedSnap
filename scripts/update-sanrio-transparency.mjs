import process from 'node:process';
import assert from 'node:assert/strict';
import { createCatalogStore } from '../server/catalogStore.js';
import { sanrioTemplates } from '../src/assets/sanrioTemplates.js';
import { templateSchema } from '../shared/templateSchema.js';

for (const path of ['.env.local', '.env']) {
  try { process.loadEnvFile(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const store = createCatalogStore(process.env);
const before = await store.read(true);
const ids = new Set(sanrioTemplates.map(t => t.id));
assert.equal(before.templates.filter(t => ids.has(t.id)).length, 12);
const templates = before.templates.map(t => ids.has(t.id) ? templateSchema.parse({ ...t, containerFill: false }) : t);
// Keep all original fields and dates; schema validation must never strip data.
for (let i = 0; i < templates.length; i++) assert.deepEqual(templates[i], ids.has(before.templates[i].id) ? { ...before.templates[i], containerFill: false } : before.templates[i]);
if (!process.argv.includes('--publish')) {
  process.stdout.write(`Reviewed 12 Sanrio fill defaults; revision ${before.revision}. Use --publish --expect-revision ${before.revision}.\n`);
} else {
  assert.equal(process.argv[process.argv.indexOf('--expect-revision') + 1], before.revision, 'Catalog revision changed; review again.');
  const fresh = await store.read(true);
  assert.deepEqual(fresh, before, 'Catalog changed during review.');
  await store.write({ ...before, templates });
  const after = await store.read(true);
  assert.deepEqual(after.templates, templates);
  process.stdout.write('Published transparent Sanrio boxes; all other records and dates preserved.\n');
}
