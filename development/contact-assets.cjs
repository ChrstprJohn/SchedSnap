/* global __dirname, process, console */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
async function main() {
  const root = path.resolve(__dirname, '..');
  const data = ['root', 'blue'].flatMap((name) => JSON.parse(fs.readFileSync(path.join(root, `documentation/scenic-${name}.json`))));
  const layers = [];
  for (let i = 0; i < data.length; i++) {
    const x = (i % 5) * 220, y = Math.floor(i / 5) * 320;
    const buffer = await sharp(path.join(root, `public/wallpapers/scenic/${data[i].id}/tablet.png`)).resize(210, 280, { fit: 'inside' }).png().toBuffer();
    layers.push({ input: buffer, left: x + 5, top: y + 30 });
    layers.push({ input: Buffer.from(`<svg width="220" height="25"><text x="5" y="17" font-size="12">${data[i].id}</text></svg>`), left: x, top: y });
  }
  await sharp({ create: { width: 1100, height: 1600, channels: 3, background: '#eeeeee' } }).composite(layers).png().toFile(path.join(root, '.impeccable/review/scenic/tablet-before.png'));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
