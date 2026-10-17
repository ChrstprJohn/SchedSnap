import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../src/assets/cloudinaryManifest.js';
import { genshinTemplates } from '../src/assets/genshinTemplates.js';
import { genshinBackgroundTemplates } from '../src/assets/genshinBackgroundTemplates.js';
import { sanrioTemplates } from '../src/assets/sanrioTemplates.js';
import { customizeWallpaperTemplate, galleryPreviewTemplate } from '../src/utils/wallpaperTheme.js';
import { galleryCategories, matchesGalleryCategory } from '../src/config/collections.js';
import { templateSchema } from '../shared/templateSchema.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { deviceResolutions, templateSchedule } from '../src/assets/templates.js';

const fixture = {
  id: 'genshin-test', name: 'Genshin test', collection: 'genshin', status: 'published',
  background: '#eef4ea', ink: '#324331', muted: '#536450', surface: '#ffffff80', line: '#32433130',
  image: '/wallpapers/scenic/genshin-test/mobile.png',
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/genshin-test/${device}.png`])),
  showScheduleTitle: true, artworkFooter: true, schedulePosition: 'left',
};

function render(template, resolution, schedule = templateSchedule) {
  const text = [];
  const textPositions = [];
  const context = {
    font: '', scale() {}, translate() {}, fillRect() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {},
    arc() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, save() {}, restore() {}, drawImage() {},
    createLinearGradient() { return { addColorStop() {} }; },
    measureText(value) { return { width: value.length * Number(this.font.match(/([\d.]+)px/)?.[1] || 36) * 0.52 }; },
    fillText(value, x, y) { text.push(value); textPositions.push({ value, x, y, color: this.fillStyle }); },
  };
  const layout = drawWallpaper({ getContext: () => context }, { schedule, template, resolution });
  return { text, textPositions, layout };
}

test('Genshin filter selects its own collection and schema preserves artwork settings', () => {
  assert.ok(galleryCategories.some(category => category.id === 'genshin' && category.name === 'Genshin'));
  assert.equal(matchesGalleryCategory(fixture, 'genshin'), true);
  assert.equal(matchesGalleryCategory(fixture, 'sanrio'), false);
  const parsed = templateSchema.parse(fixture);
  assert.equal(parsed.showScheduleTitle, true);
  assert.equal(parsed.artworkFooter, true);
});

test('every selectable Genshin design has Cloudinary PNG artwork for all three devices', () => {
  for (const template of genshinTemplates) {
    for (const resolution of Object.values(deviceResolutions)) {
      const asset = manifest[template.deviceImages[resolution.id]];
      assert.ok(asset, template.id);
      assert.match(asset.url, /^https:\/\/res\.cloudinary\.com\/.*\.png$/);
      assert.equal(asset.width, resolution.width, template.id);
      assert.equal(asset.height, resolution.height, template.id);
    }
  }
});

test('all Genshin wallpapers show the class schedule heading on every device', () => {
  for (const original of [...genshinTemplates, ...genshinBackgroundTemplates]) {
    for (const resolution of Object.values(deviceResolutions)) {
      const { text, textPositions, layout } = render({ ...original, deviceImages: fixture.deviceImages }, resolution);
      assert.ok(text.includes('Class Schedule'), `${original.id}/${resolution.id}`);
      assert.ok(text.includes('Subject name'), `${original.id}/${resolution.id}`);
      assert.equal(layout.overflow, false, `${original.id}/${resolution.id}`);
      if (resolution.id === 'mobile') {
        const heading = textPositions.find(item => item.value === 'Class Schedule');
        assert.ok(heading.y <= layout.plans[0].y - 40, `${original.id}: heading must stay above the first card`);
      }
      if (resolution.id !== 'laptop') {
        assert.ok(layout.scheduleBounds.y + layout.scheduleBounds.height <= resolution.height * 0.965 * (resolution.id === 'tablet' ? 1920 / resolution.width : 1), `${original.id}/${resolution.id}`);
      } else {
        assert.ok(layout.scheduleBounds.x + layout.scheduleBounds.width <= resolution.width * 0.72, original.id);
      }
    }
  }
});

test('crowded portrait schedules report overflow without dropping meetings', () => {
  const schedule = { classes: Array.from({ length: 100 }, (_, index) => ({
    subject: `Subject ${index}`, courseCode: 'CLASS 101',
    meetings: [{ day: 'Monday', startTime: '08:00', endTime: '09:30', room: 'Room 101' }],
  })) };
  for (const resolution of [deviceResolutions.mobile, deviceResolutions.tablet]) {
    const { text, layout } = render(fixture, resolution, schedule);
    assert.equal(layout.overflow, true, resolution.id);
    assert.ok(text.includes('Your schedule needs more room.'), resolution.id);
    assert.equal(text.includes('Subject 0'), false, resolution.id);
  }
});

test('Genshin mobile and tablet schedules use the standard wallpaper layout', () => {
  for (const resolution of [deviceResolutions.mobile, deviceResolutions.tablet]) {
    const standard = render(customizeWallpaperTemplate(galleryPreviewTemplate(sanrioTemplates[0]), {}, resolution.id), resolution).layout;
    const geometry = layout => layout.plans.map(({ y, width, height, timeX, subjectX }) => ({ y, width, height, timeX, subjectX }));
    for (const template of [...genshinTemplates, ...genshinBackgroundTemplates]) {
      const actual = render(customizeWallpaperTemplate(galleryPreviewTemplate({ ...template, artworkFooter: true }), {}, resolution.id), resolution).layout;
      assert.deepEqual(geometry(actual), geometry(standard), `${template.id}/${resolution.id}`);
      assert.deepEqual(actual.scheduleBounds, standard.scheduleBounds, `${template.id}/${resolution.id}`);
    }
  }
});

test('Navia uses a white heading and Varesa heading follows template ink or custom heading', () => {
  const navia = genshinBackgroundTemplates.find(item => item.family === 'navia');
  assert.equal(templateSchema.parse({ ...navia, status: 'published' }).headingInk, '#ffffff');
  for (const resolution of Object.values(deviceResolutions)) {
    const { textPositions } = render(navia, resolution);
    assert.equal(textPositions.find(item => item.value === 'Class Schedule').color, '#ffffff');
    assert.equal(textPositions.find(item => item.value === 'CLASS 101').color, navia.ink);
  }
  const varesa = genshinBackgroundTemplates.find(item => item.family === 'varesa');
  for (const resolution of Object.values(deviceResolutions)) {
    const { textPositions } = render(varesa, resolution);
    assert.equal(textPositions.find(item => item.value === 'Class Schedule').color, varesa.headingInk || varesa.ink);
    assert.equal(textPositions.find(item => item.value === 'CLASS 101').color, varesa.ink);
  }
});

test('Genshin glass defaults work with existing catalog records and respect explicit solid panels', () => {
  const existing = { ...genshinBackgroundTemplates[0], containerStyle: 'solid' };
  assert.equal(customizeWallpaperTemplate(existing, {}, 'mobile').containerStyle, 'glass');
  assert.equal(customizeWallpaperTemplate(existing, { containerStyle: 'solid' }, 'mobile').containerStyle, 'solid');
});

test('laptop alignment and dragging keep cards inside the screen', () => {
  for (const schedulePosition of ['left', 'center', 'right']) {
    for (const horizontalPosition of [-100, 0, 100]) {
      const { layout } = render({ ...fixture, schedulePosition, horizontalPosition }, deviceResolutions.laptop);
      assert.equal(layout.overflow, false);
      assert.ok(layout.scheduleBounds.x >= -0.001);
      assert.ok(layout.scheduleBounds.x + layout.scheduleBounds.width <= 1920 + 0.001);
    }
  }
});
