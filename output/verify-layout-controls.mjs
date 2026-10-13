import { chromium } from 'file:///C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { seedCatalog } from '../server/catalogStore.js';
const base = process.env.VERIFY_URL || 'http://127.0.0.1:5186';
const dir = 'documentation/previews/layout-controls';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const report = [];
try {
  const context = await browser.newContext();
  let page = await context.newPage();
  if (!process.env.VERIFY_URL) {
    await context.route('**/api/catalog', route => route.fulfill({ json: seedCatalog() }));
    await context.route('**/api/likes', route => route.fulfill({ json: { likes: {}, identified: false } }));
    await context.route('**/api/visits', route => route.fulfill({ json: { count: 0 } }));
  }
  for (const width of [320, 390, 820, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${base}/services/schedule-wallpaper?device=tablet&collection=onepiece`);
    const cookie = page.getByRole('button', { name: 'Reject cookies', exact: true });
    if (await cookie.count()) await cookie.click();
    await page.locator('.category-measurements').waitFor({ state: 'attached' });
    await page.waitForFunction(() => document.querySelector('.category-filters')?.children.length > 1);
    const metrics = await page.locator('.category-filters').evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth, page: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    assert.ok(metrics.scroll <= metrics.width + 1, JSON.stringify(metrics));
    assert.ok(metrics.page <= width + 1);
    const more = page.locator('summary[aria-label="More filters"]');
    if (await more.count()) {
      await more.click();
      if (width === 320 || width === 1440) {
        await page.waitForFunction(() => [...document.querySelectorAll('#template-gallery canvas')].filter(canvas => canvas.getBoundingClientRect().top < innerHeight + 400).every(canvas => canvas.getAttribute('aria-busy') === 'false'));
        await page.screenshot({ path: `${dir}/filters-${width}.png` });
      }
      const option = page.locator('.category-overflow button').last();
      const label = await option.innerText();
      await option.focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#template-gallery').getAttribute('aria-label'), `${label} gallery`);
      assert.equal(await page.locator('.category-more').getAttribute('open'), null);
      assert.equal(await page.evaluate(() => document.activeElement?.matches('summary[aria-label="More filters"]')), true);
    }
    report.push({ width, ...metrics, more: await more.count() > 0 });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/services/schedule-wallpaper?device=tablet&collection=onepiece`);
  await page.getByRole('button', { name: 'Preview Cumulus Meadow, New design', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('dialog[open] canvas')?.getAttribute('aria-busy') === 'false');
  await page.screenshot({ path: `${dir}/tablet-preview.png` });
  await page.getByRole('button', { name: 'Use this design', exact: true }).click();
  await page.getByRole('button', { name: 'Try a sample', exact: true }).click();
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await page.getByText('Customize appearance', { exact: true }).click();
  assert.equal(await page.locator('#schedule-position').inputValue(), 'center');
  assert.equal(await page.locator('#container-style').inputValue(), 'glass');
  await page.getByRole('checkbox', { name: 'Left margin', exact: true }).check();
  await page.locator('#schedule-left-margin').fill('10');
  await page.locator('#schedule-left-margin').dispatchEvent('input');
  await page.getByRole('checkbox', { name: 'Right margin', exact: true }).check();
  await page.locator('#schedule-right-margin').fill('5');
  await page.locator('#schedule-right-margin').dispatchEvent('input');
  await page.screenshot({ path: `${dir}/tablet-controls.png`, fullPage: true });
  await page.close();
  page = await context.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/services/schedule-wallpaper/onepiece-cumulus-meadow?device=mobile`);
  const restore = page.getByRole('button', { name: /Discard/ });
  if (await restore.count()) await restore.click();
  await page.getByRole('button', { name: 'Try a sample', exact: true }).click();
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await page.getByText('Customize appearance', { exact: true }).click();
  await page.locator('#schedule-bottom-margin').fill('5');
  await page.locator('#schedule-bottom-margin').dispatchEvent('input');
  await page.waitForFunction(() => document.querySelector('.flow-preview-art canvas')?.getAttribute('aria-busy') === 'false');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${dir}/mobile-controls.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  assert.equal(await page.getByText('No account needed.', { exact: true }).count(), 0);
  assert.equal(await page.getByRole('link', { name: 'How to make a class schedule wallpaper', exact: true }).count(), 0);
  assert.equal(await page.locator('.hero-description').innerText(), 'Turn your class schedule into a phone wallpaper.');
  await page.screenshot({ path: `${dir}/landing-desktop.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${dir}/landing-mobile.png` });
  await writeFile('documentation/LAYOUT_CONTROLS_VALIDATION.json', JSON.stringify({ checkedAt: new Date().toISOString(), base, filters: report, tablet: { position: 'center', cards: 'glass', sideControls: true }, mobileBottomControl: true, landingCopy: true }, null, 2));
  console.log('Verified filter overflow at five widths, portrait tablet defaults, margin controls, and landing copy.');
} finally { await browser.close(); }
