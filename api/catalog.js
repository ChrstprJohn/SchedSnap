import { cloudConfigured, createCatalogStore, seedCatalog } from '../server/catalogStore.js';
export function createPublicCatalogHandler({ env = process.env, store = createCatalogStore(env) } = {}) {
  return async (request, response) => {
    if (request.method !== 'GET') return response.status(405).json({ error: { message: 'Method not allowed.' } });
    response.setHeader('Cache-Control', 'no-store');
    try {
      const catalog = cloudConfigured(env) ? await store.read() : seedCatalog();
      return response.status(200).json({ templates: catalog.templates.filter(t => t.status === 'published').map(t => Object.fromEntries(Object.entries(t).filter(([key]) => key !== 'status'))) });
    } catch {
      response.setHeader('Cache-Control', 'no-store');
      return response.status(503).json({ error: { message: 'Design library temporarily unavailable.' } });
    }
  };
}
export default createPublicCatalogHandler();
