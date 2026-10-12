import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

const LIMIT = 10;
const DAY = 86400000;
const OFFSET = 8 * 3600000;
const reserveScript = `local count = tonumber(redis.call('GET', KEYS[1]) or '0')
if count >= 10 then return {count, 0} end
count = redis.call('INCR', KEYS[1])
redis.call('EXPIREAT', KEYS[1], ARGV[1])
return {count, 1}`;

export function createImportUsage({ env = process.env, fetcher = fetch, now = () => Date.now() } = {}) {
  const memory = new Map();
  return async function usage(request, reserve = false) {
    const time = now();
    const day = Math.floor((time + OFFSET) / DAY);
    const resetsAt = (day + 1) * DAY - OFFSET;
    const production = Boolean(env.VERCEL || env.NODE_ENV === 'production');
    // Vercel overwrites this header; never trust client-supplied forwarded IP headers.
    const ip = env.VERCEL ? request.headers?.['x-vercel-forwarded-for']?.split(',')[0]?.trim() : request.socket?.remoteAddress;
    if (!ip || !isIP(ip)) throw new Error('Usage identity unavailable');
    const configured = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN && env.IMPORT_LIMIT_SECRET;
    if (production && !configured) throw new Error('Usage storage unavailable');
    const identity = createHmac('sha256', env.IMPORT_LIMIT_SECRET || 'local-development').update(`${day}:${ip}`).digest('hex');
    const key = `schedsnap:imports:${day}:${identity}`;
    let used;
    let allowed = true;
    if (configured) {
      const url = new URL(env.UPSTASH_REDIS_REST_URL);
      if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Invalid usage storage URL');
      const command = reserve ? ['EVAL', reserveScript, '1', key, String(Math.floor(resetsAt / 1000))] : ['GET', key];
      const response = await fetcher(url.origin, {
        method: 'POST', headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(command), signal: AbortSignal.timeout(5000), redirect: 'error',
      });
      if (!response.ok) throw new Error('Usage storage unavailable');
      const payload = await response.json();
      if (payload.error) throw new Error('Usage storage unavailable');
      if (reserve) {
        if (!Array.isArray(payload.result) || payload.result.length !== 2 || ![0, 1].includes(payload.result[1])) throw new Error('Invalid usage response');
        [used, allowed] = payload.result;
        allowed = Boolean(allowed);
      } else used = payload.result === null ? 0 : Number(payload.result);
    } else {
      for (const [entry, value] of memory) if (value.resetsAt <= time) memory.delete(entry);
      used = memory.get(key)?.used || 0;
      allowed = used < LIMIT;
      if (reserve && allowed) { used++; memory.set(key, { used, resetsAt }); }
    }
    if (!Number.isInteger(used) || used < 0 || used > LIMIT) throw new Error('Invalid usage response');
    return { used, limit: LIMIT, resetsAt, allowed: allowed && (reserve || used < LIMIT) };
  };
}
