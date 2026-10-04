const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    const references = await page.evaluate(async () => {
      const { wallpaperTemplates, mobileResolution } = await import('/src/assets/templates.js');
      const { sampleSchedule } = await import('/src/assets/sampleSchedule.js');
      const { drawWallpaper } = await import('/src/utils/canvasHelpers.js');
      const { prepareWallpaperAssets } = await import('/src/utils/wallpaperAssets.js');
      const references = [];
      for (const id of ['notebook-hours', 'check-study', 'mascot-bear']) {
        const template = wallpaperTemplates.find((item) => item.id === id);
        const canvas = document.createElement('canvas');
        const backgroundImage = await prepareWallpaperAssets(template);
        const result = drawWallpaper(canvas, { schedule: sampleSchedule, template, resolution: mobileResolution, backgroundImage });
        if (result.overflow) throw new Error(`${id} reference overflows`);
        references.push({ id, data: canvas.toDataURL('image/png').split(',')[1] });
      }
      return references;
    });
    for (const { id, data } of references) {
      const output = path.join(__dirname, `${id}-actual.png`);
      fs.writeFileSync(output, Buffer.from(data, 'base64'));
      console.log(output);
    }
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
