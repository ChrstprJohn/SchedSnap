import { createDesignDownloads } from '../server/designDownloads.js';
import { createDesignLikes } from '../server/designLikes.js';
import { sameOrigin, isAuthenticated } from '../server/adminAuth.js';
import { cloudConfigured, createCatalogStore, seedCatalog } from '../server/catalogStore.js';

export function createDownloadsHandler({ env = process.env, store = createCatalogStore(env), downloads = createDesignDownloads({ env }), limiter = createDesignLikes({ env }) } = {}) {
  return async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    const fail = (status, message) => response.status(status).json({ error: { message } });
    if (!['GET', 'POST'].includes(request.method)) return fail(405, 'Method not allowed.');
    try {
      if (request.method === 'POST') {
        if (!sameOrigin(request)) return fail(403, 'Download from the SchedSnap page.');
        if (!request.headers?.['content-type']?.startsWith('application/json')) return fail(415, 'Send JSON.');
        if (!request.body || typeof request.body.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,127}$/i.test(request.body.id) || JSON.stringify(request.body).length > 1024) return fail(400, 'Choose a valid design.');
        if (!await limiter.allow(request)) { response.setHeader('Retry-After', '60'); return fail(429, 'Too many downloads. Try again in a minute.'); }
      }
      const catalog = cloudConfigured(env) ? await store.read() : seedCatalog();
      const admin = request.method === 'GET' && isAuthenticated(request, env, Date.now());
      const ids = catalog.templates.filter(t => admin || t.status === 'published').map(t => t.id);
      if (request.method === 'GET') return response.status(200).json({ downloads: await downloads.read(ids) });
      if (!ids.includes(request.body.id)) return fail(404, 'This design is no longer available.');
      return response.status(200).json({ id: request.body.id, count: await downloads.record(request.body.id) });
    } catch { return fail(503, 'Download counts are temporarily unavailable.'); }
  };
}

export default createDownloadsHandler();
