import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { fail, hash, keys, string } from './domain.js';

const derive = promisify(scrypt);
const cookieName = 'shoqan_session';
const lifetime = 7 * 24 * 60 * 60;
const scryptOptions = { N: 65536, r: 8, p: 2, maxmem: 128 * 1024 * 1024 };
const publicUser = user => ({ id: user.id, name: user.name, email: user.email });

export async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const derived = await derive(password, salt, 64, scryptOptions);
  return `scrypt-v1:${salt}:${derived.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [, salt, expected] = encoded.split(':');
  const actual = await derive(password, salt, 64, scryptOptions);
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}

// Only a local administrator can issue recovery codes; never expose this via HTTP.
export function issuePasswordReset(store, email, now = Date.now()) {
  const user=store.userByEmail(string(email,254).toLowerCase());
  if(!user)throw new Error('Account not found');
  const token=randomBytes(32).toString('hex');
  store.savePasswordReset(user.id,hash(token),now+15*60*1000);
  return token;
}

export function createAuth(store, { secureCookies = process.env.COOKIE_SECURE === 'true', now = Date.now, maxAttempts = 15 } = {}) {
  // A bounded, process-local limit for this single-server MVP. Do not trust forwarded IPs.
  const attempts = new Map();
  function limit(req) {
    const ip = req.socket.remoteAddress || 'unknown';
    const time = now();
    for (const [key, item] of attempts) if (item.until <= time) attempts.delete(key);
    const item = attempts.get(ip) || { count: 0, until: time + 15 * 60 * 1000 };
    if (item.count >= maxAttempts) fail(429, 'Too many sign-in attempts');
    item.count++; attempts.set(ip, item);
    if (attempts.size > 10000) attempts.delete(attempts.keys().next().value);
  }
  function sessionToken(req) {
    const match = (req.headers.cookie || '').match(/(?:^|;\s*)shoqan_session=([a-f0-9]{64})(?:;|$)/);
    return match?.[1];
  }
  function cookie(res, token, age) {
    res.setHeader('Set-Cookie', `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secureCookies ? '; Secure' : ''}`);
  }
  function session(req) {
    const token = sessionToken(req);
    if (!token) return null;
    const row = store.session(hash(token));
    if (!row) return null;
    if (row.expiresAt <= now()) { store.deleteSession(hash(token)); return null; }
    const user = store.user(row.userId);
    return user ? publicUser(user) : null;
  }
  function startSession(req, res, user) {
    const oldToken = sessionToken(req);
    if (oldToken) store.deleteSession(hash(oldToken));
    const token = randomBytes(32).toString('hex');
    store.pruneSessions(now());
    store.saveSession({ tokenHash: hash(token), userId: user.id, expiresAt: now() + lifetime * 1000 });
    cookie(res, token, lifetime);
    return publicUser(user);
  }
  function credentials(body, register) {
    keys(body, register ? ['name', 'email', 'password'] : ['email', 'password']);
    const email = string(body.email, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Invalid email');
    if (typeof body.password !== 'string' || !body.password.trim() || body.password.length < 12 || body.password.length > 128) fail(400, 'Password must contain 12 to 128 characters');
    return { email, password: body.password, ...(register ? { name: string(body.name, 100) } : {}) };
  }
  return {
    session,
    async resetPassword(req,res,body) {
      limit(req);keys(body,['token','password']);
      if(typeof body.token!=='string' || !/^[a-f0-9]{64}$/.test(body.token))fail(401,'Invalid or expired recovery code');
      if(typeof body.password!=='string' || !body.password.trim() || body.password.length<12 || body.password.length>128)fail(400,'Password must contain 12 to 128 characters');
      const tokenHash=hash(body.token);
      const reset=store.passwordReset(tokenHash);
      if(!reset || reset.expiresAt<=now())fail(401,'Invalid or expired recovery code');
      const passwordHash=await hashPassword(body.password);
      store.transaction(()=>{
        const latest=store.passwordReset(tokenHash);
        if(!latest || latest.expiresAt<=now() || !store.user(latest.userId))fail(401,'Invalid or expired recovery code');
        store.updateUserPassword(latest.userId,passwordHash);
        store.deleteUserSessions(latest.userId);
        store.deletePasswordReset(latest.userId);
      });
      cookie(res,'',0);
      return {ok:true};
    },
    async register(req, res, body) {
      limit(req);
      const { name, email, password } = credentials(body, true);
      const passwordHash = await hashPassword(password);
      const user = { id: randomUUID(), name, email, passwordHash, createdAt: new Date(now()).toISOString() };
      store.transaction(() => {
        if (store.userByEmail(email)) fail(409, 'Account cannot be registered with this email');
        store.saveUser(user);
      });
      return startSession(req, res, user);
    },
    async login(req, res, body) {
      limit(req);
      const { email, password } = credentials(body, false);
      const user = store.userByEmail(email);
      // Unknown emails use the same password derivation work as existing emails.
      const encoded = user?.passwordHash || `scrypt-v1:${'0'.repeat(32)}:${'0'.repeat(128)}`;
      const valid = await verifyPassword(password, encoded);
      if (!user || !valid) fail(401, 'Email or password is incorrect');
      return startSession(req, res, user);
    },
    logout(req, res) {
      const token = sessionToken(req);
      if (token) store.deleteSession(hash(token));
      cookie(res, '', 0);
    }
  };
}
