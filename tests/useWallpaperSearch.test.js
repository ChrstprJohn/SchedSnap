import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const sourceUrl = new URL('../src/lib/useWallpaperSearch.js', import.meta.url);

function host(t, hookName, initialValue, reducedMotion = false) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const motion = Object.assign(new EventTarget(), { matches: reducedMotion });
  const document = Object.assign(new EventTarget(), { hidden: false });
  const slots = [];
  let cursor = 0;
  let effects = [];
  let value = initialValue;
  let result;
  const context = {
    window: { setTimeout, clearTimeout, matchMedia: () => motion }, document,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], next => { slots[index] = next; render(); }];
    },
    useEffect(fn, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((dep, i) => dep !== previous.deps[i])) {
        previous?.cleanup?.();
        slots[index] = { deps };
        effects.push(() => { slots[index].cleanup = fn(); });
      }
    },
  };
  const source = readFileSync(sourceUrl, 'utf8').replace(/^import .*;\r?$/gm, '').replaceAll('export function ', 'function ');
  runInNewContext(`${source}\nglobalThis.hook = ${hookName};`, context);
  function render() {
    cursor = 0;
    result = context.hook(value);
    const pending = effects;
    effects = [];
    pending.forEach(effect => effect());
  }
  render();
  return {
    result: () => result,
    update(next) { value = next; render(); },
    unmount() { slots.forEach(slot => slot?.cleanup?.()); },
    motion, document,
  };
}

test('examples type and rotate every three seconds while the field is empty', t => {
  const page = host(t, 'useSearchPlaceholder', '');
  assert.equal(page.result(), 'Genshin Impact…');
  t.mock.timers.tick(3000);
  for (const example of ['Sanrio…', 'Notebook Hours…', 'We Bare Bears…', 'Chiikawa…', 'Patterns & prints…']) {
    assert.equal(page.result(), example[0]);
    for (let i = 1; i < example.length; i++) t.mock.timers.tick(50);
    assert.equal(page.result(), example);
    t.mock.timers.tick(3000 - (example.length - 1) * 50);
  }
  assert.equal(page.result(), 'G');
  page.unmount();
});

test('reduced motion rotates complete examples instead of freezing', t => {
  const page = host(t, 'useSearchPlaceholder', '', true);
  t.mock.timers.tick(3000);
  assert.equal(page.result(), 'Sanrio…');
  t.mock.timers.tick(3000);
  assert.equal(page.result(), 'Notebook Hours…');
  page.unmount();
});

test('typing pauses placeholders and unmount cancels pending animation', t => {
  const page = host(t, 'useSearchPlaceholder', '');
  page.update('hu tao');
  t.mock.timers.tick(6000);
  assert.equal(page.result(), 'Genshin Impact…');
  page.update('');
  page.unmount();
  t.mock.timers.tick(6000);
  assert.equal(page.result(), 'Genshin Impact…');
});

test('rapid typing searches once after 300ms and clear cancels stale input', t => {
  const page = host(t, 'useDebouncedSearch', '');
  page.update('g');
  t.mock.timers.tick(200);
  page.update('gen');
  t.mock.timers.tick(200);
  page.update('genshin');
  t.mock.timers.tick(299);
  assert.equal(page.result(), '');
  t.mock.timers.tick(1);
  assert.equal(page.result(), 'genshin');
  page.update('sanrio');
  page.update('');
  assert.equal(page.result(), '');
  t.mock.timers.tick(300);
  assert.equal(page.result(), '');
  page.unmount();
});
