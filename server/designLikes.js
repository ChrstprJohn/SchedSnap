import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

const COOKIE = 'schedsnap_likes';
const YEAR = 31536000;
const COUNTS_CACHE_MS = 60000;
const COUNTS_KEY = 'schedsnap:likes:counts';
const visitorKey = visitor => `schedsnap:likes:visitor:${visitor}`;
const keyFor = id => `schedsnap:likes:design:${id}`;
const rateScript = `local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], 60) end
return count`;
const voteScript = `if ARGV[2] == '1' then
  redis.call('SADD', KEYS[1], ARGV[1])
  redis.call('HSET', KEYS[3], ARGV[3], '1')
else
  redis.call('SREM', KEYS[1], ARGV[1])
  redis.call('HDEL', KEYS[3], ARGV[3])
end
local count = redis.call('SCARD', KEYS[1])
redis.call('HSET', KEYS[2], ARGV[3], count)
return {count, tonumber(ARGV[2])}`;
// Backfill only missing fields. Existing vote sets remain the source of truth.
const countsBackfillScript = `for i = 2, #KEYS do
  if redis.call('HEXISTS', KEYS[1], ARGV[i - 1]) == 0 then
    redis.call('HSET', KEYS[1], ARGV[i - 1], redis.call('SCARD', KEYS[i]))
  end
end
return redis.call('HGETALL', KEYS[1])`;
const visitorBackfillScript = `if redis.call('HEXISTS', KEYS[1], '@ready') == 0 then
  for i = 2, #KEYS do
    if redis.call('SISMEMBER', KEYS[i], ARGV[1]) == 1 then
      redis.call('HSET', KEYS[1], ARGV[i], '1')
    end
  end
  redis.call('HSET', KEYS[1], '@ready', '1')
end
return redis.call('HGETALL', KEYS[1])`;

