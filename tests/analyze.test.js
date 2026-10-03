import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalyzeHandler } from '../api/analyze.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';
import { MAX_IMAGE_BYTES } from '../shared/uploadLimits.js';

const image = { mimeType: 'image/png', image: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]).toString('base64') };

function responseStub() {
  return {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; },
  };
}

test('API refuses unsupported methods and marks responses as non-cacheable', async () => {
  const response = responseStub();
  await createAnalyzeHandler()({ method: 'GET' }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'POST');
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('missing key gives a recoverable configuration error', async () => {
  const response = responseStub();
  await createAnalyzeHandler({ env: {} })({ method: 'POST', body: image }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'AI_NOT_CONFIGURED');
});

test('a display name is rejected as configuration before spending API quota', async () => {
  let called = false;
  const response = responseStub();
  await createAnalyzeHandler({ env: { GEMINI_API_KEY: 'test-secret', GEMINI_MODEL: 'Gemini 3.1 Flash Lite' }, generate: async () => { called = true; } })({ method: 'POST', body: image }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'INVALID_MODEL_CONFIG');
  assert.equal(called, false);
});

test('rejects invalid image data and oversized uploads before calling Gemini', async () => {
  let called = false;
  const handler = createAnalyzeHandler({ env: { GEMINI_API_KEY: 'test-secret' }, generate: async () => { called = true; } });
  for (const body of [null, { ...image, mimeType: 'image/jpeg' }, { ...image, image: 'not base64' }, '{bad json']) {
    const response = responseStub();
    await handler({ method: 'POST', body }, response);
    assert.equal(response.statusCode, 400);
  }
  const oversized = responseStub();
  await handler({ method: 'POST', body: { ...image, image: 'a'.repeat(Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 4) } }, oversized);
  assert.equal(oversized.statusCode, 413);
  assert.equal(called, false);
});

test('returns validated extracted data, using the configured model and inline image', async () => {
  let parameters;
  const handler = createAnalyzeHandler({ env: { GEMINI_API_KEY: 'test-secret', GEMINI_MODEL: 'configured-model' }, generate: async (request) => { parameters = request; return { text: JSON.stringify(sampleSchedule) }; } });
  const response = responseStub();
  await handler({ method: 'POST', body: image }, response);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.schedule, sampleSchedule);
  assert.equal(parameters.model, 'configured-model');
  assert.equal(parameters.contents[0].parts[1].inlineData.data, image.image);
  assert.ok(!JSON.stringify(response.body).includes('test-secret'));
});

test('handles absent schedules and malformed or invalid AI results', async () => {
  for (const [text, status] of [['bad json', 502], ['null', 502], [JSON.stringify({ ...sampleSchedule, classes: [] }), 422], [JSON.stringify({ ...sampleSchedule, classes: [{ subject: '', meetings: [] }] }), 502]]) {
    const response = responseStub();
    await createAnalyzeHandler({ env: { GEMINI_API_KEY: 'test-secret' }, generate: async () => ({ text }) })({ method: 'POST', body: image }, response);
    assert.equal(response.statusCode, status);
  }
});

test('provider errors never leak secrets and expose useful recovery codes', async () => {
  for (const [providerStatus, responseStatus, code] of [[400, 502, 'AI_REQUEST_REJECTED'], [429, 429, 'AI_RATE_LIMIT'], [403, 503, 'AI_UNAVAILABLE'], [404, 503, 'AI_UNAVAILABLE'], [500, 502, 'AI_ERROR']]) {
    const response = responseStub();
    await createAnalyzeHandler({ env: { GEMINI_API_KEY: 'test-secret' }, generate: async () => { throw Object.assign(new Error('test-secret provider internals'), { status: providerStatus }); } })({ method: 'POST', body: image }, response);
    assert.equal(response.statusCode, responseStatus);
    assert.equal(response.body.error.code, code);
    assert.ok(!JSON.stringify(response.body).includes('test-secret'));
  }
});
