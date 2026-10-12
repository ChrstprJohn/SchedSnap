import { createDesignLikes } from '../server/designLikes.js';
import { sameOrigin } from '../server/adminAuth.js';
import { cloudConfigured, createCatalogStore, seedCatalog } from '../server/catalogStore.js';

export function createLikesHandler({ env = process.env, store = createCatalogStore(env), likes = createDesignLikes({ env }) } = {}) {
  return async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    const fail = (status, message) => response.status(status).json({ error: { message } });
    if (!['GET', 'POST'].includes(request.method)) return fail(405, 'Method not allowed.');
    try {
      const visitor = likes.identity(request);
      if (request.method === 'POST') {
        if (!sameOrigin(request)) return fail(403, 'Like designs from the SchedSnap page.');
        if (!request.headers?.['content-type']?.startsWith('application/json')) return fail(415, 'Send JSON.');
        const body = request.body;
        if (!body || typeof body !== 'object' || Array.isArray(body) || JSON.stringify(body).length > 1024) return fail(400, 'Invalid like request.');
        if (body.action !== 'identify' && (typeof body.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,127}$/i.test(body.id) || typeof body.liked !== 'boolean')) return fail(400, 'Choose a design to like.');
        if (!await likes.allow(request)) {
          response.setHeader('Retry-After', '60');
          return fail(429, 'Too many likes at once. Try again in a minute.');
        }
        if (body.action === 'identify') {
          if (!visitor) response.setHeader('Set-Cookie', likes.cookie());
          return response.status(200).json({ identified: Boolean(visitor) });
        }
        // Confirm the browser accepted the cookie before recording a vote.
        if (!visitor) return fail(428, 'Allow the cookie used to remember likes, then try again.');
      }
      const catalog = cloudConfigured(env) ? await store.read() : seedCatalog();
      const ids = catalog.templates.filter(t => t.status === 'published').map(t => t.id);
      if (request.method === 'GET') return response.status(200).json({ likes: await likes.read(ids, visitor, catalog.templates.map(t => t.id)), identified: Boolean(visitor) });
      const { id, liked } = request.body;
      if (!ids.includes(id)) return fail(404, 'This design is no longer available.');
      return response.status(200).json({ id, ...await likes.write(id, visitor, liked) });
    } catch {
      return fail(503, 'Likes are temporarily unavailable. Try again shortly.');
    }
  };
}

export default createLikesHandler();
