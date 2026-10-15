let visitRequest;
let pending = false;
let expires = 0;
let lastVisitCount = null;
const CACHE_KEY = 'schedsnap:pageviews';

export function getCachedVisitCount() {
  try {
    const stored = globalThis.localStorage?.getItem(CACHE_KEY);
    if (stored !== null && stored !== undefined && /^\d+$/.test(stored)) {
      const count = Number(stored);
      if (Number.isSafeInteger(count)) lastVisitCount = count;
    }
  } catch { /* Keep the in-memory count when browser storage is blocked. */ }
  return lastVisitCount;
}

// PostHog captures visits; this loader only reads the cached aggregate.
export function loadVisitCount() {
  if (visitRequest && (pending || expires > Date.now())) return visitRequest;
  pending = true;
  visitRequest = (async () => {
    try {
      const response = await fetch('/api/visits', {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Visits unavailable');
      const { visits } = await response.json();
      if (!Number.isSafeInteger(visits) || visits < 0) throw new Error('Invalid visits');
      lastVisitCount = visits;
      expires = Date.now() + 60 * 1000;
      try { globalThis.localStorage?.setItem(CACHE_KEY, String(visits)); } catch { /* Storage is optional. */ }
      return visits;
    } catch {
      expires = Date.now() + 30000;
      return getCachedVisitCount();
    } finally {
      pending = false;
    }
  })();
  return visitRequest;
}
