import { randomUUID } from 'node:crypto';
import { authConfigured, createSession, isAuthenticated, sameOrigin, sessionCookie, verifyAdminPassword } from '../server/adminAuth.js';
import { cloudConfigured, createCatalogStore, signCloud } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';
import { wallpaperTemplates } from '../src/assets/templates.js';
import { generateDesignId } from '../shared/designId.js';
import { artworkIds, createArtworkDeleter } from '../server/deleteArtwork.js';

export function createAdminHandler({ env = process.env, store = createCatalogStore(env), now = () => Date.now(), destroyArtwork = createArtworkDeleter(env), resolveArtworkIds = template => artworkIds(template, env) } = {}) {
  const attempts = new Map();
  let saving = false;
  return async function admin(request, response) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    const fail = (status, message) => response.status(status).json({ error: { message } });
    if (!['GET', 'POST'].includes(request.method)) return fail(405, 'Method not allowed.');
    if (!authConfigured(env)) return fail(503, 'Set ADMIN_PASSWORD to at least 16 characters in the server environment, then restart or redeploy.');
    const action = new URL(request.url, 'http://localhost').searchParams.get('action') || 'session';
    if (request.method === 'GET') {
      const authenticated = isAuthenticated(request, env, now());
      if (action === 'session') return response.status(200).json({ authenticated });
      if (!authenticated) return fail(401, 'Sign in to manage designs.');
      if (action === 'dashboard') {
        const embedUrl = env.POSTHOG_DASHBOARD_EMBED_URL || '';
        if (!embedUrl) return response.status(200).json({ embedUrl: '' });
        try {
          const url = new URL(embedUrl);
          const isPostHogHost = url.hostname === 'posthog.com' || url.hostname.endsWith('.posthog.com');
          const isDashboardPath = url.pathname.startsWith('/embedded/') || url.pathname.startsWith('/shared/');
          if (url.protocol !== 'https:' || !isPostHogHost || !isDashboardPath) throw new Error('Invalid dashboard URL');
          return response.status(200).json({ embedUrl: url.href });
        } catch { return fail(503, 'Set a valid PostHog dashboard embed URL in the server environment.'); }
      }
      if (action !== 'catalog') return fail(404, 'Unknown action.');
      try { return response.status(200).json(await store.read(true)); }
      catch { return fail(503, 'The catalog could not load. Check Cloudinary configuration and retry.'); }
    }
    if (!sameOrigin(request)) return fail(403, 'This request must come from the admin page.');
    if (!request.headers?.['content-type']?.startsWith('application/json')) return fail(415, 'Send JSON.');
    const body = request.body;
    if (!body || typeof body !== 'object' || JSON.stringify(body).length > 100000) return fail(400, 'Invalid request.');
    if (action === 'login') {
      if ((env.VERCEL || env.NODE_ENV === 'production') && env.ADMIN_LOGIN_RATE_LIMIT_CONFIGURED !== 'true') return fail(503, 'Configure the Vercel login rate limit before enabling admin access.');
      const key = String(request.headers?.['x-real-ip'] || request.socket?.remoteAddress || 'local');
      const time = now();
      for (const [ip, value] of attempts) if (value.until <= time) attempts.delete(ip);
      if (attempts.size > 10000) return fail(429, 'Too many sign-in attempts. Try again later.');
      const counter = attempts.get(key) || { count: 0, until: time + 15 * 60000 };
      if (counter.count >= 5) { response.setHeader('Retry-After', String(Math.ceil((counter.until - time) / 1000))); return fail(429, 'Too many sign-in attempts. Try again in 15 minutes.'); }
      counter.count++; attempts.set(key, counter);
      if (!verifyAdminPassword(body.password, env)) return fail(401, 'Incorrect password.');
      attempts.delete(key);
      response.setHeader('Set-Cookie', sessionCookie(createSession(env, time), env));
      return response.status(200).json({ authenticated: true });
    }
    if (!isAuthenticated(request, env, now())) return fail(401, 'Your session ended. Sign in again.');
    if (action === 'logout') { response.setHeader('Set-Cookie', sessionCookie('', env)); return response.status(200).json({ authenticated: false }); }
    if (!cloudConfigured(env)) return fail(503, 'Configure Cloudinary before managing designs.');
    if (action === 'upload') {
      const parameters = { public_id: `schedsnap/admin/artwork/${randomUUID()}`, overwrite: 'false', allowed_formats: 'png,jpg,webp', timestamp: String(Math.floor(now() / 1000)) };
      return response.status(200).json({ cloud: env.CLOUDINARY_CLOUD_NAME, apiKey: env.CLOUDINARY_API_KEY, parameters, signature: signCloud(parameters, env) });
    }
    if (!['save', 'visibility', 'delete'].includes(action)) return fail(404, 'Unknown action.');
    if (saving) return fail(409, 'Another change is saving. Try again.');
    saving = true;
    try {
      let catalog = await store.read(true);
      if (body.revision !== catalog.revision) return fail(409, 'The library changed in another tab. Reload it before saving.');
      if (action === 'save') {
        const input = body.create === true ? { ...body.template, id: generateDesignId(body.template?.name, catalog.templates.map(t => t.id)) } : body.template;
        const parsed = templateSchema.safeParse(input);
        if (!parsed.success) return fail(400, parsed.error.issues[0].message);
        const template = parsed.data;
        const paths = [template.image, ...Object.values(template.deviceImages || {})].filter(Boolean);
        const existingPaths = new Set(wallpaperTemplates.flatMap(t => [t.image, ...Object.values(t.deviceImages || {})].filter(Boolean)));
        if (paths.some(path => path.startsWith('/') ? !existingPaths.has(path) : !path.startsWith(`https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/`))) return fail(400, 'Artwork must belong to this library.');
        const index = catalog.templates.findIndex(t => t.id === template.id);
        if (catalog.templates[index]?.deletionPending) return fail(409, 'This design is being deleted. Finish deletion before editing.');
        const previous = catalog.templates[index];
        // Dates are server-owned: editing or re-publishing must not renew New.
        delete template.createdAt; delete template.publishedAt;
        if (previous?.createdAt) template.createdAt = previous.createdAt;
        if (previous?.publishedAt) template.publishedAt = previous.publishedAt;
        if (index < 0) template.createdAt = new Date(now()).toISOString();
        if (template.status === 'published' && !template.publishedAt && (index < 0 || (previous?.status === 'draft' && previous.createdAt))) template.publishedAt = new Date(now()).toISOString();
        if (index < 0) catalog.templates.unshift(template); else catalog.templates[index] = template;
      } else if (action === 'visibility') {
        const template = catalog.templates.find(t => t.id === body.id);
        if (!template) return fail(404, 'Design not found.');
        if (template.deletionPending) return fail(409, 'Finish deleting this design before publishing.');
        if (body.status !== 'hidden' && body.status !== 'published') return fail(400, 'Invalid visibility.');
        if (body.status === 'published') {
          const parsed = templateSchema.safeParse({ ...template, status: 'published' });
          if (!parsed.success) return fail(422, 'This design needs artwork before publishing. Open Edit to add the missing device images.');
        }
        if (body.status === 'published' && template.status === 'draft' && template.createdAt && !template.publishedAt) template.publishedAt = new Date(now()).toISOString();
        template.status = body.status;
      } else if (action === 'delete') {
        const template = catalog.templates.find(t => t.id === body.id);
        if (!template) return fail(404, 'Design not found.');
        if (body.confirmation !== template.name) return fail(400, 'Type the exact design title to confirm permanent deletion.');
        const others = catalog.templates.filter(t => t.id !== body.id);
        const shared = new Set(others.flatMap(resolveArtworkIds));
        const targets = resolveArtworkIds(template).filter(id => !shared.has(id));
        if (targets.some(id => id.startsWith('local:'))) return fail(422, 'Some artwork is not mapped to Cloudinary. Upload or map it before permanently deleting this design.');
        // Hide and persist the deletion intent first. On remote failure the
        // record remains available for a safe, idempotent retry.
        template.status = 'hidden'; template.deletionPending = true;
        catalog = await store.write(catalog);
        try {
          for (const publicId of targets) await destroyArtwork(publicId);
          const completed = { ...catalog, templates: catalog.templates.filter(t => t.id !== body.id) };
          return response.status(200).json(await store.write(completed));
        } catch {
          return response.status(503).json({ catalog, error: { message: 'Deletion could not finish. The design is hidden; retry Delete to remove the remaining artwork.' } });
        }
      }
      return response.status(200).json(await store.write(catalog));
    } catch { return fail(503, 'Could not save the library. Check Cloudinary and try again.'); }
    finally { saving = false; }
  };
}
export default createAdminHandler();
