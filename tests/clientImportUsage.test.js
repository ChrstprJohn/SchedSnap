import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/lib/importUsage.js', import.meta.url), 'utf8');

function browser() {
  let time = 1000;
  const requests = [];
  const context = {
    Date: { now: () => time },
    api: { get: url => new Promise((resolve, reject) => requests.push({ url, resolve: usage => resolve({ data: { usage } }), reject })) },
  };
  runInNewContext(source.replace(/^import .*;\r?$/gm, '').replaceAll('export ', '') + '\nglobalThis.load = loadImportUsage; globalThis.remember = rememberImportUsage;', context);
  return { ...context, requests, advance: ms => { time += ms; } };
}

const allowance = (used = 0, resetsAt = 1000000) => ({ used, limit: 10, resetsAt, allowed: used < 10 });

test('concurrent allowance reads, panel reopen and remount reuse one request for a minute', async () => {
  const page = browser();
  const reads = [page.load(), page.load()];
  assert.equal(page.requests.length, 1);
  assert.equal(page.requests[0].url, '/analyze');
  const usage = allowance();
  page.requests[0].resolve(usage);
  assert.deepEqual(await Promise.all(reads), [usage, usage]);
  assert.equal(await page.load(), usage);
  assert.equal(page.requests.length, 1);
  page.advance(60000);
  const next = page.load();
  assert.equal(page.requests.length, 2);
  page.requests[1].resolve(allowance(1));
  assert.equal((await next).used, 1);
});

test('confirmed reservations update the allowance cache without an additional read', async () => {
  const page = browser();
  page.remember(allowance(3));
  assert.equal((await page.load()).used, 3);
  assert.equal(page.requests.length, 0);
});

test('an older GET cannot overwrite a newer import reservation', async () => {
  const page = browser();
  const loading = page.load();
  page.remember(allowance(4));
  page.requests[0].resolve(allowance(3));
  assert.equal((await loading).used, 4);
  assert.equal((await page.load()).used, 4);
  assert.equal(page.requests.length, 1);
});

test('allowance cache expires at midnight even before a minute passes', async () => {
  const page = browser();
  page.remember(allowance(10, 2000));
  page.advance(1000);
  const loading = page.load();
  assert.equal(page.requests.length, 1);
  page.requests[0].resolve(allowance());
  assert.equal((await loading).used, 0);
});

test('failed reads can retry and uncertain cancelled imports invalidate the cached allowance', async () => {
  const page = browser();
  const failing = page.load();
  page.requests[0].reject(new Error('offline'));
  await assert.rejects(failing, /offline/);
  const retrying = page.load();
  page.requests[1].resolve(allowance(1));
  await retrying;
  page.remember(null);
  const refreshing = page.load();
  assert.equal(page.requests.length, 3);
  page.requests[2].resolve(allowance(2));
  assert.equal((await refreshing).used, 2);
});
