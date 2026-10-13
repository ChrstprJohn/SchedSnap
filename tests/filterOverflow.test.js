import test from 'node:test';
import assert from 'node:assert/strict';
import { fittingFilterCount } from '../src/utils/filterOverflow.js';

test('filters fit completely or reserve More before the next filter would overflow', () => {
  assert.equal(fittingFilterCount(216, [100, 100], 60, 8), 2);
  assert.equal(fittingFilterCount(200, [100, 100], 60, 8), 1);
  assert.equal(fittingFilterCount(80, [100, 100], 60, 8), 0);
  assert.equal(fittingFilterCount(324, [100, 100, 100], 60, 8), 3);
  assert.equal(fittingFilterCount(250, [100, 100, 100], 60, 8), 1);
});
