import { cloudConfigured, createCatalogStore, seedCatalog } from '../server/catalogStore.js';
import { withTemplateKeywords } from '../shared/templateKeywords.js';
export function createPublicCatalogHandler({ env = process.env, store = createCatalogStore(env), previewTemplates = [] } = {}) {
  return async (request, response) => {
    if (request.method !== 'GET') return response.status(405).json({ error: { message: 'Method not allowed.' } });
    response.setHeader('Cache-Control', 'no-store');
    try {
      const catalog = cloudConfigured(env) ? await store.read() : seedCatalog();
      // Development can preview new local artwork without publishing to the
      // shared catalog. Remote records, including hidden ones, take precedence.
      const ids = new Set(catalog.templates.map(t => t.id));
      const additions = previewTemplates.filter(t => {
        if (ids.has(t.id)) return false;
        ids.add(t.id);
        return true;
      }).map(t => ({ ...t, status: 'published' }));
      return response.status(200).json({ templates: [...additions, ...catalog.templates].filter(t => t.status === 'published').map(withTemplateKeywords).map(t => Object.fromEntries(Object.entries(t).filter(([key]) => key !== 'status'))) });
    } catch {
      response.setHeader('Cache-Control', 'no-store');
      return response.status(503).json({ error: { message: 'Design library temporarily unavailable.' } });
    }
  };
}
export default createPublicCatalogHandler();
