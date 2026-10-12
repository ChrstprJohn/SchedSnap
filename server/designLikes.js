import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

const COOKIE = 'schedsnap_likes';
const YEAR = 31536000;
const keyFor = id => `schedsnap:likes:design:${id}`;
const rateScript = `local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], 60) end
return count`;
const voteScript = `if ARGV[2] == '1' then
  redis.call('SADD', KEYS[1], ARGV[1])
else
  redis.call('SREM', KEYS[1], ARGV[1])
end
return {redis.call('SCARD', KEYS[1]), redis.call('SISMEMBER', KEYS[1], ARGV[1])}`;

export function createDesignLikes({ env = process.env, fetcher = fetch, now = () => Date.now() } = {}) {
  const production = Boolean(env.VERCEL || env.NODE_ENV === 'production');
  const configured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN && env.IMPORT_LIMIT_SECRET);
  const secret = env.IMPORT_LIMIT_SECRET || 'local-development-likes';
  const mac = value => createHmac('sha256', secret).update(`schedsnap-likes:${value}`).digest('base64url');
  const votes = new Map();
  const attempts = new Map();

  function identity(request) {
    const token = request.headers?.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    const match = /^([a-f0-9]{32})\.(\d{10})\.([\w-]{43})$/.exec(token || '');
    if (!match) return null;
    const [, id, expiry, signature] = match;
    if (+expiry <= now() / 1000 || +expiry > now() / 1000 + YEAR) return null;
    return timingSafeEqual(Buffer.from(signature), Buffer.from(mac(`${id}.${expiry}`))) ? id : null;
  }

  function cookie() {
    const value = `${randomBytes(16).toString('hex')}.${Math.floor(now() / 1000) + YEAR}`;
    return `${COOKIE}=${value}.${mac(value)}; Path=/api/likes; HttpOnly; SameSite=Strict; Max-Age=${YEAR}${production ? '; Secure' : ''}`;
  }

  function ready() {
    if (production && !configured) throw new Error('Like storage unavailable');
  }

  async function redis(command, pipeline = false) {
    const url = new URL(env.UPSTASH_REDIS_REST_URL);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Invalid like storage URL');
    const response = await fetcher(`${url.origin}${pipeline ? '/pipeline' : ''}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Like storage unavailable');
    const data = await response.json();
    const entries = pipeline ? data : [data];
    if (!Array.isArray(entries) || entries.length !== (pipeline ? command.length : 1) || entries.some(entry => !entry || entry.error || entry.result === undefined)) throw new Error('Invalid like storage reply');
    return pipeline ? entries.map(entry => entry.result) : data.result;
  }

  function result(count, liked) {
    if (!Number.isSafeInteger(count) || count < 0 || ![0, 1].includes(liked)) throw new Error('Invalid like count');
    return { count, liked: liked === 1 };
  }

  return {
    identity, cookie,
    async read(ids, visitor) {
      ready();
      if (!configured) return Object.fromEntries(ids.map(id => [id, { count: votes.get(id)?.size || 0, liked: Boolean(visitor && votes.get(id)?.has(visitor)) }]));
      if (!ids.length) return {};
      const commands = ids.flatMap(id => [['SCARD', keyFor(id)], ...(visitor ? [['SISMEMBER', keyFor(id), visitor]] : [])]);
      const values = await redis(commands, true);
      return Object.fromEntries(ids.map((id, i) => [id, result(values[i * (visitor ? 2 : 1)], visitor ? values[i * 2 + 1] : 0)]));
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
        const value = await redis(['EVAL', voteScript, '1', keyFor(id), visitor, liked ? '1' : '0']);
        if (!Array.isArray(value) || value.length !== 2) throw new Error('Invalid like storage reply');
        return result(...value);
      }
      const set = votes.get(id) || new Set();
      if (liked) set.add(visitor); else set.delete(visitor);
      if (set.size) votes.set(id, set); else votes.delete(id);
      return { count: set.size, liked: set.has(visitor) };
    },
  };
}
