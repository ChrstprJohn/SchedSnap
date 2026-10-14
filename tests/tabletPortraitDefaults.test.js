import test from 'node:test';
import assert from 'node:assert/strict';
import { customizeWallpaperTemplate } from '../src/utils/wallpaperTheme.js';
import { wallpaperTemplates } from '../src/assets/templates.js';

test('tablets stay portrait, with centered schedules and frosted cards, preserving explicit appearance choices', () => {
  for (const template of wallpaperTemplates) {
    const original = structuredClone(template);
    const portrait = customizeWallpaperTemplate(template, { orientation: 'portrait' }, 'tablet');
    assert.equal(portrait.schedulePosition, 'center');
    assert.equal(portrait.containerStyle, 'glass');
    assert.equal(portrait.tabletBoxSpacing, 80);
    assert.deepEqual(template, original);
    for (const device of ['mobile', 'laptop']) assert.equal(customizeWallpaperTemplate(template, {}, device), template);
    const landscape = customizeWallpaperTemplate(template, { orientation: 'landscape' }, 'tablet');
    assert.equal(landscape.orientation, 'portrait');
    assert.equal(landscape.schedulePosition, 'center');
    assert.equal(landscape.containerStyle, 'glass');
    const customized = customizeWallpaperTemplate(template, { orientation: 'portrait', schedulePosition: 'right', containerStyle: 'solid', tabletBoxSpacing: 240 }, 'tablet');
    assert.equal(customized.schedulePosition, 'right');
    assert.equal(customized.containerStyle, 'solid');
    assert.equal(customized.tabletBoxSpacing, 240);
  }
});
