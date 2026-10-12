import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createDesignLikes } from '../server/designLikes.js';
import { createLikesHandler } from '../api/likes.js';

const time = Date.parse('2026-10-12T12:00:00Z');
const request = (body, cookie, extra = {}) => ({
  method: body ? 'POST' : 'GET', url: '/api/likes', body,
  headers: { host: 'localhost:5173', origin: 'http://localhost:5173', 'content-type': 'application/json', cookie, ...extra },
  socket: { remoteAddress: '203.0.113.1' },
});
const response = () => ({ headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const env = { UPSTASH_REDIS_REST_URL: 'https://example.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'redis-token', IMPORT_LIMIT_SECRET: 'test-secret', VERCEL: '1' };

test('browsing does not set a cookie; first interaction confirms cookies before counting', async () => {
  const handler = createLikesHandler({ env: {} });
  async function call(req) { const res = response(); await handler(req, res); return res; }
  const browse = await call(request());
  const id = Object.keys(browse.body.likes)[0];
  assert.equal(browse.code, 200);
  assert.equal(browse.body.identified, false);
  assert.equal(browse.headers['Set-Cookie'], undefined);
  assert.deepEqual(browse.body.likes[id], { count: 0, liked: false });
  assert.equal((await call(request({ id, liked: true }))).code, 428);
  const identify = await call(request({ action: 'identify' }));
  const cookie = identify.headers['Set-Cookie'].split(';')[0];
  assert.match(identify.headers['Set-Cookie'], /HttpOnly; SameSite=Strict; Max-Age=31536000/);
  assert.deepEqual((await call(request({ id, liked: true }, cookie))).body, { id, count: 1, liked: true });
  assert.equal((await call(request({ action: 'identify' }, cookie))).headers['Set-Cookie'], undefined);
  const revisit = await call(request(undefined, cookie));
  assert.deepEqual(revisit.body.likes[id], { count: 1, liked: true });
  assert.equal((await call(request())).body.likes[id].count, 1);
});

test('concurrent repeat likes are idempotent; browsers are independent and can unlike', async () => {
  const likes = createDesignLikes({ env: {}, now: () => time });
  const first = likes.identity(request(undefined, likes.cookie().split(';')[0]));
  const second = likes.identity(request(undefined, likes.cookie().split(';')[0]));
  assert.notEqual(first, second);
  await Promise.all(Array.from({ length: 12 }, () => likes.write('design', first, true)));
  assert.deepEqual(await likes.read(['design'], first), { design: { count: 1, liked: true } });
  assert.deepEqual(await likes.write('design', second, true), { count: 2, liked: true });
  await Promise.all(Array.from({ length: 12 }, () => likes.write('design', first, false)));
  assert.deepEqual(await likes.read(['design'], first), { design: { count: 1, liked: false } });
});

test('cookie signatures reject forgery and expiry; production cookies are secure', () => {
  let clock = time;
  const likes = createDesignLikes({ env, now: () => clock });
  const raw = likes.cookie();
  const cookie = raw.split(';')[0];
  assert.match(raw, /; Secure$/);
  assert.ok(likes.identity(request(undefined, cookie)));
  assert.equal(likes.identity(request(undefined, cookie.replace(/=./, '=z'))), null);
  assert.equal(createDesignLikes({ env: { ...env, IMPORT_LIMIT_SECRET: 'other-secret' }, now: () => clock }).identity(request(undefined, cookie)), null);
  clock += 31536000 * 1000;
  assert.equal(likes.identity(request(undefined, cookie)), null);
});

test('existing signed browser cookies retain their identity after the index upgrade', () => {
  const id = 'a'.repeat(32);
  const value = `${id}.${Math.floor(time / 1000) + 31536000}`;
  const signature = createHmac('sha256', env.IMPORT_LIMIT_SECRET).update(`schedsnap-likes:${value}`).digest('base64url');
  const likes = createDesignLikes({ env, now: () => time });
  assert.equal(likes.identity(request(undefined, `schedsnap_likes=${value}.${signature}`)), id);
  assert.match(likes.identity(request(undefined, likes.cookie().split(';')[0])), /^v2:[a-f0-9]{32}$/);
});

test('API rejects cross-origin writes, bad input, and unpublished IDs without votes', async () => {
  let writes = 0;
  const handler = createLikesHandler({ env: {}, likes: { identity: () => 'browser', allow: async () => true, write: async () => writes++ } });
  const cases = [
    [request({ id: 'x', liked: true }, '', { origin: 'https://other.test' }), 403],
    [request({ id: 'x', liked: true }, '', { 'content-type': 'text/plain' }), 415],
    [request({ id: 'x', liked: 1 }), 400],
    [request({ id: '../x', liked: true }), 400],
    [request({ id: 'missing-template', liked: true }), 404],
    [{ ...request(), method: 'DELETE' }, 405],
  ];
  for (const [req, code] of cases) { const res = response(); await handler(req, res); assert.equal(res.code, code); }
  assert.equal(writes, 0);
  const cloudEnv = { CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'key', CLOUDINARY_API_SECRET: 'secret' };
  const hidden = createLikesHandler({ env: cloudEnv, store: { read: async () => ({ templates: [{ id: 'hidden', status: 'hidden' }] }) }, likes: { identity: () => 'browser', allow: async () => true } });
  const res = response(); await hidden(request({ id: 'hidden', liked: true }), res); assert.equal(res.code, 404);
});

test('rate limits expire, ignore spoofed forwarding locally, and fail closed in production', async () => {
  let clock = time;
  const likes = createDesignLikes({ env: {}, now: () => clock });
  for (let i = 0; i < 60; i++) assert.equal(await likes.allow(request({})), true);
  assert.equal(await likes.allow(request({}, '', { 'x-forwarded-for': '203.0.113.2' })), false);
  clock += 60000;
  assert.equal(await likes.allow(request({})), true);
  const unavailable = createLikesHandler({ env: { VERCEL: '1' } });
  const res = response(); await unavailable(request(), res); assert.equal(res.code, 503);
  const limited = createLikesHandler({ env: {}, likes: { identity: () => null, allow: async () => false } });
  const limitRes = response(); await limited(request({ action: 'identify' }), limitRes);
  assert.equal(limitRes.code, 429);
  assert.equal(limitRes.headers['Retry-After'], '60');
  assert.equal(limitRes.headers['Set-Cookie'], undefined);
});

test('Redis writes are atomic, do not expire votes, and use hashed IP rate counters', async () => {
  const calls = [];
  const replies = [1, [3, 1], ['design', '3'], ['@ready', '1', 'design', '1']];
  const likes = createDesignLikes({ env, now: () => time, fetcher: async (url, options) => {
    calls.push({ url, command: JSON.parse(options.body) });
    const result = replies.shift();
    return { ok: true, json: async () => ({ result }) };
  } });
  assert.equal(await likes.allow(request({}, '', { 'x-vercel-forwarded-for': '203.0.113.1' })), true);
  assert.deepEqual(await likes.write('design', 'browser', true), { count: 3, liked: true });
  assert.deepEqual(await likes.read(['design'], 'browser'), { design: { count: 3, liked: true } });
  assert.equal(calls[0].command[0], 'EVAL');
  assert.match(calls[0].command[1], /EXPIRE/);
  assert.ok(!JSON.stringify(calls[0]).includes('203.0.113.1'));
  assert.match(calls[1].command[1], /SADD/);
  assert.match(calls[1].command[1], /SREM/);
  assert.ok(!calls[1].command[1].includes('EXPIRE'));
  assert.equal(calls[1].command[2], '3');
  assert.match(calls[1].command[1], /HSET/);
  assert.equal(calls[2].command[0], 'HGETALL');
  assert.equal(calls[3].command[0], 'HGETALL');
});

test('Redis failures and malformed counts never report success', async () => {
  for (const payload of [{ error: 'failure' }, { result: [-1, 1] }, { result: [1, 2] }]) {
    const likes = createDesignLikes({ env, fetcher: async () => ({ ok: true, json: async () => payload }) });
    await assert.rejects(likes.write('design', 'browser', true));
  }
  const likes = createDesignLikes({ env, fetcher: async () => ({ ok: true, json: async () => [] }) });
  await assert.rejects(likes.read(['design'], null));
});

test('180 designs need one shared counts read plus one browser-index read after warmup', async () => {
  let clock = time;
  const ids = Array.from({ length: 180 }, (_, i) => `design-${i}`);
  const commands = [];
  const likes = createDesignLikes({ env, now: () => clock, fetcher: async (_url, options) => {
    const command = JSON.parse(options.body); commands.push(command);
    const result = command[1] === 'schedsnap:likes:counts' ? ids.flatMap(id => [id, '2']) : [ids[0], '1'];
    return { ok: true, json: async () => ({ result }) };
  } });
  const guests = await Promise.all(Array.from({ length: 10 }, () => likes.read(ids, null)));
  assert.equal(commands.length, 1);
  assert.equal(guests[0][ids[0]].count, 2);
  const mine = await likes.read(ids, 'v2:browser');
  assert.equal(commands.length, 2);
  assert.equal(mine[ids[0]].liked, true);
  assert.equal(mine[ids[1]].liked, false);
  assert.ok(commands.every(command => command[0] === 'HGETALL'));
  await likes.read(ids, null);
  assert.equal(commands.length, 2);
  clock += 60000;
  await likes.read(ids, null);
  assert.equal(commands.length, 3);
});

test('legacy counts and browser likes are indexed once without dropping existing or hidden votes', async () => {
  const commands = [];
  let countsIndexed = false;
  let browserIndexed = false;
  const likes = createDesignLikes({ env, now: () => time, fetcher: async (_url, options) => {
    const command = JSON.parse(options.body); commands.push(command);
    let result;
    if (command[0] === 'HGETALL') result = command[1] === 'schedsnap:likes:counts'
      ? countsIndexed ? ['design', '4'] : []
      : browserIndexed ? ['@ready', '1', 'design', '1', 'hidden', '1'] : [];
    else if (command[3] === 'schedsnap:likes:counts') { countsIndexed = true; result = ['design', '4']; }
    else { browserIndexed = true; result = ['@ready', '1', 'design', '1', 'hidden', '1']; }
    return { ok: true, json: async () => ({ result }) };
  } });
  const mine = await likes.read(['design'], 'old-browser', ['design', 'hidden']);
  assert.deepEqual(mine.design, { count: 4, liked: true });
  const migrations = commands.filter(command => command[0] === 'EVAL');
  assert.equal(migrations.length, 2);
  assert.match(migrations[0][1], /HEXISTS/);
  assert.ok(migrations.some(command => command.includes('schedsnap:likes:design:hidden')));
  const before = commands.length;
  await likes.read(['design'], 'old-browser', ['design', 'hidden']);
  assert.equal(commands.length, before + 1);
  assert.equal(commands.at(-1)[0], 'HGETALL');
});

test('confirmed writes update cached public counts without another counts read', async () => {
  const commands = [];
  const likes = createDesignLikes({ env, now: () => time, fetcher: async (_url, options) => {
    const command = JSON.parse(options.body); commands.push(command);
    return { ok: true, json: async () => ({ result: command[0] === 'HGETALL' ? ['design', '4'] : [5, 1] }) };
  } });
  await likes.read(['design'], null);
  await likes.write('design', 'v2:browser', true);
  assert.deepEqual((await likes.read(['design'], null)).design, { count: 5, liked: false });
  assert.equal(commands.length, 2);
});
