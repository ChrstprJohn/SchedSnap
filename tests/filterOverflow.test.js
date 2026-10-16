import test from 'node:test';
import assert from 'node:assert/strict';
import { fittingFilterCount, fittingFilterIndices } from '../src/utils/filterOverflow.js';

test('filters fit completely or reserve More before the next filter would overflow', () => {
  assert.equal(fittingFilterCount(216, [100, 100], 60, 8), 2);
  assert.equal(fittingFilterCount(200, [100, 100], 60, 8), 1);
  assert.equal(fittingFilterCount(80, [100, 100], 60, 8), 0);
  assert.equal(fittingFilterCount(324, [100, 100, 100], 60, 8), 3);
  assert.equal(fittingFilterCount(250, [100, 100, 100], 60, 8), 1);
});

test('fills spare space with later categories when the next pill is too wide', () => {
  assert.deepEqual(fittingFilterIndices(588, [105, 75, 82, 88, 129, 72, 139, 93], 88, 8), [0, 1, 2, 3, 5]);
  assert.deepEqual(fittingFilterIndices(216, [100, 100], 60, 8), [0, 1]);
  assert.deepEqual(fittingFilterIndices(60, [100, 100], 60, 8), []);
});
