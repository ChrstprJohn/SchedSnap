import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

export default function useDesignLikes() {
  const [likes, setLikes] = useState({});
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const identified = useRef(false);
  const busy = useRef(false);
  const version = useRef(0);
  const mounted = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    const revision = ++version.current;
    try {
      const { data } = await api.get('/likes', { timeout: 15000 });
      if (!mounted.current || version.current !== revision) return;
      identified.current = data.identified;
      setLikes(data.likes);
      setError('');
    } catch {
      if (mounted.current && version.current === revision) setError('Likes could not load. Try again.');
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    queueMicrotask(refresh);
    window.addEventListener('focus', refresh);
    return () => { mounted.current = false; window.removeEventListener('focus', refresh); };
  }, [refresh]);

  async function toggle(id) {
    if (busy.current || !likes[id]) return;
    busy.current = true;
    version.current++;
    setPending(id);
    setError('');
    try {
      if (!identified.current) await api.post('/likes', { action: 'identify' }, { timeout: 15000 });
      const { data } = await api.post('/likes', { id, liked: !likes[id].liked }, { timeout: 15000 });
      identified.current = true;
      if (mounted.current) setLikes(previous => ({ ...previous, [id]: { count: data.count, liked: data.liked } }));
    } catch (failure) {
      if (failure.response?.status === 428) identified.current = false;
      if (mounted.current) setError(failure.response?.data?.error?.message || 'Your like could not save. Try again.');
    } finally {
      busy.current = false;
      if (mounted.current) setPending('');
    }
  }

  return { likes, pending, error, refresh, toggle };
}
