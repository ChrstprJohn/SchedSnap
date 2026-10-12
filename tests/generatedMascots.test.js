import test from 'node:test';
import assert from 'node:assert/strict';
import { generatedMascotTemplates } from '../src/assets/generatedMascotTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { templateSchema } from '../shared/templateSchema.js';

test('61 new templates use unique uploaded cutouts and valid published presets', () => {
  assert.equal(generatedMascotTemplates.length, 61);
  assert.equal(new Set(generatedMascotTemplates.map(template => template.id)).size, 61);
  assert.equal(new Set(generatedMascotTemplates.map(template => template.image)).size, 61);
  for (const template of generatedMascotTemplates) {
    assert.equal(templateSchema.safeParse({ ...template, status: 'published' }).success, true, template.id);
    assert.match(template.image, /\/masters\/[^/]+\.png$/);
    assert.ok(manifest[template.image]?.url.startsWith('https://res.cloudinary.com/'), template.id);
    assert.equal(template.deviceImages, undefined);
    assert.equal(template.pixelArt, template.mascotStyle === 'pixel');
  }
});

test('no redundant padded mascot layout uploads remain in the delivery manifest', () => {
  assert.equal(Object.keys(manifest).filter(path => /^\/images\/(mascots|pixel-mascots|goofy-mascots|doodle-mascots)\/(mobile|tablet|laptop)\//.test(path)).length, 0);
});
