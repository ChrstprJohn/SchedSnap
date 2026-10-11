import { createAnalyzeHandler } from '../api/analyze.js';
import { createVisitsHandler } from '../api/visits.js';
import { createAdminHandler } from '../api/admin.js';
import { createPublicCatalogHandler } from '../api/catalog.js';
import { MAX_BODY_BYTES } from '../shared/uploadLimits.js';

// Runs only inside Vite's Node process. No credentials enter the browser bundle.
export function localApiPlugin(env) {
  return {
    name: 'unitoolbox-local-api',
    configureServer(server) {
      const analyze = createAnalyzeHandler({ env });
      const visits = createVisitsHandler({ env });
      const admin = createAdminHandler({ env });
      const catalog = createPublicCatalogHandler({ env });
      server.middlewares.use(async (request, response, next) => {
        const path = request.url?.split('?')[0];
        if (!['/api/analyze', '/api/visits', '/api/admin', '/api/catalog'].includes(path)) return next();
        response.setHeader('Cache-Control', 'no-store');
        response.status = (code) => { response.statusCode = code; return response; };
        response.json = (body) => { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(body)); return response; };
        if (path === '/api/visits') return visits(request, response);
        if (path === '/api/catalog') return catalog(request, response);
        try {
          if (request.method === 'POST') {
            const chunks = [];
            let size = 0;
            for await (const chunk of request) {
              size += chunk.length;
              if (size <= (path === '/api/admin' ? 100000 : MAX_BODY_BYTES)) chunks.push(chunk);
            }
            if (size > (path === '/api/admin' ? 100000 : MAX_BODY_BYTES)) return response.status(413).json({ error: { code: 'IMAGE_TOO_LARGE', message: 'The request is too large.' } });
            request.body = JSON.parse(Buffer.concat(chunks).toString());
          }
          await (path === '/api/admin' ? admin : analyze)(request, response);
        } catch {
          response.status(400).json({ error: { code: 'INVALID_IMAGE', message: 'Upload a valid schedule image.' } });
        }
      });
    },
  };
}
