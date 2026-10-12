import test from 'node:test';
import assert from 'node:assert/strict';
import { createVisitsHandler } from '../api/visits.js';

const env = { POSTHOG_PROJECT_ID: '643035', POSTHOG_PERSONAL_API_KEY: 'server-secret' };
function responseStub() {
  return {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}
const payloadResponse = results => ({ ok: true, json: async () => ({ results }) });
async function read(handler) {
  const response = responseStub();
  await handler({ method: 'GET' }, response);
  return response;
}

test('visits only supports GET and cannot increment or accept a public query', async () => {
  const handler = createVisitsHandler({ env, fetcher: () => assert.fail('Must not query') });
  for (const method of ['POST', 'DELETE', 'PUT']) {
    const response = responseStub();
    await handler({ method, body: { query: 'SELECT * FROM persons' } }, response);
    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, 'GET');
    assert.equal(response.headers['Cache-Control'], 'no-store');
  }
});

test('missing or invalid PostHog configuration returns unavailable without making a request', async () => {
  for (const settings of [{}, { POSTHOG_PROJECT_ID: '643035' }, { ...env, POSTHOG_PROJECT_ID: '123/path' }, { ...env, POSTHOG_API_HOST: 'http://us.posthog.com' }, { ...env, POSTHOG_API_HOST: 'https://user:password@us.posthog.com' }]) {
    const response = await read(createVisitsHandler({ env: settings, fetcher: () => assert.fail('Must not query') }));
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { visits: null });
  }
});

test('queries only recorded SchedSnap production sessions and exposes only the aggregate', async () => {
  const response = await read(createVisitsHandler({ env, fetcher: async (url, options) => {
    assert.equal(url, 'https://us.posthog.com/api/projects/643035/query/');
    assert.equal(options.headers.Authorization, 'Bearer server-secret');
    assert.equal(options.method, 'POST');
    assert.equal(options.redirect, 'error');
    const { query } = JSON.parse(options.body);
    assert.equal(query.kind, 'HogQLQuery');
    assert.match(query.query, /count\(DISTINCT properties\.\$session_id\)/);
    assert.match(query.query, /event = '\$pageview'/);
    assert.match(query.query, /properties\.site_name = 'schedsnap'/);
    assert.match(query.query, /properties\.environment = 'production'/);
    assert.match(query.query, /properties\.\$session_id IS NOT NULL/);
    return payloadResponse([['42']]);
  } }));
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { visits: 42 });
  assert.match(response.headers['Cache-Control'], /s-maxage=300/);
  assert.ok(!JSON.stringify(response.body).includes('server-secret'));
});

test('the EU ingestion host maps to the private EU query host', async () => {
  const response = await read(createVisitsHandler({ env: { ...env, VITE_POSTHOG_HOST: 'https://eu.i.posthog.com' }, fetcher: async url => {
    assert.equal(url, 'https://eu.posthog.com/api/projects/643035/query/');
    return payloadResponse([[0]]);
  } }));
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { visits: 0 });
});

test('concurrent requests and cached reads share one query, then refresh after five minutes', async () => {
  let calls = 0;
  let clock = 1000;
  const handler = createVisitsHandler({ env, now: () => clock, fetcher: async () => {
    calls++;
    return payloadResponse([[calls]]);
  } });
  const responses = await Promise.all([read(handler), read(handler), read(handler)]);
  assert.deepEqual(responses.map(response => response.body.visits), [1, 1, 1]);
  assert.equal((await read(handler)).body.visits, 1);
  assert.equal(calls, 1);
  clock += 300001;
  assert.equal((await read(handler)).body.visits, 2);
  assert.equal(calls, 2);
});

test('provider errors, unfinished queries, and malformed totals stay unavailable without secrets', async () => {
  const fetchers = [
    async () => { throw new Error('server-secret'); },
    async () => ({ ok: false }),
    ...[null, [], [[null]], [[false]], [[-1]], [[2.5]], [['']], [['bad']], [[Number.MAX_SAFE_INTEGER + 1]], [[1, 2]], [[1], [2]]].map(results => async () => payloadResponse(results)),
    async () => ({ ok: true, json: async () => ({ query_status: { complete: false } }) }),
    async () => ({ ok: true, json: async () => ({ error: 'server-secret', results: [[3]] }) }),
  ];
  for (const fetcher of fetchers) {
    const response = await read(createVisitsHandler({ env, fetcher }));
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { visits: null });
    assert.equal(response.headers['Cache-Control'], 'no-store');
  }
});

test('failed queries back off for 30 seconds before recovering', async () => {
  let calls = 0;
  let clock = 1000;
  const handler = createVisitsHandler({ env, now: () => clock, fetcher: async () => {
    calls++;
    if (calls === 1) throw new Error('Unavailable');
    return payloadResponse([[9]]);
  } });
  assert.equal((await read(handler)).statusCode, 503);
  assert.equal((await read(handler)).statusCode, 503);
  assert.equal(calls, 1);
  clock += 30001;
  assert.equal((await read(handler)).body.visits, 9);
});

test('browser StrictMode mounts and navigation share a read-only request', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls++;
    assert.equal(url, '/api/visits');
    assert.equal(options.method, 'GET');
    return { ok: true, json: async () => ({ visits: 5 }) };
  });
  const { loadVisitCount } = await import('../src/lib/visits.js?test=sharing');
  assert.deepEqual(await Promise.all([loadVisitCount(), loadVisitCount(), loadVisitCount()]), [5, 5, 5]);
  assert.equal(calls, 1);
});

test('browser failures return unavailable, then retry after the short backoff', async t => {
  let calls = 0;
  let clock = 1000;
  t.mock.method(Date, 'now', () => clock);
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return calls === 1 ? { ok: false } : { ok: true, json: async () => ({ visits: 0 }) };
  });
  const { loadVisitCount } = await import('../src/lib/visits.js?test=recovery');
  assert.equal(await loadVisitCount(), null);
  assert.equal(await loadVisitCount(), null);
  assert.equal(calls, 1);
  clock += 30001;
  assert.equal(await loadVisitCount(), 0);
});
