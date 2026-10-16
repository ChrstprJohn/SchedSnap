import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicCatalogHandler } from '../api/catalog.js';
import { seedCatalog } from '../server/catalogStore.js';
import { localApiPlugin } from '../development/apiPlugin.js';
import { snoopyTemplates } from '../src/assets/snoopyTemplates.js';

const env = { CLOUDINARY_CLOUD_NAME: 'preview-test', CLOUDINARY_API_KEY: 'test', CLOUDINARY_API_SECRET: 'test' };
const response = () => ({ setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const expose = template => Object.fromEntries(Object.entries(template).filter(([key]) => key !== 'status'));

test('Vite exposes local Snoopy artwork when the shared catalog does not contain it', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options?.method || 'GET', 'GET', 'preview must not write to Cloudinary');
    return new Response(JSON.stringify({ revision: 'remote-test', templates: [{ id: 'remote-design', status: 'published' }] }), { status: 200 });
  });
  let middleware;
  localApiPlugin(env).configureServer({ middlewares: { use(handler) { middleware = handler; } } });
  const result = { setHeader() {}, end(body) { this.body = JSON.parse(body); } };
  await middleware({ method: 'GET', url: '/api/catalog' }, result, () => assert.fail('Catalog request was not handled'));
  assert.equal(result.statusCode, 200);
  assert.ok(result.body.templates.some(template => template.id === 'remote-design'));
  for (const design of snoopyTemplates) {
    const records = result.body.templates.filter(template => template.id === design.id);
    assert.equal(records.length, 1);
    assert.deepEqual(records[0].deviceImages, design.deviceImages);
    assert.ok(records[0].image.startsWith('/wallpapers/scenic/snoopy-'));
  }
});

test('local previews append only missing IDs and preserve remote overrides, hidden records, and dates', async () => {
  const remote = [
    { id: 'existing', name: 'Existing', status: 'published', createdAt: '2025-01-01T00:00:00.000Z' },
    { id: 'sanrio-override', name: 'Admin replacement', image: '/replacement.png', status: 'published', publishedAt: '2025-02-01T00:00:00.000Z' },
    { id: 'sanrio-hidden', name: 'Hidden', status: 'hidden', publishedAt: '2025-03-01T00:00:00.000Z' },
  ];
  const original = structuredClone(remote);
  const preview = [
    { id: 'sanrio-new', name: 'Local preview', createdAt: '2026-10-13T00:00:00.000Z' },
    { id: 'sanrio-new', name: 'Duplicate' },
    { id: 'sanrio-override', name: 'Local original', image: '/original.png' },
    { id: 'sanrio-hidden', name: 'Local hidden original' },
  ];
  const result = response();
  await createPublicCatalogHandler({ env, store: { read: async () => ({ templates: remote }) }, previewTemplates: preview })({ method: 'GET' }, result);
  assert.equal(result.code, 200);
  assert.deepEqual(result.body.templates, [expose({ ...preview[0], status: 'published' }), ...remote.filter(t => t.status === 'published').map(expose)]);
  assert.deepEqual(remote, original);
});

test('production/default handler does not expose local preview additions', async () => {
  const result = response();
  await createPublicCatalogHandler({ env, store: { read: async () => ({ templates: [{ id: 'remote-only', status: 'published' }] }) } })({ method: 'GET' }, result);
  assert.deepEqual(result.body.templates, [{ id: 'remote-only' }]);
});

test('unconfigured local catalog keeps seeded designs once when also passed as previews', async () => {
  const seed = seedCatalog();
  const result = response();
  await createPublicCatalogHandler({ env: {}, previewTemplates: [seed.templates[0], { id: 'local-missing' }] })({ method: 'GET' }, result);
  assert.equal(result.body.templates.length, seed.templates.length + 1);
  assert.equal(result.body.templates.filter(t => t.id === seed.templates[0].id).length, 1);
  assert.equal(result.body.templates[0].id, 'local-missing');
});
