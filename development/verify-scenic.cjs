/* global __dirname, process, console, Buffer, document, innerWidth, setTimeout, clearTimeout */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, '.impeccable/review/scenic');
const baseUrl = process.env.SCHEDSNAP_VERIFY_URL || 'http://127.0.0.1:5173';
async function main() {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    // Long export audits must not navigate when Vite notices review artifacts.
    await page.routeWebSocket('**', (socket) => socket.close());
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const [device, viewport] of Object.entries({ mobile: { width: 390, height: 844 }, tablet: { width: 768, height: 1024 }, laptop: { width: 1440, height: 1000 } })) {
      await page.setViewportSize(viewport);
      await page.goto(`${baseUrl}/services/schedule-wallpaper?device=${device}&collection=scenic`, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Illustrated', exact: true }).click();
      await page.waitForTimeout(1000);
      const themes = page.getByRole('group', { name: 'Filter illustrated themes', exact: true });
      if (await themes.getByRole('button').count() !== 14) throw new Error(`Missing theme pills on ${device}`);
      const familyCounts = await page.evaluate(async () => {
        const { scenicTemplates } = await import('/src/assets/scenicTemplates.js');
        const { scenicFamilies } = await import('/src/config/collections.js');
        return scenicFamilies.map(({ id, name }) => ({ name, count: scenicTemplates.filter((item) => item.family === id).length }));
      });
      for (const family of familyCounts) {
        await themes.getByRole('button', { name: family.name, exact: true }).click();
        await page.waitForFunction((count) => document.querySelectorAll('#template-gallery > button').length === count, family.count);
      }
      await themes.getByRole('button', { name: 'All themes', exact: true }).click();
      await themes.locator('.template-category-list').evaluate((node) => { node.scrollLeft = 0; });
      await page.waitForTimeout(200); // Let the existing 160 ms selected-color transition settle.
      if (await page.locator('select').count()) throw new Error('Unexpected dropdown in gallery');
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Horizontal page overflow on ${device}`);
      await page.screenshot({ path: path.join(out, `gallery-${device}.png`) });
    }
    if (process.argv.includes('--gallery-only')) { console.log('Gallery: all 13 theme filters pass on all 3 devices.'); return; }
    const jobs = await page.evaluate(async () => {
      const { wallpaperTemplates, deviceResolutions } = await import('/src/assets/templates.js');
      return wallpaperTemplates.flatMap((template) => Object.values(deviceResolutions).map((resolution) => ({ id: template.id, resolution })));
    });
    const completed = new Array(jobs.length);
    let next = 0, done = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (next < jobs.length) {
        const index = next++;
        completed[index] = await page.evaluate(async ({ id, resolution }) => {
      const { wallpaperTemplates, mascotTemplateSchedule, templateSchedule } = await import('/src/assets/templates.js');
      const { sampleSchedule } = await import('/src/assets/sampleSchedule.js');
      const { drawWallpaper } = await import('/src/utils/canvasHelpers.js');
      const { prepareWallpaperAssets } = await import('/src/utils/wallpaperAssets.js');
        const template = wallpaperTemplates.find((item) => item.id === id);
        const scenic = template.collection === 'scenic';
        let timer;
        const image = await Promise.race([prepareWallpaperAssets(template, resolution), new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(`${id}/${resolution.id}: image load exceeded 90 seconds`)), 90000);
        })]).finally(() => clearTimeout(timer));
        if (scenic && (image.width !== resolution.width || image.height !== resolution.height)) throw new Error(`${id}/${resolution.id}: image pixel mismatch`);
        const canvas = document.createElement('canvas');
        const schedule = scenic ? sampleSchedule : template.layout === 'mascot' ? mascotTemplateSchedule : templateSchedule;
        const layout = drawWallpaper(canvas, { schedule, template, resolution, backgroundImage: image });
        if (layout.overflow) throw new Error(`${template.id}/${resolution.id}: schedule overflow`);
        if (!canvas.toDataURL('image/png').startsWith('data:image/png')) throw new Error(`${id}: PNG export failed`);
        const thumb = document.createElement('canvas');
        thumb.width = 280; thumb.height = Math.round(280 * resolution.height / resolution.width);
        thumb.getContext('2d').drawImage(canvas, 0, 0, thumb.width, thumb.height);
        return { id, family: template.family, scenic, device: resolution.id, width: canvas.width, height: canvas.height, overflow: layout.overflow, ...(scenic ? { png: thumb.toDataURL('image/png') } : {}) };
        }, jobs[index]);
        done++;
        fs.writeFileSync(path.join(out, 'render-progress.json'), JSON.stringify({ done, total: jobs.length, completed: completed.filter(Boolean).map(({ id, device }) => ({ id, device })) }));
        if (done % 15 === 0 || done === jobs.length) console.log(`Export verified ${done}/${jobs.length}: ${jobs[index].id}/${jobs[index].resolution.id}`);
      }
    }));
    const rendered = { scenic: completed.filter((item) => item.scenic), sharedRenders: completed.filter((item) => !item.scenic) };
    const scenicRendered = rendered.scenic;
    const families = [...new Set(scenicRendered.map((item) => item.family))];
    for (const family of families) {
      const items = scenicRendered.filter((item) => item.family === family);
      const rows = Math.ceil(items.length / 3), tileWidth = 310, tileHeight = 670;
      const layers = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i], x = (i % 3) * tileWidth, y = Math.floor(i / 3) * tileHeight;
        layers.push({ input: Buffer.from(item.png.split(',')[1], 'base64'), left: x + 15, top: y + 30 });
        const label = `<svg width="310" height="24"><text x="15" y="18" font-family="Arial" font-size="13" fill="#26354a">${item.id} / ${item.device}</text></svg>`;
        layers.push({ input: Buffer.from(label), left: x, top: y });
      }
      await sharp({ create: { width: tileWidth * 3, height: tileHeight * rows, channels: 3, background: '#edf0f3' } }).composite(layers).png().toFile(path.join(out, `${family}.png`));
    }
    const report = { templates: scenicRendered.length / 3, images: scenicRendered.length, families, errors, sharedRenders: rendered.sharedRenders, renders: scenicRendered.map(({ id, family, device, width, height, overflow }) => ({ id, family, device, width, height, overflow })) };
    fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify(report, null, 2));
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(JSON.stringify({ templates: report.templates, images: report.images, families: families.length, errors }));
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
