// Vercel Function: runs the same request handler as server/index.js.
// Vercel has no persistent disk, so the database lives in /tmp and is filled
// with the demo data on every cold start. Fine for the public demo, not for
// real contests (see README, "Hosting").
import { existsSync } from 'node:fs';
import { createApp } from '../server/index.js';
import { seed } from '../server/seed.js';

const DB_FILE = '/tmp/joridiro.db';
if (!existsSync(DB_FILE)) seed(DB_FILE).close();
// The demo has no payment provider: contests go live without checkout.
const { handle } = createApp({ dbFile: DB_FILE, uploadDir: '/tmp/uploads', devPayments: !process.env.STRIPE_SECRET_KEY });

export default function handler(req, res) {
  // vercel.json rewrites /api/* and /uploads/* here and passes the original path as ?__path=
  const url = new URL(req.url, 'http://local');
  const path = url.searchParams.get('__path');
  if (path) {
    url.searchParams.delete('__path');
    req.url = path + (url.search || '');
  }
  return handle(req, res);
}
