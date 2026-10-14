import test from 'node:test';
import assert from 'node:assert/strict';
import { onepieceReferenceTemplates } from '../src/assets/onepieceReferenceTemplates.js';
import { wallpaperTemplates } from '../src/assets/templates.js';
import manifest from '../src/assets/cloudinaryManifest.js';

test('removed One Piece reference designs have no active catalog entries or delivery mappings', () => {
  for (const archived of onepieceReferenceTemplates) {
    assert.equal(wallpaperTemplates.some(t => t.id === archived.id), false, archived.id);
    for (const path of Object.values(archived.deviceImages)) assert.equal(manifest[path], undefined, path);
  }
});
