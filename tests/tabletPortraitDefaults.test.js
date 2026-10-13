import test from 'node:test';
import assert from 'node:assert/strict';
import { customizeWallpaperTemplate } from '../src/utils/wallpaperTheme.js';
import { wallpaperTemplates } from '../src/assets/templates.js';

test('every tablet portrait defaults to centered schedules and frosted cards while preserving other formats and custom choices', () => {
  for (const template of wallpaperTemplates) {
    const original = structuredClone(template);
    const portrait = customizeWallpaperTemplate(template, { orientation: 'portrait' }, 'tablet');
    assert.equal(portrait.schedulePosition, 'center');
    assert.equal(portrait.containerStyle, 'glass');
    assert.deepEqual(template, original);
    for (const device of ['mobile', 'laptop']) assert.equal(customizeWallpaperTemplate(template, {}, device), template);
    const landscape = customizeWallpaperTemplate(template, { orientation: 'landscape' }, 'tablet');
    assert.equal(landscape.schedulePosition, template.schedulePosition);
    assert.equal(landscape.containerStyle, template.containerStyle);
    const customized = customizeWallpaperTemplate(template, { orientation: 'portrait', schedulePosition: 'right', containerStyle: 'solid' }, 'tablet');
    assert.equal(customized.schedulePosition, 'right');
    assert.equal(customized.containerStyle, 'solid');
  }
});
