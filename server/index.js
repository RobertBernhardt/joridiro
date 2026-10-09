import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { openDb } from './db.js';
import { userFromToken } from './auth.js';
import { routes } from './api.js';
import { HttpError, readBody, parseCookies, sendJson, serveFile } from './http.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COOKIE = 'jid';

// Clean URLs -> HTML files in public/
const PAGES = [
  [/^\/$/, 'index.html'],
  [/^\/contests\/?$/, 'contests.html'],
  [/^\/c\/[^/]+\/?$/, 'contest.html'],
  [/^\/create\/?$/, 'create.html'],
  [/^\/dashboard\/?$/, 'dashboard.html'],
  [/^\/login\/?$/, 'login.html'],
  [/^\/imprint\/?$/, 'imprint.html'],
];

const compiled = routes.map(([method, path, handler]) => {
  const keys = [];
  const re = new RegExp('^' + path.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  return { method, re, keys, handler };
});

export function createApp({
  dbFile = process.env.DB_FILE || join(ROOT, 'data', 'joridiro.db'),
  uploadDir = process.env.UPLOAD_DIR || join(ROOT, 'data', 'uploads'),
  production = process.env.NODE_ENV === 'production',
  // Activate contests without payment when no Stripe key is set. Always on in
  // development; in production only for the public demo (DEMO_MODE=1).
  devPayments = !production || process.env.DEMO_MODE === '1',
  clock = Date.now,
} = {}) {
  const db = openDb(dbFile);
  const publicDir = join(ROOT, 'public');

  const handle = async (req, res) => {
    const url = new URL(req.url, 'http://local');
    const path = decodeURIComponent(url.pathname);
    try {
      if (path.startsWith('/api/')) return await handleApi(req, res, url, path);
      if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Method not allowed' });
      if (path.startsWith('/uploads/') && serveFile(req, res, uploadDir, path.slice(9))) return;
      const page = PAGES.find(([re]) => re.test(path));
      if (page && serveFile(req, res, publicDir, page[1])) return;
      if (!path.endsWith('.html') && serveFile(req, res, publicDir, path)) return;
      serveFile(req, res, publicDir, '404.html', 404) || res.writeHead(404).end();
    } catch (err) {
      console.error(err);
      if (!res.headersSent) sendJson(res, 500, { error: 'Something went wrong on our side.' });
    }
  };
  const server = createServer(handle);

  async function handleApi(req, res, url, path) {
    const route = compiled.find((r) => r.method === req.method && r.re.test(path));
    if (!route) return sendJson(res, 404, { error: 'Not found' });

    const isWebhook = path === '/api/stripe/webhook';
    if (req.method !== 'GET' && !isWebhook) {
      // CSRF: browsers can't send cross-site JSON without a preflight we never allow,
      // and a present Origin must match this host.
      if (!String(req.headers['content-type']).startsWith('application/json')) return sendJson(res, 415, { error: 'Send JSON.' });
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host) return sendJson(res, 403, { error: 'Cross-site request refused.' });
    }

    const rawBody = req.method === 'GET' ? '' : await readBody(req, 6 * 1024 * 1024);
    let body = {};
    if (rawBody && !isWebhook) {
      try { body = JSON.parse(rawBody); } catch { return sendJson(res, 400, { error: 'Invalid JSON.' }); }
    }

    const now = clock();
    const token = parseCookies(req.headers.cookie)[COOKIE];
    const proto = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
    const secure = production || proto === 'https';
    const cookies = [];
    const ctx = {
      db, now, req, url, body, rawBody, production, devPayments, uploadDir, token,
      ip: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress,
      origin: `${proto}://${req.headers.host}`,
      user: userFromToken(db, token, now),
      params: Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(route.re.exec(path)[i + 1])])),
      login: ({ token: t, maxAge }) => cookies.push(`${COOKIE}=${t}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`),
      logout: () => cookies.push(`${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`),
    };

    try {
      const data = await route.handler(ctx);
      sendJson(res, 200, data, cookies.length ? { 'Set-Cookie': cookies } : {});
    } catch (err) {
      if (err instanceof HttpError) return sendJson(res, err.status, { error: err.message, fields: err.details });
      throw err;
    }
  }

  return { server, db, handle };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 8000;
  createApp().server.listen(port, () => console.log(`Joridiro running on http://localhost:${port}`));
}
