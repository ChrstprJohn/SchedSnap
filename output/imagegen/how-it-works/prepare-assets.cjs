const fs = require('node:fs');
const path = require('node:path');
const sharp = require('C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

async function main() {
  for (const [name, width, height] of [['choose-design', 768, 512], ['download-wallpaper', 768, 720]]) {
    const input = path.join(__dirname, `${name}-actual.png`);
    if (!fs.existsSync(input)) continue;
    const output = path.resolve(__dirname, `../../../public/images/how-it-works/${name}.webp`);
    const previous = path.join(__dirname, `${name}-previous.webp`);
    if (!fs.existsSync(previous)) fs.copyFileSync(output, previous);
    // Only encode/scale generated output; preserve its transparency and artwork.
    await sharp(input).resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(output);
    const metadata = await sharp(output).metadata();
    console.log(JSON.stringify({ output, width: metadata.width, height: metadata.height, alpha: metadata.hasAlpha, bytes: fs.statSync(output).size }));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
