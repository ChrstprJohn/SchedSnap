import { useEffect, useState } from 'react';
import { CatalogContext } from './catalogContext.js';
export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState({ templates: [], loading: true, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    const load = () => fetch('/api/catalog', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Could not load designs. Please try again.');
      const data = await response.json();
      if (!Array.isArray(data.templates)) throw new Error('Could not load designs. Please try again.');
      setCatalog({ templates: data.templates, loading: false, error: '' });
    }).catch(error => { if (!controller.signal.aborted) setCatalog(previous => ({ ...previous, loading: false, error: error.message })); });
    load();
    const refresh = () => { if (!document.hidden) load(); };
    const timer = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}
