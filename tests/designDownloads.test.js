import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesignDownloads } from '../server/designDownloads.js';
import { createDownloadsHandler } from '../api/downloads.js';
import { sortTemplatesByLikes } from '../src/utils/sortTemplatesByLikes.js';

test('downloads count every save separately and keep designs separate', async () => {
  const store = createDesignDownloads({ env: {} });
  assert.deepEqual(await store.read(['one', 'two']), { one: 0, two: 0 });
  assert.equal(await store.record('one'), 1);
  assert.equal(await store.record('one'), 2);
  assert.deepEqual(await store.read(['one', 'two']), { one: 2, two: 0 });
});

test('device counts are isolated, totals include every device, and older totals remain unassigned', async () => {
  const store = createDesignDownloads({ env: {} });
  await store.record('one');
  await store.record('one');
  await store.record('one', 'mobile');
  await store.record('one', 'mobile');
  await store.record('one', 'tablet');
  await store.record('two', 'laptop');
  assert.deepEqual(await store.read(['one', 'two']), { one: 5, two: 1 });
  const summary = await store.summary(['one', 'two']);
  assert.deepEqual(summary.downloads, { one: 5, two: 1 });
  assert.deepEqual(summary.unassigned, { one: 2, two: 0 });
  assert.equal(summary.byDevice.mobile.one, 2);
  assert.equal(summary.byDevice.tablet.one, 1);
  assert.equal(summary.byDevice.laptop.two, 1);
  assert.deepEqual(await store.read(['one', 'two'], 'mobile'), { one: 2, two: 0 });
  assert.deepEqual(await store.read(['one', 'two'], 'laptop'), { one: 0, two: 1 });
  await assert.rejects(store.record('one', 'unknown'));
});

test('Redis writes use a device-specific field and old fields are never assigned to a device', async () => {
  const commands = [];
  const store = createDesignDownloads({ env: { UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'token' }, fetcher: async (_url, options) => {
    const command = JSON.parse(options.body); commands.push(command);
    return { ok: true, json: async () => ({ result: command[0] === 'EVAL' ? 2 : ['one', '10', 'one:mobile', '2', 'one:tablet', '1'] }) };
  } });
  assert.equal(await store.record('one', 'mobile'), 2);
  assert.equal(commands[0].at(-1), 'one:mobile');
  const summary = await store.summary(['one']);
  assert.equal(summary.downloads.one, 13);
  assert.equal(summary.byDevice.laptop.one, 0);
  assert.equal(summary.byDevice.mobile.one, 2);
  assert.equal(summary.unassigned.one, 10);
});

test('download API requires a valid device and refuses unsupported design/device pairs', async () => {
  const counts = createDesignDownloads({ env: {} });
  const handler = createDownloadsHandler({ env: {}, downloads: counts, limiter: { allow: async () => true } });
  const reply = () => ({ setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; } });
  for (const device of [undefined, 'desktop', 'mobile:tablet']) {
    const response = reply();
    await handler({ method: 'POST', headers: {}, body: { id: 'one', device } }, response);
    assert.equal(response.code, 400);
  }
  const response = reply();
  await handler({ method: 'POST', headers: { origin: 'https://example.com', host: 'example.com', 'content-type': 'application/json' }, body: { id: 'hxh-gon-manga', device: 'tablet' } }, response);
  assert.equal(response.code, 400);
});

test('production requires persistent storage and increments atomically', async () => {
  await assert.rejects(createDesignDownloads({ env: { NODE_ENV: 'production' } }).record('one'));
  const commands = [];
  const store = createDesignDownloads({ env: { UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'token' }, fetcher: async (_url, options) => {
    commands.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ result: commands.length === 1 ? 3 : ['one', '3'] }) };
  } });
  assert.equal(await store.record('one'), 3);
  assert.equal(commands[0][0], 'EVAL');
  assert.match(commands[0][1], /redis.call\('HGET'/);
  assert.match(commands[0][1], /redis.call\('HSET'/);
  assert.deepEqual(commands[0].slice(2), ['1', 'schedsnap:downloads:counts', 'one']);
  assert.deepEqual(await store.read(['one', 'two']), { one: 3, two: 0 });
  assert.deepEqual(commands[1], ['HGETALL', 'schedsnap:downloads:counts']);
});

test('sort by hearts, downloads, and release date without mutating catalog', () => {
  const templates = [{ id: 'old', publishedAt: '2025-01-01' }, { id: 'new', publishedAt: '2026-01-01' }];
  const ids = sort => sortTemplatesByLikes(templates, { old: { count: 2 } }, sort, { new: 4 }).map(t => t.id);
  assert.deepEqual(ids('likes'), ['old', 'new']);
  assert.deepEqual(ids('downloads'), ['new', 'old']);
  assert.deepEqual(ids('newest'), ['new', 'old']);
  assert.deepEqual(ids('oldest'), ['old', 'new']);
  assert.equal(templates[0].id, 'old');
});

test('download endpoint validates origin, design status, and rate limits', async () => {
  let writes = 0;
  let allowed = true;
  const handler = createDownloadsHandler({
    env: { CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'key', CLOUDINARY_API_SECRET: 'secret' },
    store: { read: async () => ({ templates: [{ id: 'live', status: 'published' }, { id: 'hidden', status: 'hidden' }] }) },
    downloads: { record: async (id, device) => { assert.equal(device, 'mobile'); return ++writes; }, read: async (ids, device) => { assert.equal(device, 'mobile'); return Object.fromEntries(ids.map(id => [id, 0])); } },
    limiter: { allow: async () => allowed },
  });
  async function send(id, origin = 'https://example.com', method = 'POST') {
    const response = { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    await handler({ method, url: '/api/downloads?device=mobile', headers: { host: 'example.com', origin, 'content-type': 'application/json' }, body: { id, device: 'mobile' } }, response);
    return response;
  }
  assert.equal((await send('live')).code, 200);
  assert.equal((await send('live', 'https://other.com')).code, 403);
  assert.equal((await send('hidden')).code, 404);
  assert.equal((await send('../invalid')).code, 400);
  assert.deepEqual((await send(undefined, undefined, 'GET')).data, { downloads: { live: 0 }, device: 'mobile' });
  allowed = false;
  assert.equal((await send('live')).code, 429);
  assert.equal(writes, 1);
});
