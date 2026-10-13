import { chromium } from 'file:///C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { seedCatalog } from '../server/catalogStore.js';
const base = process.env.VERIFY_URL || 'http://127.0.0.1:5187';
const dir = 'documentation/previews/free-placement';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results = [];
try {
  for (const device of ['mobile', 'tablet', 'laptop']) {
    const page = await browser.newPage({ viewport: { width: device === 'mobile' ? 390 : 1440, height: 900 } });
    if (!process.env.VERIFY_URL) await page.route('**/api/catalog', route => route.fulfill({ json: seedCatalog() }));
    await page.addInitScript(() => {
      window.scheduleRenders = [];
      const text = CanvasRenderingContext2D.prototype.fillText;
      const rect = CanvasRenderingContext2D.prototype.roundRect;
      CanvasRenderingContext2D.prototype.fillText = function (value, x, y, ...args) {
        if (value === 'Class Schedule') {
          const m = this.getTransform();
          this.canvas.dataset.headingX = String(m.a * x + m.c * y + m.e);
          this.canvas.dataset.headingY = String(m.b * x + m.d * y + m.f);
          this.canvas.dataset.headingSize = String(Number(this.font.match(/([\d.]+)px/)?.[1]) * Math.abs(m.a));
          window.scheduleRenders.push({ width: this.canvas.width, height: this.canvas.height, x: Number(this.canvas.dataset.headingX), y: Number(this.canvas.dataset.headingY) });
        }
        return text.call(this, value, x, y, ...args);
      };
      CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, ...args) {
        if (width > 500) this.canvas.dataset.cardWidth = String(width * Math.abs(this.getTransform().a));
        return rect.call(this, x, y, width, height, ...args);
      };
    });
    await page.goto(`${base}/services/schedule-wallpaper/onepiece-sunny-wake?device=${device}`);
    const cookies = page.getByRole('button', { name: 'Reject cookies', exact: true });
    if (await cookies.count()) await cookies.click();
    await page.getByRole('button', { name: 'Try a sample', exact: true }).click();
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await page.getByText('Customize appearance', { exact: true }).click();
    const canvas = page.locator('.flow-preview-art canvas');
    const read = () => canvas.evaluate(c => ({ x: Number(c.dataset.headingX), y: Number(c.dataset.headingY), size: Number(c.dataset.headingSize), cardWidth: Number(c.dataset.cardWidth), width: c.width, height: c.height }));
    await page.waitForFunction(() => document.querySelector('.flow-preview-art canvas')?.getAttribute('aria-busy') === 'false');
    const before = await read();
    if (!Number.isFinite(before.x)) throw Error('Preview failed before movement: ' + JSON.stringify(await page.getByRole('alert').allTextContents()));
    for (const [axis, coordinate] of [['horizontal', 'x'], ['vertical', 'y']]) {
      for (const value of [-70, 70, 0]) {
        await page.locator(`#schedule-${axis}-position`).fill(String(value));
        await page.locator(`#schedule-${axis}-position`).dispatchEvent('input');
        await page.waitForFunction(({ coordinate, before, value }) => {
          const c = document.querySelector('.flow-preview-art canvas');
          const current = Number(c?.dataset[coordinate === 'x' ? 'headingX' : 'headingY']);
          return c?.getAttribute('aria-busy') === 'false' && (value < 0 ? current < before - 1 : value > 0 ? current > before + 1 : Math.abs(current - before) < 0.01);
        }, { coordinate, before: before[coordinate], value });
        const after = await read();
        assert.ok(Math.abs(after.size - before.size) < 0.01, 'Font size changed');
        assert.ok(Math.abs(after.cardWidth - before.cardWidth) < 0.01, 'Card width changed');
        results.push({ device, axis, value, before, after });
      }
    }
    if (device === 'tablet') {
      const defaultWidth = await canvas.evaluate(c => c.getBoundingClientRect().width);
      assert.ok(defaultWidth >= 400, 'Default desktop tablet preview too small');
      await page.getByRole('button', { name: 'Increase preview size', exact: true }).click();
      const largeWidth = await canvas.evaluate(c => c.getBoundingClientRect().width);
      assert.ok(largeWidth >= defaultWidth);
      await page.getByRole('button', { name: 'Decrease preview size', exact: true }).click();
      results.push({ device, defaultWidth, largeWidth });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${dir}/${device}.png`, fullPage: true });
    await page.locator('#schedule-horizontal-position').fill('40');
    await page.locator('#schedule-horizontal-position').dispatchEvent('input');
    await page.locator('#schedule-vertical-position').fill('-40');
    await page.locator('#schedule-vertical-position').dispatchEvent('input');
    await page.waitForFunction(() => document.querySelector('.flow-preview-art canvas')?.getAttribute('aria-busy') === 'false');
    const moved = await read();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download wallpaper', exact: true }).click();
    await download;
    const exported = await page.evaluate(() => window.scheduleRenders.at(-1));
    assert.ok(Math.abs(exported.x / exported.width - moved.x / moved.width) < 0.001);
    assert.ok(Math.abs(exported.y / exported.height - moved.y / moved.height) < 0.001);
    results.push({ device, exportMatchesPreview: true });
    await page.close();
  }
  await writeFile('documentation/FREE_PLACEMENT_VALIDATION.json', JSON.stringify({ checkedAt: new Date().toISOString(), base, results }, null, 2) + '\n');
  console.log('Verified four-way movement without resizing on mobile/tablet/laptop, exported positions, and larger tablet preview.');
} finally { await browser.close(); }
