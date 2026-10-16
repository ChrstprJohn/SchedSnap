import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

const CACHE_MS = 60000;
let cached;
let expires = 0;
let reading;
let cacheRevision = 0;

async function loadLikes(force = false) {
  if (reading) return reading;
  if (!force && cached && expires > Date.now()) return cached;
  const revision = cacheRevision;
  reading = api.get('/likes', { timeout: 15000 }).then(({ data }) => {
    if (revision === cacheRevision) { cached = data; expires = Date.now() + CACHE_MS; }
    return data;
  });
  try { return await reading; }
  finally { reading = null; }
}

function rememberLike(id, vote) {
  cacheRevision++;
  if (cached) cached = { ...cached, identified: true, likes: { ...cached.likes, [id]: vote } };
}

export default function useDesignLikes() {
  const [likes, setLikes] = useState({});
  const [rankingLikes, setRankingLikes] = useState(null);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState('');
  const identified = useRef(false);
  const initializing = useRef(null);
  const saving = useRef(new Map());
  const currentLikes = useRef({});
  const version = useRef(0);
  const mounted = useRef(false);

  const refresh = useCallback(async (force = false) => {
    if (saving.current.size) return;
    const revision = ++version.current;
    try {
      const data = await loadLikes(force === true);
      if (!mounted.current || version.current !== revision) return;
      identified.current = data.identified;
      currentLikes.current = data.likes;
      setLikes(data.likes);
      setRankingLikes(previous => previous ?? data.likes);
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
    const previous = currentLikes.current[id];
    if (!previous) return;
    version.current++;
    const existing = saving.current.get(id);
    const entry = existing || { confirmed: previous, desired: !previous.liked };
    entry.desired = !previous.liked;
    saving.current.set(id, entry);
    const publish = value => {
      currentLikes.current = { ...currentLikes.current, [id]: value };
      if (mounted.current) setLikes(currentLikes.current);
    };
    publish({ count: previous.count + (entry.desired ? 1 : -1), liked: entry.desired });
    setError('');
    if (existing) return;
    setPending(saving.current.size);
    try {
      if (!identified.current) {
        // Share cookie creation when several different hearts are clicked at once.
        initializing.current ||= api.post('/likes', { action: 'identify' }, { timeout: 15000 });
        const initialization = initializing.current;
        try { await initialization; identified.current = true; }
        finally { if (initializing.current === initialization) initializing.current = null; }
      }
      // Keep each design's requests ordered and send the latest click state.
      while (entry.confirmed.liked !== entry.desired) {
        const { data } = await api.post('/likes', { id, liked: entry.desired }, { timeout: 15000 });
        entry.confirmed = { count: data.count, liked: data.liked };
        rememberLike(id, entry.confirmed);
        publish({ count: data.count + Number(entry.desired) - Number(data.liked), liked: entry.desired });
      }
      return true;
    } catch (failure) {
      if (failure.response?.status === 428) { identified.current = false; cacheRevision++; cached = null; expires = 0; }
      publish(entry.confirmed);
      if (mounted.current) setError(failure.response?.data?.error?.message || 'Your like could not save. Try again.');
      return false;
    } finally {
      saving.current.delete(id);
      if (mounted.current) setPending(saving.current.size);
    }
  }

  return { likes, rankingLikes: rankingLikes ?? likes, loading: rankingLikes === null && !error, pending, error, refresh, toggle };
}
