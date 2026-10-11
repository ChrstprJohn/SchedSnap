import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const SESSION_SECONDS = 8 * 60 * 60;
const cookieName = 'schedsnap_admin';
export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 256) return false;
  const [, salt, digest] = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(stored || '') || [];
  if (!salt) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(digest, 'hex'));
}
export function authConfigured(env) {
  if (env.ADMIN_PASSWORD) return env.ADMIN_PASSWORD.length >= 16 && env.ADMIN_PASSWORD.length <= 256
    && (!env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length >= 32);
  return /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(env.ADMIN_PASSWORD_HASH || '') && (env.ADMIN_SESSION_SECRET?.length || 0) >= 32;
}
export function verifyAdminPassword(password, env) {
  if (!authConfigured(env) || typeof password !== 'string' || password.length > 256) return false;
  if (!env.ADMIN_PASSWORD) return verifyPassword(password, env.ADMIN_PASSWORD_HASH);
  const digest = value => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(password), digest(env.ADMIN_PASSWORD));
}
const mac = (value, env) => {
  const credential = env.ADMIN_PASSWORD || env.ADMIN_PASSWORD_HASH;
  const key = env.ADMIN_SESSION_SECRET || createHash('sha256').update(`schedsnap-admin-session:${credential}`).digest();
  return createHmac('sha256', key).update(`${value}:${credential}`).digest('base64url');
};
export function createSession(env, now = Date.now()) {
  const value = Buffer.from(JSON.stringify({ exp: Math.floor(now / 1000) + SESSION_SECONDS, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  return `${value}.${mac(value, env)}`;
}
export function isAuthenticated(request, env, now = Date.now()) {
  if (!authConfigured(env)) return false;
  try {
    const token = request.headers?.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    const [value, signature, extra] = (token || '').split('.');
    if (!value || !signature || extra) return false;
    const expected = Buffer.from(mac(value, env));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
    const session = JSON.parse(Buffer.from(value, 'base64url').toString());
    return Number.isInteger(session.exp) && session.exp > now / 1000 && session.exp <= now / 1000 + SESSION_SECONDS;
  } catch { return false; }
}
export function sessionCookie(token, env) {
  const secure = env.VERCEL || env.NODE_ENV === 'production';
  return `${cookieName}=${token}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${token ? SESSION_SECONDS : 0}${secure ? '; Secure' : ''}`;
}
export function sameOrigin(request) {
  try {
    const origin = new URL(request.headers?.origin);
    const host = request.headers?.['x-forwarded-host'] || request.headers?.host;
    return origin.host === host && ['http:', 'https:'].includes(origin.protocol)
      && request.headers?.['sec-fetch-site'] !== 'cross-site';
  } catch { return false; }
}
