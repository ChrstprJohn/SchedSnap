import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function host() {
  const slots = [], observers = [];
  let cursor, effects, result, total = 80, key = 'all';
  const context = {
    useRef: initial => {
      const index = cursor++;
      slots[index] ||= { current: initial };
      return slots[index];
    },
    useState: initial => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; render(); }];
    },
    useEffect: (fn, deps) => {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) {
        previous?.cleanup?.();
        slots[index] = { deps };
        effects.push(() => { slots[index].cleanup = fn(); });
      }
    },
    IntersectionObserver: class {
      constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
      observe(node) { this.node = node; }
      disconnect() { this.disconnected = true; }
    },
  };
  const source = readFileSync(new URL('../src/lib/useInfiniteGallery.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?$/gm, '').replace('export default function', 'function');
  runInNewContext(`${source}\nglobalThis.useHook = useInfiniteGallery;`, context);
  function render() {
    cursor = 0; effects = [];
    result = context.useHook(total, key);
    const pending = effects;
    pending.forEach(effect => effect());
  }
  render();
  return { result: () => result, observers, change: (nextKey, nextTotal) => { key = nextKey; total = nextTotal; render(); } };
}

test('infinite gallery observes a sentinel mounted after loading and rearms for each page', () => {
  const page = host(), node = {};
  assert.equal(page.observers.length, 0);
  assert.equal(typeof page.result().sentinel, 'function');
  page.result().sentinel(node);
  assert.equal(page.observers.at(-1).node, node);
  page.observers.at(-1).callback([{ isIntersecting: true }]);
  assert.equal(page.result().count, 40);
  assert.equal(page.observers.at(-1).node, node);
  page.result().sentinel(null);
  assert.equal(page.observers.at(-1).disconnected, true);
});

test('category changes reset pagination and manual loading stops at the final page', () => {
  const page = host();
  page.result().loadMore();
  assert.equal(page.result().count, 40);
  page.change('hunter', 35);
  assert.equal(page.result().count, 20);
  assert.equal(page.result().hasMore, true);
  page.result().loadMore();
  assert.equal(page.result().hasMore, false);
});
