/* global console */
import process from 'node:process';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateColorKeywords, withTemplateKeywords } from '../shared/templateKeywords.js';

const root = fileURLToPath(new URL('..', import.meta.url));
for (const file of ['.env.local', '.env']) if (existsSync(resolve(root, file))) process.loadEnvFile(resolve(root, file));
const store = createCatalogStore(process.env);
const original = await store.read(true);
const templates = original.templates.map(withTemplateKeywords);
const withoutKeywords = template => Object.fromEntries(Object.entries(template).filter(([key]) => key !== 'keywords'));
assert.deepEqual(templates.map(withoutKeywords), original.templates.map(withoutKeywords), 'Only keywords may change');
for (const template of templates) {
  assert.ok(template.keywords && template.keywords.length <= 500, template.id);
  const tags = template.keywords.toLowerCase().split(', ');
  for (const color of templateColorKeywords(original.templates.find(item => item.id === template.id))) assert.ok(tags.includes(color), `${template.id}: ${color}`);
  for (const term of (original.templates.find(item => item.id === template.id).keywords || '').split(',').map(term => term.trim()).filter(Boolean)) {
    assert.ok(tags.includes(term.toLowerCase()), `${template.id}: preserve ${term}`);
  }
}
const changed = templates.filter((template, index) => template.keywords !== original.templates[index].keywords).length;
if (process.argv.includes('--write') && changed) {
  mkdirSync(resolve(root, 'output'), { recursive: true });
  const backup = resolve(root, `output/keywords-backup-${Date.now()}.json`);
  writeFileSync(backup, JSON.stringify(original, null, 2));
  const latest = await store.read(true);
  assert.equal(latest.revision, original.revision, 'Catalog changed during backfill; retry against the latest revision');
  await store.write({ ...original, templates });
  const saved = await store.read(true);
  assert.deepEqual(saved.templates, templates, 'Read-back must confirm every saved keyword');
  console.log(`Saved and verified ${templates.length} templates; ${changed} updated. Backup: ${backup}`);
} else console.log(`Dry run: ${templates.length} templates, ${changed} updates, zero missing color tags; existing keywords preserved.`);
