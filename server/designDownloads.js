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
  async function summary(ids) {
      ready();
      const values = configured && ids.length ? await command(['HGETALL', 'schedsnap:downloads:counts']) : [...local].flat();
      if (!Array.isArray(values) || values.length % 2) throw new Error('Invalid download counts');
      const fields = new Map();
      for (let index = 0; index < values.length; index += 2) fields.set(values[index], count(values[index + 1]));
      const byDevice = Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, Object.fromEntries(ids.map(id => [id, fields.get(`${id}:${device}`) ?? 0]))]));
      const unassigned = Object.fromEntries(ids.map(id => [id, fields.get(id) ?? 0]));
      const downloads = Object.fromEntries(ids.map(id => [id, unassigned[id] + byDevice.mobile[id] + byDevice.tablet[id] + byDevice.laptop[id]]));
      return { downloads, byDevice, unassigned };
  }
  return {
    summary,
    async read(ids, device) {
      if (device && !['mobile', 'tablet', 'laptop'].includes(device)) throw new Error('Invalid download device');
      // Cards and details show a design's total downloads; device split stays in the admin breakdown.
      return (await summary(ids)).downloads;
    },
    async record(id, device) {
      ready();
      if (device && !['mobile', 'tablet', 'laptop'].includes(device)) throw new Error('Invalid download device');
      const field = device ? `${id}:${device}` : id;
      const value = configured ? count(await command(['EVAL', incrementScript, '1', 'schedsnap:downloads:counts', field])) : (local.get(field) || 0) + 1;
      if (!configured) local.set(field, value);
      return value;
    },
  };
}
