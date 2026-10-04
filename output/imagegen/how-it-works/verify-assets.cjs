const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  try {
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
      const section = page.locator('#how-it-works');
      await section.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => [...document.querySelectorAll('#how-it-works img')].every((image) => image.complete && image.naturalWidth > 0));
      const metrics = await page.evaluate(() => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        columns: getComputedStyle(document.querySelector('.how-it-works-steps')).gridTemplateColumns,
        images: [...document.querySelectorAll('#how-it-works img')].map((image) => ({ src: image.getAttribute('src'), width: image.naturalWidth, height: image.naturalHeight })),
      }));
      // Exclude the sticky navigation overlay from the isolated section capture.
      await section.screenshot({ path: path.join(__dirname, `${name}-final.png`), animations: 'disabled', style: '.site-header { visibility: hidden !important; }' });
      if (metrics.documentWidth > metrics.viewport || errors.length) throw new Error(JSON.stringify({ name, metrics, errors }));
      results.push({ name, ...metrics, errors });
      await page.close();
    }
    fs.writeFileSync(path.join(__dirname, 'verification.json'), `${JSON.stringify(results, null, 2)}\n`);
    console.log(JSON.stringify(results));
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
