/* global __dirname, process, console */
// Run after imagegen saves device-specific compositions. This only standardizes
// export pixels; it refuses square sources or the wrong device aspect ratio.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.SCHEDSNAP_NODE_PACKAGES
  ? path.join(process.env.SCHEDSNAP_NODE_PACKAGES, 'sharp')
  : 'C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(__dirname, '..');
const devices = { mobile: [1080, 2400], tablet: [1536, 2048], laptop: [1920, 1080] };
const manifests = ['scenic-root.json', 'scenic-blue.json', 'scenic-meadow.json', 'scenic-moon.json'];
async function main() {
  const templates = manifests.flatMap((name) => {
    const file = path.join(root, 'documentation', name);
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  });
  const issues = [], ready = [];
  for (const template of templates) {
    let complete = true;
    for (const [device, [width, height]] of Object.entries(devices)) {
      const file = path.join(root, 'public', 'wallpapers', 'scenic', template.id, `${device}.png`);
      if (!fs.existsSync(file)) { complete = false; issues.push(`${template.id}/${device}: missing`); continue; }
      const metadata = await sharp(file).metadata();
      if (Math.abs(metadata.width / metadata.height / (width / height) - 1) > 0.03) {
        complete = false; issues.push(`${template.id}/${device}: wrong aspect ${metadata.width}x${metadata.height}`); continue;
      }
      if (metadata.width !== width || metadata.height !== height) {
        if (!process.argv.includes('--normalize')) { complete = false; issues.push(`${template.id}/${device}: needs pixel normalization`); continue; }
        const buffer = await sharp(file).resize(width, height, { fit: 'fill' }).png().toBuffer();
        fs.writeFileSync(file, buffer);
      }
    }
    if (complete) ready.push({ ...template, collection: 'scenic', image: `/wallpapers/scenic/${template.id}/mobile.png`,
      deviceImages: Object.fromEntries(Object.keys(devices).map((device) => [device, `/wallpapers/scenic/${template.id}/${device}.png`])) });
  }
  if (process.argv.includes('--assemble')) {
    if (!process.argv.includes('--partial') && (issues.length || ready.length !== 55)) throw new Error(`Cannot assemble incomplete collection (${ready.length}/55 ready):\n${issues.join('\n')}`);
    if (new Set(ready.map((t) => t.id)).size !== ready.length) throw new Error('Duplicate template IDs');
    fs.writeFileSync(path.join(root, 'src/assets/scenicTemplates.js'),
      '// Original device-specific artwork; Canvas renders all student data separately.\nexport const scenicTemplates = ' + JSON.stringify(ready, null, 2) + ';\n');
  }
  console.log(JSON.stringify({ templates: templates.length, ready: ready.length, issues }, null, 2));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
