import { createAnalyzeHandler } from '../api/analyze.js';
import { createVisitsHandler } from '../api/visits.js';
import { createAdminHandler } from '../api/admin.js';
import { createPublicCatalogHandler } from '../api/catalog.js';
import { createLikesHandler } from '../api/likes.js';
import { MAX_BODY_BYTES } from '../shared/uploadLimits.js';
import { sanrioTemplates } from '../src/assets/sanrioTemplates.js';
import { domoTemplates } from '../src/assets/domoTemplates.js';
import { meepTemplates } from '../src/assets/meepTemplates.js';
import { ghibliTemplates } from '../src/assets/ghibliTemplates.js';
import { genshinTemplates } from '../src/assets/genshinTemplates.js';
import { genshinBackgroundTemplates } from '../src/assets/genshinBackgroundTemplates.js';
import { genshinChibiTemplates } from '../src/assets/genshinChibiTemplates.js';


// Runs only inside Vite's Node process. No credentials enter the browser bundle.
export function localApiPlugin(env) {
  return {
    name: 'unitoolbox-local-api',
    configureServer(server) {
      const analyze = createAnalyzeHandler({ env });
      const visits = createVisitsHandler({ env });
      const admin = createAdminHandler({ env });
      const catalog = createPublicCatalogHandler({ env, previewTemplates: [...genshinChibiTemplates, ...genshinTemplates, ...genshinBackgroundTemplates, ...ghibliTemplates, ...meepTemplates, ...sanrioTemplates, ...domoTemplates.filter(template => template.family === 'domo-reference')] });
      const likes = createLikesHandler({ env });
      server.middlewares.use(async (request, response, next) => {
        const path = request.url?.split('?')[0];
        if (!['/api/analyze', '/api/visits', '/api/admin', '/api/catalog', '/api/likes'].includes(path)) return next();
        response.setHeader('Cache-Control', 'no-store');
        response.status = (code) => { response.statusCode = code; return response; };
        response.json = (body) => { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(body)); return response; };
        if (path === '/api/visits') return visits(request, response);
        if (path === '/api/catalog') return catalog(request, response);
        try {
          if (request.method === 'POST') {
            const limit = path === '/api/likes' ? 1024 : path === '/api/admin' ? 100000 : MAX_BODY_BYTES;
            const chunks = [];
            let size = 0;
            for await (const chunk of request) {
              size += chunk.length;
              if (size <= limit) chunks.push(chunk);
            }
            if (size > limit) return response.status(413).json({ error: { code: 'IMAGE_TOO_LARGE', message: 'The request is too large.' } });
            request.body = JSON.parse(Buffer.concat(chunks).toString());
          }
          await (path === '/api/likes' ? likes : path === '/api/admin' ? admin : analyze)(request, response);
        } catch {
          response.status(400).json({ error: { code: path === '/api/likes' ? 'INVALID_REQUEST' : 'INVALID_IMAGE', message: path === '/api/likes' ? 'Invalid like request.' : 'Upload a valid schedule image.' } });
        }
      });
    },
  };
}
