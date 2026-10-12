const CACHE_MS = 5 * 60 * 1000;
const RETRY_MS = 30 * 1000;
const VISITS_QUERY = `SELECT count(DISTINCT properties.$session_id) AS visits
FROM events
WHERE event = '$pageview'
  AND properties.site_name = 'schedsnap'
  AND properties.environment = 'production'
  AND properties.$session_id IS NOT NULL
  AND properties.$session_id != ''`;

// The public endpoint returns only one aggregate; it never accepts a client query.
export function createVisitsHandler({ env = process.env, fetcher = fetch, now = () => Date.now() } = {}) {
  let cached = { visits: null, expires: 0 };
  let pending;

  async function queryVisits() {
    const key = env.POSTHOG_PERSONAL_API_KEY;
    const projectId = env.POSTHOG_PROJECT_ID;
    if (!key || !/^\d+$/.test(projectId || '')) return null;
    try {
      const defaultHost = env.VITE_POSTHOG_HOST?.includes('eu.i.posthog.com') ? 'https://eu.posthog.com' : 'https://us.posthog.com';
      const host = new URL(env.POSTHOG_API_HOST || defaultHost);
      if (host.protocol !== 'https:' || host.username || host.password || host.search || host.hash || host.pathname !== '/') return null;
      const result = await fetcher(`${host.origin}/api/projects/${projectId}/query/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: { kind: 'HogQLQuery', query: VISITS_QUERY } }),
        signal: AbortSignal.timeout(8000),
        redirect: 'error',
      });
      if (!result.ok) return null;
      const payload = await result.json();
      if (payload.error || !Array.isArray(payload.results) || payload.results.length !== 1 || payload.results[0]?.length !== 1) return null;
      const value = payload.results[0][0];
      if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+$/.test(value))) return null;
      const count = Number(value);
      return Number.isSafeInteger(count) && count >= 0 ? count : null;
    } catch { return null; }
  }

  return async function visits(request, response) {
    response.setHeader('Cache-Control', 'no-store');
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET');
      return response.status(405).json({ visits: null });
    }
    if (cached.expires <= now()) {
      pending ??= queryVisits().then(visits => {
        cached = { visits, expires: now() + (visits === null ? RETRY_MS : CACHE_MS) };
      }).finally(() => { pending = null; });
      await pending;
    }
    if (cached.visits === null) return response.status(503).json({ visits: null });
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=300');
    return response.status(200).json({ visits: cached.visits });
  };
}

export default createVisitsHandler();
