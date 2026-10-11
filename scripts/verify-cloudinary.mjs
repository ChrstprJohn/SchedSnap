/* global fetch, AbortSignal, console */
import { stat } from 'node:fs/promises';
import { URL } from 'node:url';
import { cloudinaryAssetUrl } from '../src/utils/cloudinaryAssets.js';
import manifest from '../src/assets/cloudinaryManifest.js';

const samples = ['/wallpapers/scenic/blue-contours/mobile.png', '/wallpapers/mascots/bear.png',
  '/wallpapers/scenic/amber-canyon/mobile.png'];
for (const path of samples) {
  if (!manifest[path]) throw new Error(`Missing uploaded sample: ${path}`);
  const original = (await stat(new URL(`../public${path}`, import.meta.url))).size;
  const preview = await fetch(cloudinaryAssetUrl(path, { width: 540, height: 1200 }), {
    headers: { Accept: 'image/webp', Origin: 'https://schedsnap.example' },
    signal: AbortSignal.timeout(60_000),
  });
  if (!preview.ok || !preview.headers.get('content-type')?.startsWith('image/')) {
    throw new Error(`Preview delivery failed for ${path} (${preview.status}).`);
  }
  if (preview.headers.get('access-control-allow-origin') !== '*') throw new Error(`Missing canvas CORS for ${path}.`);
  const bytes = (await preview.arrayBuffer()).byteLength;
  const output = await fetch(cloudinaryAssetUrl(path, { width: 1080, height: 2400 }), {
    headers: { Origin: 'https://schedsnap.example' }, signal: AbortSignal.timeout(60_000),
  });
  if (!output.ok || !output.headers.get('content-type')?.startsWith('image/png')
      || output.headers.get('access-control-allow-origin') !== '*') throw new Error(`PNG delivery failed for ${path}.`);
  await output.arrayBuffer();
  console.log(`${path}: preview ${Math.round(bytes / 1024)} KB vs original ${Math.round(original / 1024)} KB (${Math.round((1 - bytes / original) * 100)}% smaller); PNG and CORS OK.`);
}
