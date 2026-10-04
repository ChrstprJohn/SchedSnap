const sessionKey = 'schedsnap:visit-counted';
let visitRequest;

// Share the request across StrictMode mounts and homepage navigation.
export function loadVisitCount() {
  if (visitRequest) return visitRequest;
  visitRequest = (async () => {
    let counted = false;
    try { counted = sessionStorage.getItem(sessionKey) === '1'; } catch { /* Storage can be disabled. */ }
    try {
      const response = await fetch('/api/visits', {
        method: counted ? 'GET' : 'POST',
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) return null;
      const { visits } = await response.json();
      if (!Number.isSafeInteger(visits) || visits < 0) return null;
      try { sessionStorage.setItem(sessionKey, '1'); } catch { /* The shared request still avoids repeat counts. */ }
      return visits;
    } catch { return null; }
  })();
  return visitRequest;
}
