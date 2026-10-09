// JSON API. Every handler gets ctx = { db, now, user, params, body, origin, ... }
// and returns data (sent as JSON) or throws via fail().
import { randomBytes, randomUUID, createHmac } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fail } from './http.js';
import { hashPassword, checkPassword, createSession, destroySession, allowAttempt } from './auth.js';
import { createCheckout, stripeEnabled, verifyWebhook } from './payments.js';
import { SIZES, TYPES, deriveState, validateContest, prizePool, price } from '../shared/rules.js';

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ---------- contest loading and state ---------- */

function loadContest(db, id) {
  const row = db.get('SELECT * FROM contests WHERE id = ?', id);
  if (!row) return null;
  return { ...row, data: JSON.parse(row.data) };
}

function facts(db, contestId) {
  return {
    participants: db.all('SELECT user_id, alias, profile_url, joined_at FROM participants WHERE contest_id = ? ORDER BY joined_at', contestId)
      .map((p) => ({ userId: p.user_id, alias: p.alias, profileUrl: p.profile_url, joinedAt: p.joined_at })),
    updates: db.all('SELECT user_id, method, value, at FROM updates WHERE contest_id = ? ORDER BY at, id', contestId)
      .map((u) => ({ userId: u.user_id, method: u.method, value: u.value, at: u.at })),
    decisions: db.all('SELECT prize, user_id, decision, at FROM decisions WHERE contest_id = ? ORDER BY at, id', contestId)
      .map((d) => ({ prize: d.prize, userId: d.user_id, decision: d.decision, at: d.at })),
  };
}

// Deterministic per contest and round, unknowable without the server-side seed.
const lotteryRandom = (seed) => (round) =>
  createHmac('sha256', seed).update(`lottery:${round}`).digest().readUIntBE(0, 6) / 2 ** 48;

function stateOf(db, row, now) {
  const f = facts(db, row.id);
  const state = deriveState({
    contest: { type: row.type, size: row.size, startAt: row.status === 'live' ? row.start_at : null, methods: row.data.methods },
    ...f, now, lotteryRandom: lotteryRandom(row.seed),
  });
  return { state, ...f };
}

function card(db, row, now) {
  const { state, participants } = stateOf(db, row, now);
  const d = row.data;
  return {
    id: row.id, title: d.title, summary: d.summary, tags: d.tags, theme: d.theme,
    cover: row.cover, logo: row.logo, company: d.company.name,
    type: row.type, size: row.size, pool: prizePool(row.size), grandPrize: SIZES[row.size].grandPrize,
    targetScore: SIZES[row.size].targetScore,
    phase: state.phase, startAt: state.startAt, endsAt: state.endsAt,
    participants: participants.length, best: state.standings[0]?.points ?? 0,
  };
}

function slugify(db, title) {
  const base = title.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'contest';
  let id = base;
  for (let i = 2; db.get('SELECT 1 FROM contests WHERE id = ?', id); i++) id = `${base}-${i}`;
  return id;
}

const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
function saveImage(dataUrl, uploadDir) {
  if (!dataUrl) return null;
  const m = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) fail(400, 'Images must be PNG, JPEG or WebP.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 1.5 * 1024 * 1024) fail(400, 'Images must be smaller than 1.5 MB.');
  mkdirSync(uploadDir, { recursive: true });
  const name = `${randomUUID()}.${IMAGE_TYPES[m[1]]}`;
  writeFileSync(join(uploadDir, name), buf);
  return `/uploads/${name}`;
}

function activate(db, contestId, now) {
  db.run("UPDATE contests SET status = 'live', start_at = ? WHERE id = ? AND status = 'draft'", now, contestId);
}

const requireUser = (ctx) => ctx.user || fail(401, 'Please log in first.');

function liveContestOr404(ctx) {
  const row = loadContest(ctx.db, ctx.params.id);
  if (!row || (row.status !== 'live' && row.organizer_id !== ctx.user?.id)) fail(404, 'Contest not found.');
  return row;
}

const isOrganizer = (ctx, row) => ctx.user && row.organizer_id === ctx.user.id;

/* ---------- handlers ---------- */

