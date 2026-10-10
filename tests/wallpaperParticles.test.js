import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutParticles, particleStyles } from '../src/utils/wallpaperParticles.js';
import { mascotTemplates } from '../src/assets/mascotTemplates.js';

const art = { x: 1300, y: 550, width: 500, height: 500 };
const schedule = { x: 100, y: 100, width: 1100, height: 800 };

test('particle defaults vary by design and remain stable between preview and export', () => {
  const variants = new Set();
  for (const template of mascotTemplates) {
    const first = layoutParticles(template, art, schedule, 1920, 1080);
    assert.deepEqual(layoutParticles(template, art, schedule, 1920, 1080), first);
    variants.add(first.map(({ kind }) => kind).join(','));
    assert.ok(first.length > 0 && first.length <= 6);
  }
  assert.ok(variants.size >= 6);
});

test('every particle choice changes motifs and None removes all generated decorations', () => {
  const variants = new Set();
  const template = mascotTemplates[0];
  for (const { value } of particleStyles.filter(({ value }) => !['auto', 'none'].includes(value))) {
    const particles = layoutParticles({ ...template, particleStyle: value }, art, schedule, 1920, 1080);
    assert.ok(particles.length > 0);
    variants.add(particles.map(({ kind }) => kind).join(','));
  }
  assert.equal(variants.size, 6);
  assert.deepEqual(layoutParticles({ ...template, particleStyle: 'none' }, art, schedule, 1920, 1080), []);
});

test('decorations stay inside the wallpaper and outside the timetable at either corner', () => {
  for (const [width, height] of [[1080, 2400], [1920, 2560], [1920, 1440], [1920, 1080]]) {
    const schedule = { x: 120, y: 240, width: width - 240, height: height - 800 };
    for (const x of [0, width - 500]) for (const template of mascotTemplates) {
      const particles = layoutParticles(template, { x, y: height - 500, width: 500, height: 500 }, schedule, width, height);
      for (const p of particles) {
        const extent = p.size * 2;
        assert.ok(p.x - extent >= 0 && p.x + extent <= width);
        assert.ok(p.y - extent >= 0 && p.y + extent <= height);
        assert.ok(p.x + extent <= schedule.x || p.x - extent >= schedule.x + schedule.width || p.y + extent <= schedule.y || p.y - extent >= schedule.y + schedule.height);
      }
    }
  }
});
