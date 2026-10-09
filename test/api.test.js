import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHmac } from 'node:crypto';
import { createApp } from '../server/index.js';
import { DAY } from '../shared/rules.js';

let base, app, clock = Date.UTC(2026, 3, 1, 9), tmp;
before(async () => {
  tmp = mkdtempSync(join(tmpdir(), 'joridiro-'));
  delete process.env.STRIPE_SECRET_KEY;
  app = createApp({ dbFile: ':memory:', uploadDir: join(tmp, 'uploads'), clock: () => clock });
  await new Promise((r) => app.server.listen(0, r));
  base = `http://127.0.0.1:${app.server.address().port}`;
});
after(() => { app.server.close(); rmSync(tmp, { recursive: true, force: true }); });

function client() {
  let cookie = '';
  return async (method, path, body) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, data: await res.json() };
  };
}

const contestInput = {
  title: 'Become Lord of the Rings', type: 'score', size: 'small', platformUrl: 'https://rings.example.com',
  summary: 'First seller to five points wins the grand prize.', methods: [{ label: 'rings sold', per: 1, points: 1 }],
  rules: ['No eagles'], tags: ['Rings'],
};

test('full contest lifecycle', async () => {
  const org = client(), ada = client(), bo = client();

  assert.equal((await org('POST', '/api/contests', contestInput)).status, 401);
  assert.equal((await org('POST', '/api/auth/register', { name: 'Olivia', email: 'o@x.io', password: 'short' })).status, 400);
  assert.equal((await org('POST', '/api/auth/register', { name: 'Olivia', email: 'o@x.io', password: 'longenough' })).status, 200);
  assert.equal((await ada('POST', '/api/auth/register', { name: 'Ada', email: 'a@x.io', password: 'longenough' })).status, 200);
  assert.equal((await bo('POST', '/api/auth/register', { name: 'Bo', email: 'b@x.io', password: 'longenough' })).status, 200);
  assert.equal((await bo('POST', '/api/auth/register', { name: 'Bo', email: 'b@x.io', password: 'longenough' })).status, 409);

  const bad = await org('POST', '/api/contests', { ...contestInput, platformUrl: 'nope' });
  assert.equal(bad.status, 400);
  assert.ok(bad.data.fields.platformUrl);

  const created = await org('POST', '/api/contests', contestInput);
  assert.equal(created.status, 200);
  assert.equal(created.data.price, 295);
  const id = created.data.id;
  assert.equal(id, 'become-lord-of-the-rings');

  // Drafts are invisible to everyone but the organizer.
  assert.equal((await ada('GET', `/api/contests/${id}`)).status, 404);
  assert.equal((await org('GET', `/api/contests/${id}`)).data.state.phase, 'draft');
  assert.equal((await ada('POST', `/api/contests/${id}/checkout`)).status, 404);

  // Dev mode without Stripe: checkout activates directly.
  assert.deepEqual((await org('POST', `/api/contests/${id}/checkout`)).data, { activated: true });
  const list = await ada('GET', '/api/contests');
  assert.equal(list.data.contests.length, 1);
  assert.equal(list.data.contests[0].phase, 'live');

  assert.equal((await org('POST', `/api/contests/${id}/join`, { alias: 'Me', profileUrl: 'https://x.io/me', acceptRules: true })).status, 400);
  assert.equal((await ada('POST', `/api/contests/${id}/join`, { alias: 'Ada', profileUrl: 'https://x.io/a' })).status, 400); // rules not accepted
  assert.equal((await ada('POST', `/api/contests/${id}/join`, { alias: 'Ada', profileUrl: 'https://x.io/a', acceptRules: true })).status, 200);
  assert.equal((await bo('POST', `/api/contests/${id}/join`, { alias: 'Ada', profileUrl: 'https://x.io/b', acceptRules: true })).status, 409);
  assert.equal((await bo('POST', `/api/contests/${id}/join`, { alias: 'Bo', profileUrl: 'https://x.io/b', acceptRules: true })).status, 200);

  clock += DAY;
  assert.equal((await ada('POST', `/api/contests/${id}/scores`, { values: [3] })).status, 200);
  assert.equal((await ada('POST', `/api/contests/${id}/scores`, { values: [-1] })).status, 400);
  clock += 1000;
  await bo('POST', `/api/contests/${id}/scores`, { values: [4] });

  const view = await ada('GET', `/api/contests/${id}`);
  assert.equal(view.data.role, 'participant');
  assert.equal(view.data.entry.points, 3);
  assert.equal(view.data.entry.rank, 2);
  assert.equal(view.data.standings[0].alias, 'Bo');
  assert.equal(view.data.standings[0].email, undefined, 'participants never see other people\'s details');

  clock += DAY;
  await ada('POST', `/api/contests/${id}/scores`, { values: [6] }); // reaches target 5 -> contest ends
  const ended = await org('GET', `/api/contests/${id}`);
  assert.equal(ended.data.state.phase, 'ended');
  const grand = ended.data.state.prizes.find((p) => p.key === 'grand');
  assert.equal(grand.status, 'pending');
  assert.equal(grand.winner.alias, 'Ada');
  assert.equal(grand.winner.email, 'a@x.io', 'the organizer sees who to verify');
  assert.equal((await bo('POST', `/api/contests/${id}/scores`, { values: [9] })).status, 400);

  // Organizer rejects Ada (score was wrong): the contest reopens.
  assert.equal((await org('POST', `/api/contests/${id}/decisions`, { prize: 'grand', userId: grand.winner.userId, decision: 'rejected' })).status, 200);
  assert.equal((await org('GET', `/api/contests/${id}`)).data.state.phase, 'live');
  assert.equal((await ada('POST', `/api/contests/${id}/decisions`, { prize: 'grand', userId: 'x', decision: 'confirmed' })).status, 403);

  // Q&A and announcements
  assert.equal((await bo('POST', `/api/contests/${id}/questions`, { question: 'Do silver rings count?' })).status, 200);
  const qs = (await ada('GET', `/api/contests/${id}`)).data.questions;
  assert.equal(qs.length, 0, 'unanswered questions are only visible to the asker and organizer');
  const orgQs = (await org('GET', `/api/contests/${id}`)).data.questions;
  await org('POST', `/api/contests/${id}/questions/${orgQs[0].id}/answer`, { answer: 'Yes, any metal.' });
  assert.equal((await ada('GET', `/api/contests/${id}`)).data.questions[0].answer, 'Yes, any metal.');
  assert.equal((await ada('POST', `/api/contests/${id}/announcements`, { text: 'hello' })).status, 403);
  assert.equal((await org('POST', `/api/contests/${id}/announcements`, { text: 'Silver counts.' })).status, 200);

  const dash = await ada('GET', '/api/dashboard');
  assert.equal(dash.data.joined.length, 1);
  assert.equal(dash.data.organizing.length, 0);
  assert.equal((await org('GET', '/api/dashboard')).data.organizing[0].participants, 2);
});

