import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DAY, CONFIRM_WINDOW, SIZES, price, prizePool, methodPoints, replay, pickWeighted, deriveState, validateContest } from '../shared/rules.js';

const T0 = Date.UTC(2026, 0, 1, 10);
const methods = [{ label: 'orders', per: 1, points: 1 }, { label: '€ revenue', per: 150, points: 1 }];
const people = [
  { userId: 'a', alias: 'Ada', joinedAt: T0 },
  { userId: 'b', alias: 'Bo', joinedAt: T0 + 1 },
  { userId: 'c', alias: 'Cy', joinedAt: T0 + 2 },
];
const fixedRandom = () => 0;

test('prices are pool plus fee', () => {
  assert.equal(prizePool('small'), 250);
  assert.equal(price('small'), 295);
  assert.equal(price('medium'), 2295);
  assert.equal(price('large'), 9495);
});

test('method points round down per completed unit', () => {
  assert.equal(methodPoints({ per: 150, points: 1 }, 400), 2);
  assert.equal(methodPoints({ per: 2, points: 3 }, 3), 3);
  assert.equal(methodPoints({ per: 1, points: 3 }, 2), 6);
  assert.equal(methodPoints({ per: 1, points: 1 }, -5), 0);
  assert.equal(methodPoints({ per: 1, points: 1 }, 'x'), 0);
});

test('replay keeps the latest cumulative value per method and ranks ties by who got there first', () => {
  const updates = [
    { userId: 'a', method: 0, value: 3, at: T0 + 10 },
    { userId: 'b', method: 0, value: 3, at: T0 + 20 },
    { userId: 'a', method: 0, value: 2, at: T0 + DAY }, // correction downwards
    { userId: 'a', method: 1, value: 160, at: T0 + DAY + 5 },
  ];
  const { standings } = replay(methods, people, updates);
  assert.deepEqual(standings.map((s) => [s.userId, s.points]), [['b', 3], ['a', 3], ['c', 0]]);
  assert.equal(standings[1].tickets, 2); // updated on two different days
  assert.equal(standings[0].rank, 1);
});

test('draft contests have no prizes', () => {
  const s = deriveState({ contest: { type: 'deadline', size: 'large', startAt: null, methods }, participants: people, updates: [], now: T0, lotteryRandom: fixedRandom });
  assert.equal(s.phase, 'draft');
  assert.equal(s.prizes.length, 0);
});

test('deadline contest: milestone goes to the leader at its due time, grand prize to the leader at the end', () => {
  const contest = { type: 'deadline', size: 'medium', startAt: T0, methods };
  const updates = [
    { userId: 'a', method: 0, value: 5, at: T0 + 2 * DAY },
    { userId: 'b', method: 0, value: 8, at: T0 + 10 * DAY }, // after milestone (day 7)
  ];
  const mid = deriveState({ contest, participants: people, updates, now: T0 + 8 * DAY, lotteryRandom: fixedRandom });
  assert.equal(mid.phase, 'live');
  const m1 = mid.prizes.find((p) => p.key === 'milestone:0');
  assert.equal(m1.status, 'pending');
  assert.equal(m1.winner, 'a');
  assert.equal(mid.prizes.find((p) => p.key === 'grand').status, 'upcoming');

  const end = deriveState({ contest, participants: people, updates, now: T0 + 26 * DAY, lotteryRandom: fixedRandom });
  assert.equal(end.phase, 'ended');
  assert.equal(end.endsAt, T0 + 25 * DAY);
  const grand = end.prizes.find((p) => p.key === 'grand');
  assert.equal(grand.winner, 'b');
  assert.equal(grand.status, 'pending');
  assert.equal(end.prizes.find((p) => p.key === 'lottery').status, 'upcoming');
});

test('rejecting a winner moves the prize to the next in line; silence auto-confirms', () => {
  const contest = { type: 'deadline', size: 'small', startAt: T0, methods };
  const updates = [
    { userId: 'a', method: 0, value: 9, at: T0 + DAY },
    { userId: 'b', method: 0, value: 4, at: T0 + DAY },
  ];
  const end = T0 + 7 * DAY;
  const decisions = [{ prize: 'grand', userId: 'a', decision: 'rejected', at: end + DAY }];
  const s = deriveState({ contest, participants: people, updates, decisions, now: end + 2 * DAY, lotteryRandom: fixedRandom });
  const grand = s.prizes.find((p) => p.key === 'grand');
  assert.equal(grand.winner, 'b');
  assert.equal(grand.status, 'pending');
  assert.equal(grand.decideBy, end + DAY + CONFIRM_WINDOW);

  const later = deriveState({ contest, participants: people, updates, decisions, now: end + DAY + CONFIRM_WINDOW + 1, lotteryRandom: fixedRandom });
  const g2 = later.prizes.find((p) => p.key === 'grand');
  assert.equal(g2.status, 'confirmed');
  assert.equal(g2.auto, true);
});

