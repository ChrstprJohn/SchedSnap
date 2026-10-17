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
    downloads: { record: async () => ++writes, read: async ids => Object.fromEntries(ids.map(id => [id, 0])) },
    limiter: { allow: async () => allowed },
  });
  async function send(id, origin = 'https://example.com', method = 'POST') {
    const response = { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    await handler({ method, url: '/api/downloads', headers: { host: 'example.com', origin, 'content-type': 'application/json' }, body: { id } }, response);
    return response;
  }
  assert.equal((await send('live')).code, 200);
  assert.equal((await send('live', 'https://other.com')).code, 403);
  assert.equal((await send('hidden')).code, 404);
  assert.equal((await send('../invalid')).code, 400);
  assert.deepEqual((await send(undefined, undefined, 'GET')).data, { downloads: { live: 0 } });
  allowed = false;
  assert.equal((await send('live')).code, 429);
  assert.equal(writes, 1);
});
