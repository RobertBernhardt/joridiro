import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'node:crypto';

const SESSION_DAYS = 30;

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 32);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function checkPassword(password, stored) {
  const [, saltHex, hashHex] = String(stored).split('$');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(expected, actual);
}

const sha = (s) => createHash('sha256').update(s).digest('hex');

export function createSession(db, userId, now) {
  const token = randomBytes(32).toString('base64url');
  db.run('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    sha(token), userId, now + SESSION_DAYS * 864e5);
  return { token, maxAge: SESSION_DAYS * 86400 };
}

export function userFromToken(db, token, now) {
  if (!token) return null;
  const row = db.get(`SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?`, sha(token), now);
  return row ? { id: row.id, email: row.email, name: row.name } : null;
}

export function destroySession(db, token) {
  if (token) db.run('DELETE FROM sessions WHERE token_hash = ?', sha(token));
}

// Small in-memory brake against password guessing: 20 attempts per 15 minutes per IP.
const attempts = new Map();
export function allowAttempt(ip, now) {
  const a = attempts.get(ip);
  if (!a || now - a.since > 15 * 60e3) { attempts.set(ip, { since: now, n: 1 }); return true; }
  a.n += 1;
  return a.n <= 20;
}
