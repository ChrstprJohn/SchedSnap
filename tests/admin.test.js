import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, createSession, isAuthenticated, sessionCookie } from '../server/adminAuth.js';
import { createAdminHandler } from '../api/admin.js';
import { createPublicCatalogHandler } from '../api/catalog.js';
import { seedCatalog } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';
import { generateDesignId } from '../shared/designId.js';
import { artworkIds, createArtworkDeleter } from '../server/deleteArtwork.js';

const env = { ADMIN_PASSWORD_HASH: hashPassword('a-long-test-password'), ADMIN_SESSION_SECRET: 'test-session-secret-that-is-long-enough', CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'test-key', CLOUDINARY_API_SECRET: 'test-secret' };
function response() { return { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
function req(action, body, cookie) { return { method: body ? 'POST' : 'GET', url: `/api/admin?action=${action}`, headers: { host: 'localhost:5173', origin: 'http://localhost:5173', 'content-type': 'application/json', cookie }, body }; }
const cookie = () => `schedsnap_admin=${createSession(env)}`;
test('direct environment password supports login and rotation without a setup command', async () => {
  const direct = { ...env, ADMIN_PASSWORD: 'a-direct-password-123', ADMIN_PASSWORD_HASH: undefined, ADMIN_SESSION_SECRET: undefined };
  const handler = createAdminHandler({ env: direct });
  const result = response(); await handler(req('login', { password: direct.ADMIN_PASSWORD }), result);
  assert.equal(result.code, 200);
  const cookieValue = result.headers['Set-Cookie'].split(';')[0];
  assert.ok(isAuthenticated({ headers: { cookie: cookieValue } }, direct));
  assert.equal(isAuthenticated({ headers: { cookie: cookieValue } }, { ...direct, ADMIN_PASSWORD: 'a-new-password-12345' }), false);
  const wrong = response(); await handler(req('login', { password: 'wrong' }), wrong); assert.equal(wrong.code, 401);
  const invalid = response(); await createAdminHandler({ env: { ...direct, ADMIN_PASSWORD: 'short' } })(req('session'), invalid); assert.equal(invalid.code, 503);
});
test('design keywords survive authenticated save and public catalog delivery', async () => {
  let catalog = seedCatalog();
  const store = { read: async () => structuredClone(catalog), write: async next => { catalog = next; return next; } };
  const handler = createAdminHandler({ env, store });
  const template = { ...catalog.templates[0], keywords: 'moonlight, cozy background' };
  let result = response();
  await handler(req('save', { revision: catalog.revision, template }, cookie()), result);
  assert.equal(result.code, 200);
  assert.equal(catalog.templates.find(t => t.id === template.id).keywords, template.keywords);
  result = response();
  await createPublicCatalogHandler({ env, store })({ method: 'GET' }, result);
  assert.equal(result.body.templates.find(t => t.id === template.id).keywords, template.keywords);
  assert.equal(templateSchema.safeParse({ ...template, keywords: 'x'.repeat(501) }).success, false);
});

test('partial background drafts save while publishing requires three distinct variants', () => {
  const base = seedCatalog().templates.find(template => template.deviceImages && template.layout !== 'mascot');
  assert.ok(base, 'The fixture needs a background with device variants');
  const partial = { ...base, status: 'draft', deviceImages: { mobile: base.image } };
  assert.ok(templateSchema.safeParse(partial).success);
  assert.equal(templateSchema.safeParse({ ...partial, status: 'published' }).success, false);
  assert.equal(templateSchema.safeParse({ ...base, deviceImages: { mobile: base.image, tablet: base.image, laptop: base.image } }).success, false);
  assert.ok(templateSchema.safeParse({ ...base, status: 'published' }).success);
});
test('admin rejects missing, tampered, expired, and password-rotated sessions', () => {
  const value = createSession(env);
  assert.ok(isAuthenticated({ headers: { cookie: `schedsnap_admin=${value}` } }, env));
  assert.equal(isAuthenticated({ headers: { cookie: `schedsnap_admin=${value}x` } }, env), false);
  assert.equal(isAuthenticated({ headers: {} }, env), false);
  assert.equal(isAuthenticated({ headers: { cookie: `schedsnap_admin=${createSession(env, Date.now() - 9 * 3600000)}` } }, env), false);
  assert.equal(isAuthenticated({ headers: { cookie: `schedsnap_admin=${value}` } }, { ...env, ADMIN_PASSWORD_HASH: hashPassword('another-password-long') }), false);
  assert.match(sessionCookie(value, { ...env, VERCEL: '1' }), /HttpOnly; SameSite=Strict; Max-Age=28800; Secure/);
});
test('login validates password, prevents cross-origin posts, and throttles attempts', async () => {
  const handler = createAdminHandler({ env });
  let result = response(); await handler(req('login', { password: 'a-long-test-password' }), result);
  assert.equal(result.code, 200); assert.ok(result.headers['Set-Cookie']);
  result = response(); const cross = req('login', { password: 'a-long-test-password' }); cross.headers.origin = 'https://attacker.example';
  await handler(cross, result); assert.equal(result.code, 403);
  for (let i = 0; i < 5; i++) { result = response(); await handler(req('login', { password: 'incorrect' }), result); assert.equal(result.code, 401); }
  result = response(); await handler(req('login', { password: 'a-long-test-password' }), result); assert.equal(result.code, 429);
});
test('production login fails closed until firewall rate limiting is configured', async () => {
  const handler = createAdminHandler({ env: { ...env, VERCEL: '1' } });
  const result = response(); await handler(req('login', { password: 'a-long-test-password' }), result); assert.equal(result.code, 503);
});
test('every management action requires authentication and failed requests do not write', async () => {
  let writes = 0;
  const handler = createAdminHandler({ env, store: { read: async () => seedCatalog(), write: async () => { writes++; } } });
  for (const action of ['save', 'delete', 'visibility', 'upload']) { const result = response(); await handler(req(action, { revision: 'seed' }), result); assert.equal(result.code, 401); }
  const result = response(); await handler(req('catalog'), result); assert.equal(result.code, 401); assert.equal(writes, 0);
});
test('catalog saves reject stale revisions, foreign artwork, and incomplete device backgrounds', async () => {
  const catalog = seedCatalog(); let writes = 0;
  const handler = createAdminHandler({ env, store: { read: async () => structuredClone(catalog), write: async next => { writes++; return next; } } });
  let result = response(); await handler(req('save', { revision: 'stale', template: catalog.templates[0] }, cookie()), result); assert.equal(result.code, 409);
  const template = { ...catalog.templates.find(t => t.collection === 'scenic' && t.layout !== 'mascot'), image: 'https://res.cloudinary.com/foreign/image/upload/schedsnap/admin/artwork/asset.png', deviceImages: undefined };
  result = response(); await handler(req('save', { revision: 'seed', template }, cookie()), result); assert.equal(result.code, 400);
  template.deviceImages = Object.fromEntries(['mobile', 'tablet', 'laptop'].map(d => [d, template.image]));
  result = response(); await handler(req('save', { revision: 'seed', template }, cookie()), result); assert.equal(result.code, 400);
  assert.equal(writes, 0);
});
test('published designs and visibility persist; confirmed deletion removes artwork and catalog entry', async () => {
  let catalog = seedCatalog();
  const store = { read: async () => structuredClone(catalog), write: async next => { catalog = { ...next, revision: 'saved' }; return catalog; } };
  const destroyed = [];
  const handler = createAdminHandler({ env, store, resolveArtworkIds: t => [t.id], destroyArtwork: async id => { destroyed.push(id); } });
  const first = catalog.templates[0];
  let result = response(); await handler(req('save', { revision: 'seed', template: { ...first, status: 'draft' } }, cookie()), result); assert.equal(result.code, 200);
  result = response(); await createPublicCatalogHandler({ env, store })({ method: 'GET' }, result); assert.ok(!result.body.templates.some(t => t.id === first.id)); assert.ok(result.body.templates.every(t => !('status' in t)));
  result = response(); await handler(req('visibility', { revision: 'saved', id: first.id, status: 'hidden' }, cookie()), result); assert.equal(result.code, 200);
  result = response(); await handler(req('delete', { revision: 'saved', id: first.id, confirmation: first.name }, cookie()), result); assert.equal(result.code, 200); assert.ok(!catalog.templates.some(t => t.id === first.id)); assert.deepEqual(destroyed, [first.id]);
});

test('automatic IDs handle punctuation, accents, duplicate titles, and empty input', () => {
  assert.equal(generateDesignId('  Café / Study! '), 'cafe-study');
  assert.equal(generateDesignId('Study', ['study', 'study-2']), 'study-3');
  assert.equal(generateDesignId('🎨'), 'design');
  assert.match(generateDesignId('a'.repeat(59) + ' -- extra'), /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});
test('create generates unique ID server-side and preserves existing design on duplicate title', async () => {
  let catalog = seedCatalog(); const first = catalog.templates[0];
  const store = { read: async () => structuredClone(catalog), write: async next => { catalog = { ...next, revision: 'saved' }; return catalog; } };
  const handler = createAdminHandler({ env, store });
  const result = response(); await handler(req('save', { revision: 'seed', create: true, template: { ...first, id: first.id, status: 'draft' } }, cookie()), result);
  assert.equal(result.code, 200); assert.notEqual(catalog.templates[0].id, first.id); assert.ok(catalog.templates.some(t => t.id === first.id && t.status === 'published'));
});
test('hide bypasses publication validation for incomplete legacy records', async () => {
  let catalog = { revision: 'seed', templates: [{ ...seedCatalog().templates.find(t => t.collection === 'scenic' && t.layout !== 'mascot'), deviceImages: undefined }] };
  const store = { read: async () => structuredClone(catalog), write: async next => { catalog = next; return next; } };
  const result = response(); await createAdminHandler({ env, store })(req('visibility', { revision: 'seed', id: catalog.templates[0].id, status: 'hidden' }, cookie()), result);
  assert.equal(result.code, 200); assert.equal(catalog.templates[0].status, 'hidden');
});
test('permanent delete requires exact confirmation, preserves shared assets, and supports failure retry', async () => {
  const first = seedCatalog().templates[0];
  let catalog = { revision: 'seed', templates: [first, { ...first, id: 'other', name: 'Other' }] };
  let writes = 0, failDeletion = true; const removed = [];
  const store = { read: async () => structuredClone(catalog), write: async next => { catalog = { ...next, revision: String(++writes) }; return structuredClone(catalog); } };
  const handler = createAdminHandler({ env, store, resolveArtworkIds: t => t.id === first.id ? ['shared', 'unique'] : ['shared'], destroyArtwork: async id => { if (failDeletion) throw new Error('offline'); removed.push(id); } });
  let result = response(); await handler(req('delete', { revision: 'seed', id: first.id, confirmation: 'wrong' }, cookie()), result); assert.equal(result.code, 400); assert.equal(writes, 0);
  result = response(); await handler(req('delete', { revision: 'seed', id: first.id, confirmation: first.name }, cookie()), result); assert.equal(result.code, 503); assert.equal(catalog.templates[0].status, 'hidden'); assert.ok(catalog.templates[0].deletionPending); assert.ok(result.body.catalog);
  failDeletion = false;
  result = response(); await handler(req('delete', { revision: catalog.revision, id: first.id, confirmation: first.name }, cookie()), result); assert.equal(result.code, 200); assert.deepEqual(removed, ['unique']); assert.equal(catalog.templates.length, 1);
});
test('Cloudinary deletion sends signed exact IDs with invalidation and refuses unrelated resources', async () => {
  let calls = 0;
  const remove = createArtworkDeleter(env, async (url, options) => { calls++; assert.equal(url, 'https://api.cloudinary.com/v1_1/test/image/destroy'); assert.equal(options.body.get('public_id'), 'schedsnap/admin/artwork/test-image'); assert.equal(options.body.get('invalidate'), 'true'); assert.ok(options.body.get('signature')); return { ok: true, json: async () => ({ result: 'ok' }) }; });
  await remove('schedsnap/admin/artwork/test-image'); assert.equal(calls, 1);
  await assert.rejects(remove('unrelated/image')); assert.equal(calls, 1);
});

test('server owns creation and first-publication dates; edits and visibility do not renew them', async () => {
  let time = Date.now();
  let catalog = seedCatalog();
  const store = { read: async () => structuredClone(catalog), write: async next => { catalog = { ...next, revision: 'saved' }; return catalog; } };
  const handler = createAdminHandler({ env, store, now: () => time });
  const draft = { ...catalog.templates[0], status: 'draft', createdAt: '2000-01-01T00:00:00Z' };
  let result = response(); await handler(req('save', { revision: 'seed', create: true, template: draft }, cookie()), result);
  assert.equal(result.code, 200);
  const created = catalog.templates[0];
  const createdAt = new Date(time).toISOString();
  assert.equal(created.createdAt, createdAt); assert.equal(created.publishedAt, undefined);
  time += 1000;
  result = response(); await handler(req('save', { revision: 'saved', template: { ...created, createdAt: '2001-01-01T00:00:00Z', status: 'published' } }, cookie()), result);
  assert.equal(result.code, 200);
  const publishedAt = new Date(time).toISOString();
  assert.equal(catalog.templates[0].createdAt, createdAt); assert.equal(catalog.templates[0].publishedAt, publishedAt);
  time += 1000;
  result = response(); await handler(req('save', { revision: 'saved', template: { ...catalog.templates[0], name: 'Edited', publishedAt: new Date(time).toISOString() } }, cookie()), result);
  assert.equal(result.code, 200); assert.equal(catalog.templates[0].createdAt, createdAt); assert.equal(catalog.templates[0].publishedAt, publishedAt);
  for (const status of ['hidden', 'published']) { result = response(); await handler(req('visibility', { revision: 'saved', id: created.id, status }, cookie()), result); assert.equal(result.code, 200); }
  assert.equal(catalog.templates[0].publishedAt, publishedAt);
});

test('editing an undated legacy template preserves its undated age', async () => {
  let catalog = seedCatalog();
  const first = { ...catalog.templates[0] }; delete first.createdAt; delete first.publishedAt;
  catalog.templates[0] = first;
  const store = { read: async () => structuredClone(catalog), write: async next => { catalog = next; return next; } };
  const result = response(); await createAdminHandler({ env, store })(req('save', { revision: 'seed', template: { ...first, name: 'Legacy edited', createdAt: new Date().toISOString() } }, cookie()), result);
  assert.equal(result.code, 200); assert.equal(catalog.templates[0].createdAt, undefined); assert.equal(catalog.templates[0].publishedAt, undefined);
});

test('schema accepts bounded mascot paths and retains pixel render metadata', () => {
  const base = seedCatalog().templates[0];
  const parsed = templateSchema.parse({ ...base, layout: 'mascot', image: '/images/pixel-mascots/masters/pixel-cactus.png', mascotStyle: 'pixel', pixelArt: true });
  assert.equal(parsed.mascotStyle, 'pixel'); assert.equal(parsed.pixelArt, true);
  assert.equal(templateSchema.safeParse({ ...parsed, image: '/images/pixel-mascots/masters/../secret.png' }).success, false);
});

test('generated Cloudinary masters validate, extract exact IDs and delete within their namespace', async () => {
  const base = seedCatalog().templates.find(t => t.layout === 'mascot');
  const id = 'schedsnap/images/doodle-mascots/masters/black-cat-wave-0123456789abcdef';
  const image = `https://res.cloudinary.com/test/image/upload/v123/${id}.png`;
  assert.ok(templateSchema.safeParse({ ...base, image }).success);
  assert.deepEqual(artworkIds({ image }, env), [id]);
  assert.throws(() => artworkIds({ image: image.replace('/test/', '/foreign/') }, env), /another account/);
  let calls = 0;
  const remove = createArtworkDeleter(env, async (url, options) => { calls++; assert.equal(options.body.get('public_id'), id); return { ok: true, json: async () => ({ result: 'ok' }) }; });
  await remove(id); assert.equal(calls, 1);
  for (const invalid of [id.replace('/masters/', '/mobile/'), id.replace('/masters/', '/layouts/'), id.replace('doodle-mascots', 'unrelated'), id.replace('-0123456789abcdef', ''), 'schedsnap/images/arbitrary/file']) {
    const badImage = `https://res.cloudinary.com/test/image/upload/${invalid}.png`;
    assert.equal(templateSchema.safeParse({ ...base, image: badImage }).success, false);
    assert.throws(() => artworkIds({ image: badImage }, env));
    await assert.rejects(remove(invalid));
  }
  assert.equal(calls, 1);
  assert.throws(() => artworkIds({ image: image.replace('.png', '.jpg') }, env));
});
