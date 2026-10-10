/* global __dirname, process, console, Buffer */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, '.impeccable/review/scenic');
async function main() {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const [device, viewport] of Object.entries({ mobile: { width: 390, height: 844 }, tablet: { width: 768, height: 1024 }, laptop: { width: 1440, height: 1000 } })) {
      await page.setViewportSize(viewport);
      await page.goto(`http://127.0.0.1:5173/services/schedule-wallpaper?device=${device}&collection=scenic`, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Illustrated', exact: true }).click();
      await page.waitForTimeout(1000);
      if (await page.locator('select').count()) throw new Error('Unexpected dropdown in gallery');
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Horizontal page overflow on ${device}`);
      await page.screenshot({ path: path.join(out, `gallery-${device}.png`) });
    }
    const rendered = await page.evaluate(async () => {
      const { scenicTemplates } = await import('/src/assets/scenicTemplates.js');
      const { deviceResolutions } = await import('/src/assets/templates.js');
      const { sampleSchedule } = await import('/src/assets/sampleSchedule.js');
      const { drawWallpaper } = await import('/src/utils/canvasHelpers.js');
      const { prepareWallpaperAssets } = await import('/src/utils/wallpaperAssets.js');
      const result = [];
      for (const template of scenicTemplates) for (const resolution of Object.values(deviceResolutions)) {
        const image = await prepareWallpaperAssets(template, resolution);
        if (image.width !== resolution.width || image.height !== resolution.height) throw new Error(`${template.id}/${resolution.id}: image pixel mismatch`);
        const canvas = document.createElement('canvas');
        const layout = drawWallpaper(canvas, { schedule: sampleSchedule, template, resolution, backgroundImage: image });
        if (layout.overflow) throw new Error(`${template.id}/${resolution.id}: schedule overflow`);
        const thumb = document.createElement('canvas');
        thumb.width = 280; thumb.height = Math.round(280 * resolution.height / resolution.width);
        thumb.getContext('2d').drawImage(canvas, 0, 0, thumb.width, thumb.height);
        result.push({ id: template.id, family: template.family, device: resolution.id, width: canvas.width, height: canvas.height, overflow: layout.overflow, png: thumb.toDataURL('image/png') });
      }
      return result;
    });
    const families = [...new Set(rendered.map((item) => item.family))];
    for (const family of families) {
      const items = rendered.filter((item) => item.family === family);
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
    const report = { templates: rendered.length / 3, images: rendered.length, families, errors, renders: rendered.map(({ png, ...item }) => item) };
    fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify(report, null, 2));
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(JSON.stringify({ templates: report.templates, images: report.images, families: families.length, errors }));
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
