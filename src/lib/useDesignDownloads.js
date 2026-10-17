import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

export function recordDesignDownload(id, device) {
  // Metrics must never prevent a user from saving their wallpaper.
  return api.post('/downloads', { id, device }, { timeout: 15000 }).catch(() => null);
}

export default function useDesignDownloads(device) {
  const [result, setResult] = useState({ device, downloads: {} });
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    let active = true;
    api.get('/downloads', { params: { device }, timeout: 15000 }).then(({ data }) => { if (active) { setResult({ device, downloads: data.downloads }); setError(''); } }).catch(() => { if (active) setError('Download counts could not load.'); });
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [refresh, revision, device]);
  return { downloads: result.device === device ? result.downloads : {}, error, refresh };
}