export function createDesignLikes({ env = process.env, fetcher = fetch, now = () => Date.now() } = {}) {
  const production = Boolean(env.VERCEL || env.NODE_ENV === 'production');
  const configured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN && env.IMPORT_LIMIT_SECRET);
  const secret = env.IMPORT_LIMIT_SECRET || 'local-development-likes';
  const mac = value => createHmac('sha256', secret).update(`schedsnap-likes:${value}`).digest('base64url');
  const votes = new Map();
  const attempts = new Map();
  let countsCache;
  let countsPending;
  let countsRevision = 0;

  function identity(request) {
    const token = request.headers?.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    const match = /^(v2\.)?([a-f0-9]{32})\.(\d{10})\.([\w-]{43})$/.exec(token || '');
    if (!match) return null;
    const [, version = '', id, expiry, signature] = match;
    if (+expiry <= now() / 1000 || +expiry > now() / 1000 + YEAR) return null;
    return timingSafeEqual(Buffer.from(signature), Buffer.from(mac(`${version}${id}.${expiry}`))) ? version ? `v2:${id}` : id : null;
  }

  function cookie() {
    const value = `v2.${randomBytes(16).toString('hex')}.${Math.floor(now() / 1000) + YEAR}`;
    return `${COOKIE}=${value}.${mac(value)}; Path=/api/likes; HttpOnly; SameSite=Strict; Max-Age=${YEAR}${production ? '; Secure' : ''}`;
  }

  function ready() {
    if (production && !configured) throw new Error('Like storage unavailable');
  }

  async function redis(command) {
    const url = new URL(env.UPSTASH_REDIS_REST_URL);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Invalid like storage URL');
    const response = await fetcher(url.origin, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Like storage unavailable');
    const data = await response.json();
    if (!data || data.error || data.result === undefined) throw new Error('Invalid like storage reply');
    return data.result;
  }

  function result(count, liked) {
    if (!Number.isSafeInteger(count) || count < 0 || ![0, 1].includes(liked)) throw new Error('Invalid like count');
    return { count, liked: liked === 1 };
  }

  function hash(values) {
    if (!Array.isArray(values) || values.length % 2 || values.some((value, i) => i % 2 === 0 ? typeof value !== 'string' : typeof value !== 'string' && typeof value !== 'number')) throw new Error('Invalid like storage hash');
    return Object.fromEntries(Array.from({ length: values.length / 2 }, (_, i) => [values[i * 2], values[i * 2 + 1]]));
  }

  async function counts(ids) {
    const catalogKey = ids.join(',');
    if (countsCache?.catalogKey === catalogKey && countsCache.expires > now()) return countsCache.values;
    if (countsPending) { await countsPending; return counts(ids); }
    const revision = countsRevision;
    countsPending = (async () => {
      let fields = hash(await redis(['HGETALL', COUNTS_KEY]));
      const missing = ids.filter(id => !Object.hasOwn(fields, id));
      if (missing.length) fields = hash(await redis(['EVAL', countsBackfillScript, String(missing.length + 1), COUNTS_KEY, ...missing.map(keyFor), ...missing]));
      const values = Object.fromEntries(ids.map(id => {
        const raw = fields[id];
        if (typeof raw === 'string' && !/^\d+$/.test(raw)) throw new Error('Invalid like count');
        return [id, result(Number(raw), 0).count];
      }));
      if (revision === countsRevision) countsCache = { catalogKey, values, expires: now() + COUNTS_CACHE_MS };
      return values;
    })();
    try { return await countsPending; }
    finally { countsPending = null; }
  }

  async function likedDesigns(visitor, legacyIds) {
    if (!visitor) return {};
    const key = visitorKey(visitor);
    let fields = hash(await redis(['HGETALL', key]));
    if (!visitor.startsWith('v2:') && !Object.hasOwn(fields, '@ready')) fields = hash(await redis(['EVAL', visitorBackfillScript, String(legacyIds.length + 1), key, ...legacyIds.map(keyFor), visitor, ...legacyIds]));
    if (Object.values(fields).some(value => String(value) !== '1')) throw new Error('Invalid browser likes');
    return fields;
  }

  return {
    identity, cookie,
    async read(ids, visitor, legacyIds = ids) {
      ready();
      if (!configured) return Object.fromEntries(ids.map(id => [id, { count: votes.get(id)?.size || 0, liked: Boolean(visitor && votes.get(id)?.has(visitor)) }]));
      if (!ids.length) return {};
      const [values, mine] = await Promise.all([counts(ids), likedDesigns(visitor, legacyIds)]);
      return Object.fromEntries(ids.map(id => [id, { count: Math.max(values[id], Object.hasOwn(mine, id) ? 1 : 0), liked: Object.hasOwn(mine, id) }]));
    },
    async allow(request) {
      ready();
      // Vercel replaces this header. Ignore client-supplied forwarded IPs locally.
      const ip = env.VERCEL ? request.headers?.['x-vercel-forwarded-for']?.split(',')[0]?.trim() : request.socket?.remoteAddress;
      if (!ip || !isIP(ip)) throw new Error('Like rate-limit identity unavailable');
      const minute = Math.floor(now() / 60000);
      const key = `schedsnap:likes:rate:${minute}:${mac(`${minute}:${ip}`)}`;
      let count;
      if (configured) count = await redis(['EVAL', rateScript, '1', key]);
      else {
        for (const [oldKey, entry] of attempts) if (entry.minute !== minute) attempts.delete(oldKey);
        if (attempts.size >= 10000 && !attempts.has(key)) return false;
        count = (attempts.get(key)?.count || 0) + 1;
        attempts.set(key, { minute, count });
      }
      if (!Number.isSafeInteger(count) || count < 1) throw new Error('Invalid like rate limit');
      return count <= 60;
    },
    async write(id, visitor, liked) {
      ready();
      if (configured) {
        const value = await redis(['EVAL', voteScript, '3', keyFor(id), COUNTS_KEY, visitorKey(visitor), visitor, liked ? '1' : '0', id]);
        if (!Array.isArray(value) || value.length !== 2) throw new Error('Invalid like storage reply');
        const saved = result(...value);
        countsRevision++;
        if (countsCache) countsCache.values[id] = saved.count;
        return saved;
      }
      const set = votes.get(id) || new Set();
      if (liked) set.add(visitor); else set.delete(visitor);
      if (set.size) votes.set(id, set); else votes.delete(id);
      return { count: set.size, liked: set.has(visitor) };
    },
  };
}
