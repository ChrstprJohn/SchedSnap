// Render the actual SchedSnap Canvas pipeline against each generated artwork.
import { createRequire } from 'node:module';
import process from 'node:process';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { deviceResolutions, templateSchedule } from '../src/assets/templates.js';

const require = createRequire(import.meta.url);
const runtimeModules = process.argv[2];
if (!runtimeModules) throw new Error('Pass the bundled Node package directory as the first argument.');
const { createCanvas, loadImage, GlobalFonts } = require(require.resolve('@napi-rs/canvas', { paths: [runtimeModules] }));
if (!GlobalFonts.registerFromPath('node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2', 'DM Sans Variable')) {
  throw new Error('Could not load the project font; previews would not reflect the app.');
}
const directory = 'public/wallpapers/scenic';
const out = 'output/sanrio/qa';
await mkdir(out, { recursive: true });
const designs = (await readdir(directory, { withFileTypes: true })).filter(entry => entry.isDirectory() && entry.name.startsWith('sanrio-')).map(entry => entry.name).sort();
const dense = { classes: Array.from({ length: 3 }, (_, i) => ({
  courseCode: `CLASS ${101 + i}`, subject: ['Mathematics', 'Computer Science', 'Literature'][i],
  meetings: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({ day, startTime: `${String(8 + i * 3).padStart(2, '0')}:00`, endTime: `${String(9 + i * 3).padStart(2, '0')}:30`, room: `Room ${101 + i}` })),
})), warnings: [] };
const reports = [];
for (const id of designs) {
  for (const device of ['mobile', 'tablet', 'laptop']) {
    const resolution = deviceResolutions[device];
    let image;
    try { image = await loadImage(path.join(directory, id, `${device}.png`)); }
    catch (error) { reports.push({ id, device, missing: true, error: error.message }); continue; }
    const template = { id, background: '#fff5f8', ink: '#583b49', muted: '#755562', surface: 'rgba(255,255,255,0.96)', line: '#dcb8c6', containerShape: 'rounded', collection: 'scenic', image: `/wallpapers/scenic/${id}/${device}.png`, pixelArt: id.includes('pixel'), verticalPosition: -35, bottomMargin: device === 'laptop' ? 8 : 0 };
    for (const [name, schedule] of [['sample', templateSchedule], ['dense', dense]]) {
      const canvas = createCanvas(resolution.width, resolution.height);
      // This native Canvas parser treats non-hundred CSS weights (650/750)
      // as font sizes. Browser Canvas supports them. Approximate these weights
      // with the nearest hundred for QA while preserving app layout and sizes.
      const nativeContext = canvas.getContext('2d');
      const qaContext = new Proxy(nativeContext, {
        get(target, key) { const value = Reflect.get(target, key); return typeof value === 'function' ? value.bind(target) : value; },
        set(target, key, value) {
          if (key === 'font') value = value.replace(/^(italic )?(\d{3}) /, (_, italic = '', weight) => `${italic}${Math.round(Number(weight) / 100) * 100} `);
          return Reflect.set(target, key, value);
        },
      });
      canvas.getContext = () => qaContext;
      const layout = drawWallpaper(canvas, { schedule, template, resolution, backgroundImage: image });
      const preview = `${out}/${id}-${device}-${name}.png`;
      await writeFile(preview, canvas.toBuffer('image/png'));
      const bounds = layout.scheduleBounds;
      reports.push({ id, device, schedule: name, preview, width: canvas.width, height: canvas.height, overflow: layout.overflow, scheduleBounds: bounds, preservedMeetings: layout.plans?.reduce((count, plan) => count + (plan.entries?.length || plan.rows?.length || 0), 0), appearance: { verticalPosition: -35, bottomMargin: template.bottomMargin } });
    }
  }
}
await writeFile(`${out}/render-report.json`, JSON.stringify({ renderer: 'src/utils/canvasHelpers.js drawWallpaper', backend: '@napi-rs/canvas with project DM Sans, non-hundred CSS weights rounded to nearest hundred for backend compatibility; browser UI preview unavailable', schedules: { sample: 'one class per weekday', dense: 'three classes per weekday, 15 meetings' }, reports }, null, 2));
const missing = reports.filter(item => item.missing).length;
const overflow = reports.filter(item => item.overflow).length;
console.log(JSON.stringify({ designs: designs.length, renders: reports.length - missing, missing, overflow, report: `${out}/render-report.json` }));
if (missing || overflow) process.exitCode = 1;
