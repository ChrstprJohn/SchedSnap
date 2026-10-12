import test from 'node:test';
import assert from 'node:assert/strict';
import { createImportUsage } from '../server/importUsage.js';

const request = { socket: { remoteAddress: '203.0.113.1' } };

test('10 imports per IP, concurrent requests cannot exceed the limit, GET does not consume', async () => {
  const usage = createImportUsage({ env: {} });
  assert.equal((await usage(request)).used, 0);
  const results = await Promise.all(Array.from({ length: 12 }, () => usage(request, true)));
  assert.equal(results.filter(result => result.allowed).length, 10);
  assert.equal((await usage(request)).used, 10);
  assert.equal((await usage({ socket: { remoteAddress: '203.0.113.2' } })).used, 0);
  assert.equal((await usage({ ...request, headers: { 'x-forwarded-for': '203.0.113.99' } })).used, 10);
});

test('allowance resets at midnight Philippine time', async () => {
  let time = Date.parse('2026-10-12T15:59:59Z');
  const usage = createImportUsage({ env: {}, now: () => time });
  const first = await usage(request, true);
  assert.equal(first.resetsAt, Date.parse('2026-10-12T16:00:00Z'));
  time = first.resetsAt;
  assert.equal((await usage(request)).used, 0);
});

test('production fails closed without storage or trusted IP', async () => {
  await assert.rejects(createImportUsage({ env: { VERCEL: '1' } })({ headers: { 'x-vercel-forwarded-for': '203.0.113.1' } }), /storage unavailable/);
  await assert.rejects(createImportUsage({ env: { VERCEL: '1' } })(request), /identity unavailable/);
});

test('Redis reserves atomically with daily expiry and stores a hash rather than raw IP', async () => {
  let command;
  const usage = createImportUsage({
    env: { VERCEL: '1', UPSTASH_REDIS_REST_URL: 'https://example.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'secret', IMPORT_LIMIT_SECRET: 'hash-secret' },
    fetcher: async (url, options) => { command = JSON.parse(options.body); return { ok: true, json: async () => ({ result: [10, 0] }) }; },
  });
  const result = await usage({ headers: { 'x-vercel-forwarded-for': '203.0.113.1' } }, true);
  assert.equal(result.allowed, false);
  assert.equal(command[0], 'EVAL');
  assert.ok(command[1].includes('EXPIREAT'));
  assert.match(command[1], /if count == 1 then redis.call\('EXPIREAT'/);
  assert.ok(!JSON.stringify(command).includes('203.0.113.1'));
  assert.equal(command[4], String(result.resetsAt / 1000));
});

test('Redis errors and malformed replies block usage', async () => {
  for (const payload of [{ error: 'failure' }, { result: [11, 1] }, { result: [1, 7] }]) {
    const usage = createImportUsage({ env: { UPSTASH_REDIS_REST_URL: 'https://example.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'secret', IMPORT_LIMIT_SECRET: 'secret' }, fetcher: async () => ({ ok: true, json: async () => payload }) });
    await assert.rejects(usage(request, true));
  }
});
