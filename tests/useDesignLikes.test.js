import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/lib/useDesignLikes.js', import.meta.url), 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));

// Exercise the actual hook with controllable network replies and a small hook host.
async function browser(identified = true) {
  const slots = [];
  const requests = [];
  let cursor;
  let hook;
  let effect;
  let registered = false;
  let reads = 0;
  const context = {
    window: new EventTarget(), queueMicrotask,
    useCallback: fn => fn,
    useEffect(fn) { if (!registered) { registered = true; effect = fn; } },
    useRef(value) { const index = cursor++; slots[index] ||= { current: value }; return slots[index]; },
    useState(value) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = value;
      return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; render(); }];
    },
    api: {
      get: async () => { reads++; return { data: { identified, likes: { first: { count: 7, liked: false }, second: { count: 2, liked: false } } } }; },
      post: (_url, body) => new Promise((resolve, reject) => requests.push({ body, resolve: data => resolve({ data }), reject })),
    },
  };
  runInNewContext(source.replace(/^import .*;\r?$/gm, '').replace('export default ', '') + '\nglobalThis.useHook = useDesignLikes;', context);
  function render() { cursor = 0; hook = context.useHook(); }
  render();
  const unmount = effect();
  await settle();
  return { hook: () => hook, requests, reads: () => reads, unmount };
}

test('hearts and counts change before any network response, including first-cookie setup', async () => {
  const page = await browser(false);
  const saving = page.hook().toggle('first');
  assert.equal(page.hook().likes.first.liked, true);
  assert.equal(page.hook().likes.first.count, 8);
  assert.equal(page.requests[0].body.action, 'identify');
  page.hook().toggle('first');
  assert.equal(page.hook().likes.first.liked, false);
  assert.equal(page.hook().likes.first.count, 7);
  page.requests[0].resolve({});
  await saving;
  assert.equal(page.requests.length, 1); // Two opposite clicks need no vote write.
  assert.equal(page.hook().pending, 0);
  page.unmount();
});

test('rapid toggles preserve the latest choice while old replies reconcile public counts', async () => {
  const page = await browser();
  const saving = page.hook().toggle('first');
  page.hook().toggle('first');
  assert.equal(page.hook().likes.first.liked, false);
  page.requests[0].resolve({ count: 10, liked: true });
  await settle();
  assert.equal(page.hook().likes.first.liked, false);
  assert.equal(page.hook().likes.first.count, 9);
  assert.equal(page.requests[1].body.liked, false);
  page.requests[1].resolve({ count: 9, liked: false });
  await saving;
  assert.equal(page.hook().likes.first.count, 9);
  assert.equal(page.hook().pending, 0);
  page.unmount();
});

test('different designs update independently and share one cookie setup request', async () => {
  const page = await browser(false);
  const first = page.hook().toggle('first');
  const second = page.hook().toggle('second');
  assert.equal(page.hook().likes.first.count, 8);
  assert.equal(page.hook().likes.second.count, 3);
  assert.equal(page.requests.length, 1);
  await page.hook().refresh();
  assert.equal(page.reads(), 1); // A focus refresh cannot overwrite unsaved hearts.
  page.requests[0].resolve({});
  await settle();
  assert.equal(page.requests.length, 3);
  page.requests[1].resolve({ count: 8, liked: true });
  page.requests[2].resolve({ count: 3, liked: true });
  await Promise.all([first, second]);
  assert.equal(page.hook().likes.first.liked, true);
  assert.equal(page.hook().likes.second.liked, true);
  assert.equal(page.hook().pending, 0);
  page.unmount();
});

test('failed saves restore the last confirmed state and show the server recovery message', async () => {
  const page = await browser();
  const saving = page.hook().toggle('first');
  page.hook().toggle('first');
  page.requests[0].resolve({ count: 8, liked: true });
  await settle();
  page.requests[1].reject({ response: { status: 429, data: { error: { message: 'Try again in a minute.' } } } });
  await saving;
  assert.equal(page.hook().likes.first.liked, true);
  assert.equal(page.hook().likes.first.count, 8);
  assert.equal(page.hook().error, 'Try again in a minute.');
  assert.equal(page.hook().pending, 0);
  page.unmount();
});
