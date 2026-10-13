import { chromium } from 'file:///C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { onepieceAdventureTemplates as onepieceTemplates } from '../src/assets/onepieceAdventureTemplates.js';
import { seedCatalog } from '../server/catalogStore.js';
const destination = 'documentation/previews/onepiece-adventure';
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage();
  await page.route('**/api/catalog', route => route.fulfill({ json: seedCatalog() }));
  await page.route('**/api/likes', route => route.fulfill({ json: { likes: {}, identified: false } }));
  await page.goto('http://127.0.0.1:5185/wallpapers/mobile');
  for (const device of ['mobile', 'tablet', 'laptop']) {
    for (const template of onepieceTemplates) {
      const rendered = await page.evaluate(async ({ device, template }) => {
        const { deviceResolutions, templateSchedule } = await import('/src/assets/templates.js');
        const { drawWallpaper } = await import('/src/utils/canvasHelpers.js');
        const resolution = deviceResolutions[device];
        const art = await new Promise((resolve, reject) => {
          const image = new Image(); image.onload = () => resolve(image); image.onerror = reject;
          image.src = template.deviceImages[device];
        });
        await document.fonts.load('650 40px "DM Sans Variable"');
        const canvas = document.createElement('canvas');
        const preview = drawWallpaper(canvas, { schedule: templateSchedule, template, resolution, backgroundImage: art });
        if (preview.overflow) throw Error('Sample overflow: ' + template.id + '/' + device);
        const thumb = document.createElement('canvas');
        thumb.width = device === 'laptop' ? 480 : 270;
        thumb.height = Math.round(thumb.width * resolution.height / resolution.width);
        thumb.getContext('2d').drawImage(canvas, 0, 0, thumb.width, thumb.height);
        const data = thumb.toDataURL('image/png').split(',')[1];
        const dense = { classes: templateSchedule.classes.map(course => ({ ...course, meetings: [...course.meetings, { ...course.meetings[0], startTime: '10:00', endTime: '11:30' }] })) };
        const denseLayout = drawWallpaper(canvas, { schedule: dense, template, resolution, backgroundImage: art });
        const crowded = { classes: Array.from({ length: 200 }, (_, i) => ({ subject: `Class ${i}`, courseCode: 'LONG 101', meetings: [{ day: 'Monday', startTime: '08:00', endTime: '09:00', room: 'Room 101' }] })) };
        const crowdedLayout = drawWallpaper(canvas, { schedule: crowded, template, resolution, backgroundImage: art });
        if (!crowdedLayout.overflow) throw Error('Crowded export not blocked: ' + template.id + '/' + device);
        return { data, denseOverflow: denseLayout.overflow };
      }, { device, template });
      await writeFile(`${destination}/${template.id}-${device}.png`, Buffer.from(rendered.data, 'base64'));
      console.log(`${template.id}/${device}: sample fits; dense ${rendered.denseOverflow ? 'blocked' : 'fits'}; overcrowded blocked`);
    }
  }
  for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:5185/wallpapers/mobile');
    await page.getByRole('button', { name: 'Onepiece', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('#template-gallery canvas').length >= 10);
    await page.screenshot({ path: `${destination}/gallery-${name}.png`, fullPage: true });
  }
} finally { await browser.close(); }
