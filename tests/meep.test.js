import test from 'node:test';
import assert from 'node:assert/strict';
import { meepTemplates } from '../src/assets/meepTemplates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import manifest from '../src/assets/cloudinaryManifest.js';

test('Meep expressions publish as their own collection with reusable mascot artwork', () => {
  assert.equal(meepTemplates.length,16);
  assert.equal(new Set(meepTemplates.map(t=>t.id)).size,16);
  assert.equal(new Set(meepTemplates.map(t=>t.image)).size,16);
  for (const [index,template] of meepTemplates.entries()) {
    assert.equal(Boolean(template.pattern),index % 2 === 1);
    assert.equal(template.id.endsWith('-pattern'),false);
  }
  for(const template of meepTemplates) {
    const parsed=templateSchema.parse({...template,status:'published'});
    assert.equal(parsed.layout,'mascot');
    assert.equal(parsed.mascotPosition,'center');
    assert.equal(matchesGalleryCategory(parsed,'meep'),true);
    assert.equal(matchesGalleryCategory(parsed,'mascot'),false);
    assert.equal(matchesGalleryCategory(parsed,'style-3d'),false);
    assert.equal(parsed.deviceImages,undefined);
    assert.ok(manifest[parsed.image].width>=1024 && manifest[parsed.image].width<=1536);
    assert.ok(manifest[parsed.image].height>=1024 && manifest[parsed.image].height<=1536);
    assert.ok(manifest[parsed.image].url.startsWith('https://res.cloudinary.com/'));
    assert.equal(templateSchema.safeParse({...parsed,image:manifest[parsed.image].url}).success,true);
  }
});
