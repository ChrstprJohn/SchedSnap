import test from 'node:test';
import assert from 'node:assert/strict';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { templateSchedule, deviceResolutions } from '../src/assets/templates.js';
import { templateSchema } from '../shared/templateSchema.js';

function render(settings) {
  const fills = [], text = [], stops = [], images = [], stack = [];
  const target = { globalAlpha: 1, fillStyle: '',
    measureText: value => ({ width: value.length * 20 }),
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    createLinearGradient: () => ({ addColorStop: (offset, color) => stops.push(color) }),
    fill() { fills.push({ color: this.fillStyle, opacity: this.globalAlpha }); },
    fillRect() { fills.push({ color: this.fillStyle, opacity: this.globalAlpha }); },
    fillText() { text.push(this.globalAlpha); },
    drawImage() { images.push(this.globalAlpha); },
    save() { stack.push({ globalAlpha: this.globalAlpha, fillStyle: this.fillStyle }); },
    restore() { Object.assign(this, stack.pop()); },
  };
  const ctx = new Proxy(target, { get: (object, key) => key in object ? object[key] : () => {} });
  const canvas = { width: 1080, height: 2400, getContext: () => ctx };
  canvas.ownerDocument = { createElement: () => ({ getContext: () => ({ drawImage() {} }) }) };
  target.canvas = canvas;
  drawWallpaper(canvas, { schedule: templateSchedule, resolution: deviceResolutions[settings.device || 'mobile'], template: {
    background: '#223344', ink: '#ffffff', muted: '#ffffff', surface: '#123456', line: '#abcdef', ...settings,
  } });
  return { fills, text, stops, images };
}

test('glass respects the selected Fill color with light text', () => {
  const { stops } = render({ containerStyle: 'glass' });
  assert.ok(stops.includes('rgba(18,52,86,0.7)'));
  assert.ok(!stops.some(color => color.startsWith('rgba(34,51,68,')));
});

test('fill opacity affects backgrounds without fading text across layouts and finishes', () => {
  for (const containerStyle of ['glass', 'solid']) for (const [device, scheduleLayout] of [
    ['mobile', 'stacked'], ['mobile', 'timeline'], ['tablet', 'day-cards'], ['tablet', 'day-columns'], ['laptop', 'weekly'],
  ]) {
    const result = render({ containerStyle, containerOpacity: 25, device, scheduleLayout });
    assert.ok(result.fills.some(fill => fill.opacity === 0.25), `${containerStyle} ${scheduleLayout}`);
    assert.ok(result.text.every(opacity => opacity === 1), `${containerStyle} ${scheduleLayout} text`);
    for (const disabled of [{ containerOpacity: 0 }, { containerFill: false }]) {
      const clear = render({ containerStyle, device, scheduleLayout, ...disabled });
      assert.ok(!clear.fills.some(fill => fill.color === '#123456' && fill.opacity > 0));
      assert.equal(clear.images.length, 0);
      assert.ok(clear.text.every(opacity => opacity === 1));
    }
  }
});

test('fill opacity survives catalog validation and rejects invalid percentages', () => {
  const base = { id: 'fill-test', name: 'Fill test', status: 'draft', background: '#fff', ink: '#000', muted: '#000', surface: '#fff', line: '#000' };
  for (const containerOpacity of [0, 25, 100]) assert.equal(templateSchema.parse({ ...base, containerOpacity }).containerOpacity, containerOpacity);
  for (const containerOpacity of [-1, 101, NaN]) assert.equal(templateSchema.safeParse({ ...base, containerOpacity }).success, false);
});