test('login, logout and CSRF guard', async () => {
  const c = client();
  assert.equal((await c('POST', '/api/auth/login', { email: 'o@x.io', password: 'wrong' })).status, 401);
  assert.equal((await c('POST', '/api/auth/login', { email: 'o@x.io', password: 'longenough' })).status, 200);
  assert.equal((await c('GET', '/api/me')).data.user.name, 'Olivia');
  await c('POST', '/api/auth/logout');
  assert.equal((await c('GET', '/api/me')).data.user, null);

  const form = await fetch(base + '/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  assert.equal(form.status, 415);
  const cross = await fetch(base + '/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' } });
  assert.equal(cross.status, 403);
});

test('stripe webhook activates only with a valid signature', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  const org = client();
  await org('POST', '/api/auth/login', { email: 'o@x.io', password: 'longenough' });
  const { data } = await org('POST', '/api/contests', { ...contestInput, title: 'Second contest here' });
  const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: { payment_status: 'paid', metadata: { contest_id: data.id } } } });
  const t = Math.floor(clock / 1000);
  const sig = createHmac('sha256', 'whsec_test').update(`${t}.${payload}`).digest('hex');

  const forged = await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'Stripe-Signature': `t=${t},v1=${'0'.repeat(64)}` }, body: payload });
  assert.equal(forged.status, 400);
  assert.equal((await org('GET', `/api/contests/${data.id}`)).data.state.phase, 'draft');

  const ok = await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'Stripe-Signature': `t=${t},v1=${sig}` }, body: payload });
  assert.equal(ok.status, 200);
  assert.equal((await org('GET', `/api/contests/${data.id}`)).data.state.phase, 'live');
});

test('pages and static files', async () => {
  for (const [path, status] of [['/', 200], ['/contests', 200], ['/c/anything', 200], ['/nope', 404], ['/shared/rules.js', 200], ['/../server/db.js', 404]]) {
    const res = await fetch(base + path);
    assert.equal(res.status, status, path);
  }
});
