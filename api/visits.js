// Only an aggregate count is stored: no schedules, uploads or visitor identities.
export function createVisitsHandler({ env = process.env, fetcher = fetch } = {}) {
  return async function visits(request, response) {
    response.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'POST'].includes(request.method)) {
      response.setHeader('Allow', 'GET, POST');
      return response.status(405).json({ visits: null });
    }
    const url = env.UPSTASH_REDIS_REST_URL;
    const token = env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return response.status(503).json({ visits: null });

    try {
      const result = await fetcher(url.replace(/\/$/, ''), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([request.method === 'POST' ? 'INCR' : 'GET', 'schedsnap:visits']),
        signal: AbortSignal.timeout(4000),
      });
      if (!result.ok) throw new Error('Counter unavailable');
      const payload = await result.json();
      if (payload.error || !Object.hasOwn(payload, 'result')) throw new Error('Counter unavailable');
      if (payload.result !== null && typeof payload.result !== 'number' && !(typeof payload.result === 'string' && /^\d+$/.test(payload.result))) throw new Error('Invalid count');
      const count = payload.result === null && request.method === 'GET' ? 0 : Number(payload.result);
      if (!Number.isSafeInteger(count) || count < 0 || (request.method === 'POST' && count < 1)) throw new Error('Invalid count');
      return response.status(200).json({ visits: count });
    } catch {
      return response.status(503).json({ visits: null });
    }
  };
}

export default createVisitsHandler();