export const routes = [
  ['GET', '/api/config', () => ({ sizes: SIZES, types: TYPES, payments: stripeEnabled() ? 'stripe' : 'dev' })],

  ['POST', '/api/auth/register', (ctx) => {
    const name = str(ctx.body.name, 80);
    const email = str(ctx.body.email, 200).toLowerCase();
    const password = typeof ctx.body.password === 'string' ? ctx.body.password : '';
    const errors = {};
    if (name.length < 2) errors.name = 'Tell us your name.';
    if (!isEmail(email)) errors.email = 'That email address looks wrong.';
    if (password.length < 8) errors.password = 'Use at least 8 characters.';
    if (Object.keys(errors).length) fail(400, 'Please check the form.', errors);
    if (ctx.db.get('SELECT 1 FROM users WHERE email = ?', email)) fail(409, 'An account with this email already exists.', { email: 'Already registered. Log in instead?' });
    const id = randomUUID();
    ctx.db.run('INSERT INTO users (id, email, name, pass, created_at) VALUES (?, ?, ?, ?, ?)', id, email, name, hashPassword(password), ctx.now);
    ctx.login(createSession(ctx.db, id, ctx.now));
    return { user: { id, name, email } };
  }],

  ['POST', '/api/auth/login', (ctx) => {
    if (!allowAttempt(ctx.ip, ctx.now)) fail(429, 'Too many attempts. Try again in 15 minutes.');
    const email = str(ctx.body.email, 200).toLowerCase();
    const row = ctx.db.get('SELECT * FROM users WHERE email = ?', email);
    if (!row || !checkPassword(String(ctx.body.password || ''), row.pass)) fail(401, 'Email or password is wrong.');
    ctx.login(createSession(ctx.db, row.id, ctx.now));
    return { user: { id: row.id, name: row.name, email: row.email } };
  }],

  ['POST', '/api/auth/logout', (ctx) => {
    destroySession(ctx.db, ctx.token);
    ctx.logout();
    return { ok: true };
  }],

  ['GET', '/api/me', (ctx) => ({ user: ctx.user })],

  ['GET', '/api/contests', (ctx) => {
    const rows = ctx.db.all("SELECT * FROM contests WHERE status = 'live' ORDER BY start_at DESC");
    const cards = rows.map((r) => card(ctx.db, { ...r, data: JSON.parse(r.data) }, ctx.now));
    cards.sort((a, b) => (a.phase === 'live' ? 0 : 1) - (b.phase === 'live' ? 0 : 1));
    return { contests: cards };
  }],

  ['POST', '/api/contests', (ctx) => {
    const user = requireUser(ctx);
    const { errors, value } = validateContest(ctx.body);
    if (Object.keys(errors).length) fail(400, 'Please check the highlighted fields.', errors);
    const id = slugify(ctx.db, value.title);
    const cover = saveImage(ctx.body.cover, ctx.uploadDir);
    const logo = saveImage(ctx.body.logo, ctx.uploadDir);
    if (!value.company.name) value.company.name = user.name;
    const { type, size, ...data } = value;
    ctx.db.run(`INSERT INTO contests (id, organizer_id, type, size, status, data, cover, logo, seed, created_at)
      VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?)`, id, user.id, type, size, JSON.stringify({ ...data, type, size }), cover, logo,
      randomBytes(32).toString('hex'), ctx.now);
    return { id, price: price(size) };
  }],

  ['GET', '/api/contests/:id', (ctx) => {
    const row = liveContestOr404(ctx);
    const { state, participants } = stateOf(ctx.db, row, ctx.now);
    const organizer = isOrganizer(ctx, row);
    const me = ctx.user && participants.find((p) => p.userId === ctx.user.id);
    const byId = new Map(participants.map((p) => [p.userId, p]));
    const names = organizer
      ? new Map(ctx.db.all(`SELECT u.id, u.name, u.email FROM users u JOIN participants p ON p.user_id = u.id WHERE p.contest_id = ?`, row.id).map((u) => [u.id, u]))
      : new Map();

    const person = (userId) => {
      if (!userId) return null;
      const p = byId.get(userId);
      const out = { alias: p?.alias ?? 'Unknown', isMe: userId === ctx.user?.id };
      if (organizer) Object.assign(out, { userId, name: names.get(userId)?.name, email: names.get(userId)?.email, profileUrl: p?.profileUrl });
      return out;
    };

    const d = row.data;
    const announcements = ctx.db.all('SELECT id, text, at FROM announcements WHERE contest_id = ? ORDER BY at DESC', row.id);
    const questions = ctx.db.all('SELECT id, user_id, question, answer, asked_at, answered_at FROM questions WHERE contest_id = ? ORDER BY asked_at', row.id)
      .filter((q) => q.answer || organizer || q.user_id === ctx.user?.id)
      .map((q) => ({ id: q.id, question: q.question, answer: q.answer, askedAt: q.asked_at, mine: q.user_id === ctx.user?.id }));

    return {
      contest: {
        id: row.id, status: row.status, type: row.type, size: row.size, cover: row.cover, logo: row.logo,
        title: d.title, summary: d.summary, purpose: d.purpose, audience: d.audience, howToWin: d.howToWin, boost: d.boost,
        tags: d.tags, rules: d.rules, requirements: d.requirements, company: d.company, methods: d.methods,
        platformUrl: d.platformUrl, theme: d.theme, pool: prizePool(row.size), price: price(row.size),
      },
      state: {
        phase: state.phase, startAt: state.startAt, endsAt: state.endsAt,
        prizes: state.prizes.map((p) => ({ ...p, winner: person(p.winner) })),
      },
      standings: state.standings.map((s) => ({ ...person(s.userId), rank: s.rank, points: s.points, tickets: s.tickets, lastAt: s.lastAt })),
      role: organizer ? 'organizer' : me ? 'participant' : 'visitor',
      entry: me ? { alias: me.alias, profileUrl: me.profileUrl, ...(() => {
        const s = state.standings.find((x) => x.userId === me.userId);
        return { values: s.values, points: s.points, rank: s.rank, tickets: s.tickets, lastAt: s.lastAt };
      })() } : null,
      announcements,
      questions,
    };
  }],

  ['POST', '/api/contests/:id/checkout', async (ctx) => {
    requireUser(ctx);
    const row = loadContest(ctx.db, ctx.params.id);
    if (!row || !isOrganizer(ctx, row)) fail(404, 'Contest not found.');
    if (row.status !== 'draft') fail(400, 'This contest is already live.');
    if (!stripeEnabled()) {
      if (ctx.production) fail(503, 'Payments are not configured.');
      activate(ctx.db, row.id, ctx.now); // dev mode: no payment provider, go live immediately
      return { activated: true };
    }
    const session = await createCheckout({ id: row.id, size: row.size }, ctx.origin);
    ctx.db.run('UPDATE contests SET checkout_id = ? WHERE id = ?', session.id, row.id);
    return { url: session.url };
  }],

  ['POST', '/api/stripe/webhook', (ctx) => {
    const event = verifyWebhook(ctx.rawBody, ctx.req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET, ctx.now);
    if (!event) fail(400, 'Invalid signature.');
    const obj = event.data?.object;
    const paid = (event.type === 'checkout.session.completed' && obj?.payment_status === 'paid')
      || event.type === 'checkout.session.async_payment_succeeded';
    if (paid && obj.metadata?.contest_id) activate(ctx.db, obj.metadata.contest_id, ctx.now);
    return { received: true };
  }],

  ['POST', '/api/contests/:id/join', (ctx) => {
    const user = requireUser(ctx);
    const row = liveContestOr404(ctx);
    if (isOrganizer(ctx, row)) fail(400, "You can't join your own contest.");
    const { state } = stateOf(ctx.db, row, ctx.now);
    if (state.phase !== 'live') fail(400, 'This contest is not open.');
    const alias = str(ctx.body.alias, 30);
    const profileUrl = str(ctx.body.profileUrl, 300);
    const errors = {};
    if (alias.length < 2) errors.alias = 'Pick an alias of at least 2 characters.';
    if (!/^https?:\/\/\S+\.\S+/.test(profileUrl)) errors.profileUrl = 'Paste the link to your profile on the platform.';
    if (ctx.body.acceptRules !== true) errors.acceptRules = 'You need to accept the requirements and rules.';
    if (Object.keys(errors).length) fail(400, 'Please check the form.', errors);
    if (ctx.db.get('SELECT 1 FROM participants WHERE contest_id = ? AND user_id = ?', row.id, user.id)) fail(400, 'You already joined.');
    if (ctx.db.get('SELECT 1 FROM participants WHERE contest_id = ? AND alias = ?', row.id, alias)) fail(409, 'Alias taken.', { alias: 'Someone already uses this alias here.' });
    ctx.db.run('INSERT INTO participants (contest_id, user_id, alias, profile_url, joined_at) VALUES (?, ?, ?, ?, ?)', row.id, user.id, alias, profileUrl, ctx.now);
    return { ok: true };
  }],

  ['POST', '/api/contests/:id/scores', (ctx) => {
    const user = requireUser(ctx);
    const row = liveContestOr404(ctx);
    if (!ctx.db.get('SELECT 1 FROM participants WHERE contest_id = ? AND user_id = ?', row.id, user.id)) fail(403, 'Join the contest first.');
    const { state } = stateOf(ctx.db, row, ctx.now);
    if (state.phase !== 'live') fail(400, 'This contest has ended.');
    const values = Array.isArray(ctx.body.values) ? ctx.body.values : [];
    const methods = row.data.methods;
    if (values.length !== methods.length || values.some((v) => !Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > 1e9)) {
      fail(400, 'Enter a number of zero or more for every scoring method.');
    }
    const current = ctx.db.all(`SELECT method, value FROM updates WHERE id IN
      (SELECT MAX(id) FROM updates WHERE contest_id = ? AND user_id = ? GROUP BY method)`, row.id, user.id);
    const prev = new Map(current.map((c) => [c.method, c.value]));
    ctx.db.tx(() => {
      values.forEach((v, i) => {
        // Always log at least one row so the daily lottery ticket counts even when nothing changed.
        if (Number(v) !== (prev.get(i) ?? 0) || i === 0) {
          ctx.db.run('INSERT INTO updates (contest_id, user_id, method, value, at) VALUES (?, ?, ?, ?, ?)', row.id, user.id, i, Number(v), ctx.now);
        }
      });
    });
    return { ok: true };
  }],

  ['POST', '/api/contests/:id/announcements', (ctx) => {
    const row = liveContestOr404(ctx);
    if (!isOrganizer(ctx, row)) fail(403, 'Only the organizer can post announcements.');
    const text = str(ctx.body.text, 1000);
    if (text.length < 3) fail(400, 'Write something first.');
    ctx.db.run('INSERT INTO announcements (contest_id, text, at) VALUES (?, ?, ?)', row.id, text, ctx.now);
    return { ok: true };
  }],

  ['DELETE', '/api/contests/:id/announcements/:aid', (ctx) => {
    const row = liveContestOr404(ctx);
    if (!isOrganizer(ctx, row)) fail(403, 'Only the organizer can delete announcements.');
    ctx.db.run('DELETE FROM announcements WHERE id = ? AND contest_id = ?', Number(ctx.params.aid), row.id);
    return { ok: true };
  }],

  ['POST', '/api/contests/:id/questions', (ctx) => {
    const user = requireUser(ctx);
    const row = liveContestOr404(ctx);
    const question = str(ctx.body.question, 600);
    if (question.length < 5) fail(400, 'Ask a complete question.');
    ctx.db.run('INSERT INTO questions (contest_id, user_id, question, asked_at) VALUES (?, ?, ?, ?)', row.id, user.id, question, ctx.now);
    return { ok: true };
  }],

  ['POST', '/api/contests/:id/questions/:qid/answer', (ctx) => {
    const row = liveContestOr404(ctx);
    if (!isOrganizer(ctx, row)) fail(403, 'Only the organizer can answer.');
    const answer = str(ctx.body.answer, 1500);
    if (answer.length < 2) fail(400, 'Write an answer first.');
    ctx.db.run('UPDATE questions SET answer = ?, answered_at = ? WHERE id = ? AND contest_id = ?', answer, ctx.now, Number(ctx.params.qid), row.id);
    return { ok: true };
  }],

  ['POST', '/api/contests/:id/decisions', (ctx) => {
    const row = liveContestOr404(ctx);
    if (!isOrganizer(ctx, row)) fail(403, 'Only the organizer confirms winners.');
    const { state } = stateOf(ctx.db, row, ctx.now);
    const prize = state.prizes.find((p) => p.key === ctx.body.prize);
    if (!prize || prize.status !== 'pending') fail(400, 'This prize is not waiting for a decision.');
    if (prize.winner !== ctx.body.userId) fail(409, 'The standings changed. Reload and decide again.');
    const decision = ctx.body.decision === 'confirmed' ? 'confirmed' : ctx.body.decision === 'rejected' ? 'rejected' : fail(400, 'Unknown decision.');
    ctx.db.run('INSERT INTO decisions (contest_id, prize, user_id, decision, at) VALUES (?, ?, ?, ?, ?)', row.id, prize.key, prize.winner, decision, ctx.now);
    return { ok: true };
  }],

  ['GET', '/api/dashboard', (ctx) => {
    const user = requireUser(ctx);
    const organizing = ctx.db.all('SELECT * FROM contests WHERE organizer_id = ? ORDER BY created_at DESC', user.id).map((r) => {
      const row = { ...r, data: JSON.parse(r.data) };
      const { state } = stateOf(ctx.db, row, ctx.now);
      return { ...card(ctx.db, row, ctx.now), status: row.status, price: price(row.size),
        pendingDecisions: state.prizes.filter((p) => p.status === 'pending').length };
    });
    const joined = ctx.db.all(`SELECT c.* FROM contests c JOIN participants p ON p.contest_id = c.id
      WHERE p.user_id = ? ORDER BY p.joined_at DESC`, user.id).map((r) => {
      const row = { ...r, data: JSON.parse(r.data) };
      const { state } = stateOf(ctx.db, row, ctx.now);
      const me = state.standings.find((s) => s.userId === user.id);
      const won = state.prizes.filter((p) => p.winner === user.id).map((p) => ({ label: p.label, amount: p.amount, status: p.status }));
      return { ...card(ctx.db, row, ctx.now), rank: me?.rank, points: me?.points ?? 0, tickets: me?.tickets ?? 0, lastAt: me?.lastAt, won };
    });
    return { user, organizing, joined };
  }],
];
