/* global console, URL */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCatalogStore } from '../server/catalogStore.js';
import { artworkIds, createArtworkDeleter } from '../server/deleteArtwork.js';
import { patternTemplates } from '../src/assets/patternTemplates.js';
import { generatedMascotTemplates } from '../src/assets/generatedMascotTemplates.js';
const root = fileURLToPath(new URL('..', import.meta.url));
for (const file of ['.env.local', '.env']) if (existsSync(resolve(root, file))) process.loadEnvFile(resolve(root, file));
const store = createCatalogStore(process.env);
const catalog = await store.read(true);
const originals = catalog.templates.filter(t => !t.collection || t.collection === 'original');
const retained = catalog.templates.filter(t => t.collection && t.collection !== 'original');
const shared = new Set(retained.flatMap(t => artworkIds(t, process.env)));
const unused = [...new Set(originals.flatMap(t => artworkIds(t, process.env)))].filter(id => !shared.has(id) && !id.startsWith('local:'));
const remove = createArtworkDeleter(process.env);
for (const id of unused) await remove(id);
const positions = new Map(generatedMascotTemplates.map(t => [t.id, t]));
const updated = retained.map(t => {
  const preset = positions.get(t.id);
  return preset && !t.mascotPosition ? { ...t, mascotPosition: preset.mascotPosition, mascotSide: preset.mascotSide } : t;
});
const ids = new Set(updated.map(t => t.id));
const additions = patternTemplates.filter(t => !ids.has(t.id)).map(t => ({ ...t, status: 'published', publishedAt: new Date().toISOString() }));
await store.write({ ...catalog, templates: [...additions, ...updated] });
console.log(`Removed ${originals.length} Originals templates and ${unused.length} unshared artworks; added ${additions.length} patterns and updated mascot placement.`);
