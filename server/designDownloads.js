// Keep the increment atomic using commands allowed by the existing likes ACL.
const incrementScript = `local count = tonumber(redis.call('HGET', KEYS[1], ARGV[1]) or '0') + 1
redis.call('HSET', KEYS[1], ARGV[1], count)
return count`;

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
      const values = await command(['HGETALL', 'schedsnap:downloads:counts']);
      if (!Array.isArray(values) || values.length % 2) throw new Error('Invalid download counts');
      const fields = new Map();
      for (let index = 0; index < values.length; index += 2) fields.set(values[index], count(values[index + 1]));
      return Object.fromEntries(ids.map(id => [id, fields.get(id) ?? 0]));
    },
    async record(id) {
      ready();
      const value = configured ? count(await command(['EVAL', incrementScript, '1', 'schedsnap:downloads:counts', id])) : (local.get(id) || 0) + 1;
      if (!configured) local.set(id, value);
      return value;
    },
  };
}
