import test from 'node:test';
import assert from 'node:assert/strict';
import { getMascotStyle, mascotStyles } from '../src/config/mascotStyles.js';

test('mascot styles group soft and goofy into 3D while retaining pixel and doodle styles', () => {
  const base = { layout: 'mascot', collection: 'mascot' };
  assert.equal(getMascotStyle({ ...base, mascotStyle: 'soft' }), '3d');
  assert.equal(getMascotStyle({ ...base, mascotStyle: 'goofy' }), '3d');
  assert.equal(getMascotStyle({ ...base, mascotStyle: 'pixel' }), 'pixel');
  assert.equal(getMascotStyle({ ...base, mascotStyle: 'doodle' }), 'doodle');
  assert.equal(getMascotStyle(base), 'flat');
});
test('style classification excludes other themes and non-mascot artwork', () => {
  assert.equal(getMascotStyle({ collection: 'scenic', mascotStyle: 'soft' }), null);
  assert.equal(getMascotStyle({ layout: 'mascot', collection: 'little-friends' }), null);
  assert.equal(getMascotStyle({ collection: 'mascot' }), null);
  assert.equal(new Set(mascotStyles.map(style => style.id)).size, 5);
});
