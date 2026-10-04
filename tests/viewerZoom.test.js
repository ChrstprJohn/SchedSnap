import test from 'node:test';
import assert from 'node:assert/strict';
import { zoomViewerWithWheel } from '../src/utils/viewerZoom.js';

test('ordinary wheel scrolling remains available for panning the image', () => {
  for (const event of [{ ctrlKey: false, deltaY: -100 }, { ctrlKey: true, deltaY: 0 }]) {
    let prevented = false, updated = false;
    zoomViewerWithWheel({ ...event, preventDefault() { prevented = true; } }, () => { updated = true; });
    assert.equal(prevented, false);
    assert.equal(updated, false);
  }
});

test('Control-wheel zooms the preview instead of the page and respects its bounds', () => {
  let zoom = 100;
  function wheel(deltaY) {
    let prevented = false;
    zoomViewerWithWheel({ ctrlKey: true, deltaY, preventDefault() { prevented = true; } }, (update) => { zoom = update(zoom); });
    assert.equal(prevented, true);
  }
  wheel(-100);
  assert.equal(zoom, 125);
  wheel(100);
  assert.equal(zoom, 100);
  for (let i = 0; i < 20; i++) wheel(-100);
  assert.equal(zoom, 400);
  for (let i = 0; i < 20; i++) wheel(100);
  assert.equal(zoom, 50);
});
