import test from 'node:test';
import assert from 'node:assert/strict';
import { onepieceTemplates } from '../src/assets/onepieceTemplates.js';
import { wallpaperTemplates } from '../src/assets/templates.js';
import manifest from '../src/assets/cloudinaryManifest.js';

test('retired legacy One Piece IDs and artwork are absent from the selectable catalog', () => {
  for (const archived of onepieceTemplates) {
    assert.equal(wallpaperTemplates.some(t => t.id === archived.id), false, archived.id);
    for (const path of Object.values(archived.deviceImages)) assert.equal(manifest[path], undefined, path);
  }
});
