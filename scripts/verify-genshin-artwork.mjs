// Verify source dimensions and render the real schedule pipeline for visual review.
import { createRequire } from 'node:module';
import { log } from 'node:console';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { genshinTemplates } from '../src/assets/genshinTemplates.js';
import { genshinBackgroundTemplates } from '../src/assets/genshinBackgroundTemplates.js';
import { deviceResolutions, templateSchedule } from '../src/assets/templates.js';
import { customizeWallpaperTemplate } from '../src/utils/wallpaperTheme.js';
import { drawWallpaper, drawSampleClock } from '../src/utils/canvasHelpers.js';
import { templateSchema } from '../shared/templateSchema.js';

const require = createRequire(import.meta.url);
const { createCanvas, loadImage, GlobalFonts } = require(require.resolve('@napi-rs/canvas', { paths: [process.argv[2]] }));
if (!GlobalFonts.registerFromPath('node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2', 'DM Sans Variable')) throw new Error('Project font unavailable.');
const backgrounds = process.argv[3] === 'backgrounds';
const namecards = process.argv[3] === 'namecards-2';
const namecardIds = namecards ? new Set(JSON.parse(await readFile('documentation/genshin-namecards-2/prompts-and-sources.json', 'utf8')).assets.map(asset => asset.id)) : null;
const templates = namecards ? genshinBackgroundTemplates.filter(template => namecardIds.has(template.id)) : backgrounds ? genshinBackgroundTemplates : genshinTemplates;
const output = namecards ? 'output/genshin-namecards-2' : backgrounds ? 'output/genshin-backgrounds' : 'output/genshin';
await mkdir(`${output}/qa`, { recursive: true });
const dense = { classes: Array.from({ length: 3 }, (_, index) => ({
  subject: ['Mathematics', 'Computer Science', 'Literature'][index], courseCode: `CLASS ${101 + index}`,
  meetings: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({ day, startTime: '08:00', endTime: '09:30', room: 'Room 101' })),
})) };
const assets = [], renders = [];
for (const original of templates) {
  templateSchema.parse({ ...original, status: 'published' });
  for (const resolution of Object.values(deviceResolutions)) {
    const source = `public${original.deviceImages[resolution.id]}`;
    const bytes = await readFile(source);
    const image = await loadImage(bytes);
    const dimensionsValid = image.width === resolution.width && image.height === resolution.height;
    if (!dimensionsValid) throw new Error(`Invalid dimensions: ${source}`);
    const opacityCanvas = createCanvas(image.width, image.height);
    const opacityContext = opacityCanvas.getContext('2d');
    opacityContext.drawImage(image, 0, 0);
    const pixels = opacityContext.getImageData(0, 0, image.width, image.height).data;
    let opaque = true;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] !== 255) { opaque = false; break; }
    if (!opaque) throw new Error(`Nonopaque background: ${source}`);
    assets.push({ id: original.id, device: resolution.id, path: source, width: image.width, height: image.height, dimensionsValid, opaque, sha256: createHash('sha256').update(bytes).digest('hex') });
    for (const [kind, schedule] of [['sample', templateSchedule], ['dense', dense]]) {
      const canvas = createCanvas(resolution.width, resolution.height);
      canvas.ownerDocument = { createElement: () => createCanvas(1, 1) };
      const native = canvas.getContext('2d');
      const text = [];
      const context = new Proxy(native, {
        get(target, key) {
          if (key === 'fillText') return (...args) => { text.push(args[0]); return target.fillText(...args); };
          const value = Reflect.get(target, key);
          return typeof value === 'function' ? value.bind(target) : value;
        },
        set(target, key, value) {
          if (key === 'font') value = value.replace(/^(italic )?(\d{3}) /, (_, italic = '', weight) => `${italic}${Math.round(Number(weight) / 100) * 100} `);
          return Reflect.set(target, key, value);
        },
      });
      canvas.getContext = () => context;
      const template = { ...customizeWallpaperTemplate(original, {}, resolution.id), device: resolution.id };
      const layout = drawWallpaper(canvas, { schedule, template, resolution, backgroundImage: image });
      const sampleClockShown = kind === 'sample' && resolution.id !== 'laptop';
      if (sampleClockShown) drawSampleClock(canvas, template);
      if (!text.includes('Class Schedule')) throw new Error(`Missing heading: ${original.id}`);
      if (kind === 'sample' && layout.overflow) throw new Error(`Sample overflow: ${original.id}/${resolution.id}`);
      const path = `${output}/qa/${original.id}-${resolution.id}-${kind}.png`;
      await writeFile(path, canvas.toBuffer('image/png'));
      renders.push({ id: original.id, device: resolution.id, kind, path, overflow: layout.overflow, scheduleBounds: layout.scheduleBounds, meetings: layout.plans.reduce((sum, plan) => sum + plan.entries.length, 0), headingShown: true, sampleClockShown });
    }
  }
}
const expectedCount = templates.length * 3;
if (assets.length !== expectedCount || new Set(assets.map(asset => asset.sha256)).size !== expectedCount) throw new Error(`Expected ${expectedCount} unique assets.`);
await writeFile(`${output}/manifest.json`, JSON.stringify({ generatedAt: new Date().toISOString(), provider: 'built-in imagegen', assetCount: assets.length, assets }, null, 2) + '\n');
await writeFile(`${output}/render-report.json`, JSON.stringify({ backend: 'Native Canvas with project font; non-hundred CSS weights approximated for QA', renders }, null, 2) + '\n');
log(`Verified ${assets.length} unique opaque device images and ${renders.length} schedule previews.`);
