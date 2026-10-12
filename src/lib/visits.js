let visitRequest;
let expires = 0;

// PostHog captures visits; this loader only reads the cached aggregate.
export function loadVisitCount() {
  if (visitRequest && expires > Date.now()) return visitRequest;
  expires = Date.now() + 5 * 60 * 1000;
  visitRequest = (async () => {
    try {
      const response = await fetch('/api/visits', {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Visits unavailable');
      const { visits } = await response.json();
      if (!Number.isSafeInteger(visits) || visits < 0) throw new Error('Invalid visits');
      return visits;
    } catch {
      expires = Date.now() + 30000;
      return null;
    }
  })();
  return visitRequest;
}
