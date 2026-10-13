import manifest from '../src/assets/cloudinaryManifest.js';
import { signCloud } from './catalogStore.js';
import { generatedMasterId, generatedMasterUrl, generatedBackgroundUrl } from '../shared/generatedArtwork.js';

export function artworkIds(template, env) {
  return [...new Set([template.image, ...Object.values(template.deviceImages || {})].filter(Boolean).map(path => {
    if (path.startsWith('/')) {
      const asset = manifest[path];
      if (!asset || asset.cloud !== env.CLOUDINARY_CLOUD_NAME) return `local:${path}`;
      return asset.publicId;
    }
    const url = new URL(path);
    if (url.origin !== 'https://res.cloudinary.com') throw new Error('Unexpected artwork host.');
    const prefix = `/${env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
    if (!url.pathname.startsWith(prefix)) throw new Error('Artwork belongs to another account.');
    const id = url.pathname.slice(prefix.length).replace(/^v\d+\//, '').replace(/\.(png|jpg|webp)$/i, '');
    if (!/^schedsnap\/admin\/artwork\/[a-z0-9_-]+$/i.test(id) && !(generatedMasterId.test(id) && generatedMasterUrl.test(path)) && !generatedBackgroundUrl.test(path)) throw new Error('Unexpected artwork identifier.');
    return id;
  }))];
}
export function createArtworkDeleter(env, fetcher = fetch) {
  return async publicId => {
    if (!/^schedsnap\/wallpapers\/[a-z0-9/_-]+$/i.test(publicId) && !/^schedsnap\/admin\/artwork\/[a-z0-9_-]+$/i.test(publicId) && !generatedMasterId.test(publicId)) throw new Error('Deletion outside wallpaper library is forbidden.');
    const parameters = { public_id: publicId, invalidate: 'true', timestamp: String(Math.floor(Date.now() / 1000)) };
    const body = new URLSearchParams({ ...parameters, api_key: env.CLOUDINARY_API_KEY, signature: signCloud(parameters, env) });
    const response = await fetcher(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`, { method: 'POST', body, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Artwork deletion failed.');
    const result = await response.json();
    if (!['ok', 'not found'].includes(result.result)) throw new Error('Artwork deletion was not confirmed.');
  };
}