test('participants without points cannot win a deadline prize', () => {
  const contest = { type: 'deadline', size: 'small', startAt: T0, methods };
  const s = deriveState({ contest, participants: people, updates: [], now: T0 + 8 * DAY, lotteryRandom: fixedRandom });
  assert.equal(s.prizes.find((p) => p.key === 'grand').status, 'unclaimed');
});

test('score contest ends when the target is reached and reopens if that winner is rejected', () => {
  const contest = { type: 'score', size: 'small', startAt: T0, methods }; // target 5
  const updates = [
    { userId: 'a', method: 0, value: 6, at: T0 + DAY },
    { userId: 'b', method: 0, value: 2, at: T0 + 2 * DAY },
  ];
  const s = deriveState({ contest, participants: people, updates, now: T0 + 3 * DAY, lotteryRandom: fixedRandom });
  assert.equal(s.phase, 'ended');
  assert.equal(s.endsAt, T0 + DAY);
  assert.equal(s.prizes.find((p) => p.key === 'grand').winner, 'a');
  // b's update after the end does not count towards standings
  assert.equal(s.standings.find((x) => x.userId === 'b').points, 0);

  const decisions = [{ prize: 'grand', userId: 'a', decision: 'rejected', at: T0 + 3 * DAY }];
  const r = deriveState({ contest, participants: people, updates, decisions, now: T0 + 4 * DAY, lotteryRandom: fixedRandom });
  assert.equal(r.phase, 'live');
  assert.equal(r.endsAt, null);
  assert.equal(r.standings.find((x) => x.userId === 'b').points, 2);
});

test('score milestones go to the first to cross the threshold', () => {
  const contest = { type: 'score', size: 'large', startAt: T0, methods }; // milestones 10/30/50, target 100
  const updates = [
    { userId: 'b', method: 0, value: 12, at: T0 + DAY },
    { userId: 'a', method: 0, value: 40, at: T0 + 2 * DAY },
  ];
  const s = deriveState({ contest, participants: people, updates, now: T0 + 3 * DAY, lotteryRandom: fixedRandom });
  assert.equal(s.prizes[0].winner, 'b');
  assert.equal(s.prizes[1].winner, 'a');
  assert.equal(s.prizes[2].status, 'upcoming');
  assert.equal(s.phase, 'live');
});

test('lottery is drawn after the grand prize is confirmed, weighted by tickets', () => {
  const contest = { type: 'deadline', size: 'medium', startAt: T0, methods };
  const updates = [
    { userId: 'a', method: 0, value: 1, at: T0 + 1 * DAY },
    { userId: 'b', method: 0, value: 1, at: T0 + 1 * DAY },
    { userId: 'b', method: 0, value: 2, at: T0 + 2 * DAY },
    { userId: 'b', method: 0, value: 3, at: T0 + 3 * DAY },
  ];
  const end = T0 + 25 * DAY;
  const decisions = [{ prize: 'grand', userId: 'b', decision: 'confirmed', at: end + DAY }];
  const s = deriveState({ contest, participants: people, updates, decisions, now: end + 2 * DAY, lotteryRandom: () => 0.3 });
  const lot = s.prizes.find((p) => p.key === 'lottery');
  assert.equal(lot.status, 'pending');
  // entries in standings order: b (3 tickets), a (1 ticket); r=0.3 -> 1.2 of 4 -> b
  assert.equal(lot.winner, 'b');
  assert.equal(pickWeighted([{ userId: 'x', tickets: 1 }, { userId: 'y', tickets: 3 }], 0.3), 'y');
  assert.equal(pickWeighted([], 0.5), null);
});

test('contest validation', () => {
  const { errors } = validateContest({});
  assert.ok(errors.title && errors.type && errors.size && errors.platformUrl && errors.summary && errors.methods);
  const ok = validateContest({
    title: 'Be first on Quartermeal', type: 'deadline', size: 'small', platformUrl: 'https://quartermeal.example',
    summary: 'Restaurants in London compete on orders.', methods: [{ label: 'orders', per: 1, points: 1 }],
  });
  assert.deepEqual(ok.errors, {});
  assert.equal(SIZES[ok.value.size].days, 7);
});
