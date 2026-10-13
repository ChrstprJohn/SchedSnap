import process from 'node:process';
import assert from 'node:assert/strict';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

for (const path of ['.env.local', '.env']) {
  try { process.loadEnvFile(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const store = createCatalogStore(process.env);
const before = await store.read(true);
const defaults = { containerStyle: 'glass', surface: '#ffffff', containerFill: true, containerShape: 'pill' };
let count = 0;
const templates = before.templates.map(template => {
  if (template.collection !== 'sanrio') return template;
  count++;
  const updated = { ...template, ...defaults };
  templateSchema.parse(updated);
  return updated;
});
assert.ok(count > 0, 'No Sanrio designs were found.');
if (!process.argv.includes('--publish')) {
  process.stdout.write(`Reviewed ${count} Sanrio defaults; revision ${before.revision}.\n`);
} else {
  assert.equal(process.argv[process.argv.indexOf('--expect-revision') + 1], before.revision, 'Catalog changed; review again.');
  assert.deepEqual(await store.read(true), before, 'Catalog changed during review.');
  await store.write({ ...before, templates });
  assert.deepEqual((await store.read(true)).templates, templates);
  process.stdout.write(`Published frosted white pill defaults for ${count} Sanrio designs; other fields and dates preserved.\n`);
}
