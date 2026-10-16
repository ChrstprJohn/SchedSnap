export function createDesignDownloads({ env = process.env, fetcher = fetch } = {}) {
  const configured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
  const local = new Map();
  async function command(value) {
    const url = new URL(env.UPSTASH_REDIS_REST_URL);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Invalid download storage URL');
    const response = await fetcher(url.origin, { method: 'POST', headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(value), signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Download storage unavailable');
    const data = await response.json();
    if (data.error || data.result === undefined) throw new Error('Invalid download storage reply');
    return data.result;
  }
  function ready() {
    if (!configured && (env.VERCEL || env.NODE_ENV === 'production')) throw new Error('Download storage unavailable');
  }
  function count(value) {
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid download count');
    return number;
  }
  return {
    async read(ids) {
      ready();
      if (!configured) return Object.fromEntries(ids.map(id => [id, local.get(id) || 0]));
      if (!ids.length) return {};
      const values = await command(['HMGET', 'schedsnap:downloads:counts', ...ids]);
      if (!Array.isArray(values) || values.length !== ids.length) throw new Error('Invalid download counts');
      return Object.fromEntries(ids.map((id, index) => [id, count(values[index])]));
    },
    async record(id) {
      ready();
      const value = configured ? count(await command(['HINCRBY', 'schedsnap:downloads:counts', id, 1])) : (local.get(id) || 0) + 1;
      if (!configured) local.set(id, value);
      return value;
    },
  };
}
