/* global document, window, __dirname, console, getComputedStyle, process */
const { chromium } = require('C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['tablet', 768, 1024]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
      await page.locator('#how-it-works').scrollIntoViewIfNeeded();
      await page.locator('#how-it-works img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(__dirname, `${name}-section.png`) });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(__dirname, `${name}.png`), fullPage: true });
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('.landing-stats').offsetTop - 160, behavior: 'instant' }));
      await page.screenshot({ path: path.join(__dirname, `${name}-seam.png`) });
      console.log(JSON.stringify(await page.evaluate(({ name, errors }) => ({
        name, errors, overflow: document.documentElement.scrollWidth > window.innerWidth,
        sections: [...document.querySelectorAll('main > section')].map(section => section.id || section.className),
        stats: document.querySelector('.landing-stats').innerText,
        images: [...document.querySelectorAll('#how-it-works img')].map(image => ({ loaded: image.complete && image.naturalWidth > 0, src: image.getAttribute('src') })),
        heading: getComputedStyle(document.querySelector('.how-it-works-heading h2')).fontSize,
        stepColumns: getComputedStyle(document.querySelector('.how-it-works-steps')).gridTemplateColumns,
        statsBackground: getComputedStyle(document.querySelector('.landing-stats')).backgroundColor,
        howItWorksBackground: getComputedStyle(document.querySelector('.landing-how-it-works')).backgroundColor,
      }), { name, errors })));
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
