import { createHash, randomUUID } from 'node:crypto';
import { wallpaperTemplates } from '../src/assets/templates.js';
import { galleryCategories } from '../src/config/collections.js';

const catalogId = 'schedsnap/admin/catalog.json';
export const seedCatalog = () => ({ revision: 'seed', categories: galleryCategories, templates: wallpaperTemplates.map(t => ({ ...t, status: 'published' })) });
export function cloudConfigured(env) {
  return /^[a-z0-9_-]+$/i.test(env.CLOUDINARY_CLOUD_NAME || '') && Boolean(env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}
export function signCloud(parameters, env) {
  return createHash('sha1').update(Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`).join('&') + env.CLOUDINARY_API_SECRET).digest('hex');
}
export function createCatalogStore(env, fetcher = fetch) {
  const cloud = env.CLOUDINARY_CLOUD_NAME;
  const base = `https://api.cloudinary.com/v1_1/${cloud}`;
  const headers = { Authorization: `Basic ${Buffer.from(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`).toString('base64')}` };
  let cached;
  let expires = 0;
  return {
    async read(fresh = false) {
      if (!cloudConfigured(env)) throw new Error('Cloudinary is not configured.');
      if (!fresh && cached && Date.now() < expires) return structuredClone(cached);
      // Public reads use delivery, not the rate-limited Admin API. Admin edits
      // resolve the latest version explicitly for revision checks.
      let path = catalogId;
      if (fresh) {
        const metadata = await fetcher(`${base}/resources/raw/authenticated/${encodeURIComponent(catalogId)}`, { headers, signal: AbortSignal.timeout(10000) });
        if (metadata.status === 404) return seedCatalog();
        if (!metadata.ok) throw new Error('Could not read the design catalog.');
        const asset = await metadata.json();
        if (!Number.isInteger(asset.version)) throw new Error('Invalid catalog metadata.');
        path = `v${asset.version}/${catalogId}`;
      }
      const signature = createHash('sha1').update(path + env.CLOUDINARY_API_SECRET).digest('base64url').slice(0, 8);
      const response = await fetcher(`https://res.cloudinary.com/${cloud}/raw/authenticated/s--${signature}--/${path}`, { signal: AbortSignal.timeout(10000) });
      if (!fresh && response.status === 404) return seedCatalog();
      if (!response.ok) throw new Error('Could not load the design catalog.');
      const catalog = await response.json();
      if (!Array.isArray(catalog.templates) || typeof catalog.revision !== 'string') throw new Error('Invalid catalog data.');
      cached = catalog; expires = Date.now() + 60000;
      return structuredClone(catalog);
    },
    async write(catalog) {
      const next = { ...catalog, categories: galleryCategories, revision: randomUUID() };
      const params = { public_id: catalogId, type: 'authenticated', overwrite: 'true', invalidate: 'true', timestamp: String(Math.floor(Date.now() / 1000)) };
      const body = new FormData();
      for (const [key, value] of Object.entries(params)) body.set(key, value);
      body.set('api_key', env.CLOUDINARY_API_KEY);
      body.set('signature', signCloud(params, env));
      body.set('file', new Blob([JSON.stringify(next)], { type: 'application/json' }), 'catalog.json');
      const response = await fetcher(`${base}/raw/upload`, { method: 'POST', body, signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error('Could not save the design catalog. Try again.');
      const result = await response.json();
      if (result.public_id !== catalogId || !result.version) throw new Error('Catalog save was not confirmed.');
      cached = next; expires = Date.now() + 60000;
      return next;
    },
  };
}
