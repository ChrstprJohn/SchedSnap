import test from 'node:test';
import assert from 'node:assert/strict';
import { createVisitsHandler } from '../api/visits.js';

const env = { UPSTASH_REDIS_REST_URL: 'https://counter.example/', UPSTASH_REDIS_REST_TOKEN: 'server-secret' };
function responseStub() {
  return {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('visits refuses unsupported methods and disables response caching', async () => {
  const response = responseStub();
  await createVisitsHandler({ env: {} })({ method: 'DELETE' }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'GET, POST');
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('unconfigured visits are unavailable rather than a fabricated zero', async () => {
  const response = responseStub();
  await createVisitsHandler({ env: {}, fetcher: () => assert.fail('Must not contact storage') })({ method: 'POST' }, response);
  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.body, { visits: null });
});

test('POST increments the shared counter while GET only reads it; credentials stay server-side', async () => {
  const commands = [];
  const handler = createVisitsHandler({ env, fetcher: async (url, options) => {
    assert.equal(url, 'https://counter.example');
    assert.equal(options.headers.Authorization, 'Bearer server-secret');
    commands.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ result: '42' }) };
  } });
  for (const method of ['POST', 'GET']) {
    const response = responseStub();
    await handler({ method }, response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { visits: 42 });
    assert.ok(!JSON.stringify(response.body).includes(env.UPSTASH_REDIS_REST_TOKEN));
  }
  assert.deepEqual(commands, [['INCR', 'schedsnap:visits'], ['GET', 'schedsnap:visits']]);
});

test('GET returns zero only when configured storage has no counter yet', async () => {
  const response = responseStub();
  await createVisitsHandler({ env, fetcher: async () => ({ ok: true, json: async () => ({ result: null }) }) })({ method: 'GET' }, response);
  assert.deepEqual(response.body, { visits: 0 });
  assert.equal(response.statusCode, 200);
});

test('storage outages and malformed counter values stay unavailable without exposing provider errors', async () => {
  const fetchers = [
    async () => { throw new Error('server-secret'); },
    async () => ({ ok: false }),
    ...[{}, { error: 'server-secret' }, { result: -1 }, { result: 2.5 }, { result: false }, { result: [] }, { result: '' }, { result: 'bad' }, { result: Number.MAX_SAFE_INTEGER + 1 }].map((payload) => async () => ({ ok: true, json: async () => payload })),
  ];
  for (const fetcher of fetchers) {
    const response = responseStub();
    await createVisitsHandler({ env, fetcher })({ method: 'GET' }, response);
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { visits: null });
  }
});

async function browserCounter(t, values, fetcher, suffix) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
    getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value),
  } });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'sessionStorage', descriptor);
    else delete globalThis.sessionStorage;
  });
  t.mock.method(globalThis, 'fetch', fetcher);
  return (await import(`../src/lib/visits.js?test=${suffix}`)).loadVisitCount;
}

test('StrictMode mounts and repeated navigation share one increment request', async (t) => {
  let calls = 0;
  const storage = new Map();
  const load = await browserCounter(t, storage, async (_url, options) => {
    calls++;
    assert.equal(options.method, 'POST');
    return { ok: true, json: async () => ({ visits: 5 }) };
  }, 'first');
  assert.deepEqual(await Promise.all([load(), load(), load()]), [5, 5, 5]);
  assert.equal(calls, 1);
  assert.equal(storage.get('schedsnap:visit-counted'), '1');
});

test('refresh in a counted session reads the total without incrementing', async (t) => {
  const load = await browserCounter(t, new Map([['schedsnap:visit-counted', '1']]), async (_url, options) => {
    assert.equal(options.method, 'GET');
    return { ok: true, json: async () => ({ visits: 6 }) };
  }, 'refresh');
  assert.equal(await load(), 6);
});

test('a failed visit request keeps the session uncounted and leaves the number unavailable', async (t) => {
  const storage = new Map();
  const load = await browserCounter(t, storage, async () => ({ ok: false }), 'failure');
  assert.equal(await load(), null);
  assert.equal(storage.size, 0);
});
