import { chromium } from 'file:///C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import { onepieceAdventureTemplates as templates } from '../src/assets/onepieceAdventureTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
const base = 'https://schedsnap.chrbuilds.dev';
const destination = 'documentation/previews/onepiece-adventure';
const report = { checkedAt: new Date().toISOString(), website: base, assets: [], devices: [] };
const catalogResponse = await fetch(`${base}/api/catalog`);
if (!catalogResponse.ok) throw Error('Live catalog failed');
const catalog = await catalogResponse.json();
for (const template of templates) {
  const live = catalog.templates.filter(item => item.id === template.id);
  if (live.length !== 1 || live[0].collection !== 'onepiece') throw Error('Missing or duplicated live design: ' + template.id);
  for (const [device, path] of Object.entries(template.deviceImages)) {
    const asset = manifest[path];
    const response = await fetch(asset.url);
    if (!response.ok) throw Error('Image failed: ' + asset.url);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.readUInt32BE(16) !== asset.width || bytes.readUInt32BE(20) !== asset.height) throw Error('Uploaded size mismatch: ' + path);
    report.assets.push({ id: template.id, device, url: asset.url, width: asset.width, height: asset.height, cors: response.headers.get('access-control-allow-origin') });
  }
}
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  for (const [device, viewport] of [['mobile', { width: 390, height: 844 }], ['tablet', { width: 820, height: 1180 }], ['laptop', { width: 1440, height: 1000 }]]) {
    const page = await browser.newPage({ viewport });
    await page.goto(`${base}/services/schedule-wallpaper?collection=onepiece&device=${device}`);
    const rejectCookies = page.getByRole('button', { name: 'Reject cookies', exact: true });
    if (await rejectCookies.count()) await rejectCookies.click();
    const filter = page.getByRole('button', { name: 'Onepiece', exact: true });
    if (await filter.getAttribute('aria-pressed') !== 'true') throw Error('Onepiece filter not selected');
    const result = { device, designs: [] };
    for (const template of templates) {
      const button = page.getByRole('button', { name: new RegExp(`^Preview ${template.name}(, New design)?$`) });
      await button.scrollIntoViewIfNeeded();
      const canvas = button.locator('canvas');
      await canvas.waitFor();
      await page.waitForFunction(name => {
        const button = [...document.querySelectorAll('.template-option')].find(item => item.getAttribute('aria-label')?.startsWith('Preview ' + name));
        return button?.querySelector('canvas')?.getAttribute('aria-busy') === 'false';
      }, template.name);
      if (!(await button.getAttribute('aria-label')).includes('New design')) throw Error('New badge missing: ' + template.id);
      await button.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      await page.waitForFunction(() => document.querySelector('dialog[open] canvas')?.getAttribute('aria-busy') === 'false');
      if (await dialog.getByRole('alert').count()) throw Error('Preview failure: ' + template.id);
      result.designs.push({ id: template.id, newBadge: true, previewLoaded: true });
      await page.getByRole('button', { name: 'Close design preview', exact: true }).click();
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${destination}/live-gallery-${device}.png`, fullPage: true });
    report.devices.push(result);
    await page.close();
  }
} finally { await browser.close(); }
await writeFile('documentation/ONEPIECE_ADVENTURE_LIVE_VALIDATION.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Verified ${report.assets.length} exact-size live PNGs and ${report.devices.reduce((n, d) => n + d.designs.length, 0)} working previews across three devices.`);
