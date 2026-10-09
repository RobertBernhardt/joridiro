// Contest rules shared by server and browser. Pure functions, no I/O.
//
// Nothing here is scheduled. Every deadline, milestone, winner and the lottery
// is derived from three facts: when the contest started, the log of score
// updates, and the organizer's confirm/reject decisions. Asking "what is the
// state?" at any moment gives the same answer a cron job would have produced,
// without the cron job.

export const DAY = 24 * 60 * 60 * 1000;
export const CONFIRM_WINDOW = 7 * DAY; // organizer must decide within 7 days, else auto-confirmed

export const TYPES = {
  deadline: { name: 'Deadline contest', short: 'Deadline', blurb: 'Most points when the clock runs out wins.' },
  score: { name: 'Score contest', short: 'Score', blurb: 'First to reach the target score wins.' },
};

// Prize structure per size. Amounts in EUR, net of VAT.
// Milestones: deadline contests use `days`, score contests use `points`.
export const SIZES = {
  small: {
    name: 'Small', level: 1,
    grandPrize: 250, days: 7, targetScore: 5,
    milestones: [],
    lottery: 0, fee: 45,
  },
  medium: {
    name: 'Medium', level: 2,
    grandPrize: 1500, days: 25, targetScore: 25,
    milestones: [{ days: 7, points: 5, prize: 300 }],
    lottery: 222, fee: 273,
  },
  large: {
    name: 'Large', level: 3,
    grandPrize: 5000, days: 45, targetScore: 100,
    milestones: [
      { days: 7, points: 10, prize: 500 },
      { days: 15, points: 30, prize: 1000 },
      { days: 30, points: 50, prize: 1500 },
    ],
    lottery: 666, fee: 829,
  },
};

export function prizePool(size) {
  const s = SIZES[size];
  return s.grandPrize + s.milestones.reduce((a, m) => a + m.prize, 0) + s.lottery;
}

export function price(size) {
  return prizePool(size) + SIZES[size].fee;
}

// "3 points for every 2 reviews" with value 5 -> floor(5 / 2) * 3 = 6
export function methodPoints(method, value) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return 0;
  return Math.floor(v / method.per) * method.points;
}

const dayKey = (t) => Math.floor(t / DAY);

// Replays the update log up to `until` (inclusive). Each update sets the
// participant's current cumulative value for one scoring method.
// Returns per-user totals, when that total was first reached, lottery tickets
// (one per calendar day with at least one update), and the first time each
// threshold was crossed.
export function replay(methods, participants, updates, until = Infinity, thresholds = []) {
  const users = new Map();
  for (const p of participants) {
    users.set(p.userId, {
      userId: p.userId, alias: p.alias, joinedAt: p.joinedAt,
      values: methods.map(() => 0), points: 0, reachedAt: p.joinedAt,
      days: new Set(), lastAt: null,
    });
  }
  const crossings = thresholds.map(() => []); // per threshold: [{userId, at}] in time order
  const crossed = thresholds.map(() => new Set());

  for (const u of updates) {
    if (u.at > until) break;
    const s = users.get(u.userId);
    if (!s || !methods[u.method]) continue;
    s.values[u.method] = Math.max(0, Number(u.value) || 0);
    const total = methods.reduce((a, m, i) => a + methodPoints(m, s.values[i]), 0);
    if (total !== s.points) s.reachedAt = u.at;
    s.points = total;
    s.days.add(dayKey(u.at));
    s.lastAt = u.at;
    thresholds.forEach((t, i) => {
      if (total >= t && !crossed[i].has(u.userId)) {
        crossed[i].add(u.userId);
        crossings[i].push({ userId: u.userId, at: u.at });
      }
    });
  }

  const standings = [...users.values()]
    .map((s) => ({ userId: s.userId, alias: s.alias, joinedAt: s.joinedAt, points: s.points, reachedAt: s.reachedAt,
      tickets: s.days.size, lastAt: s.lastAt, values: s.values }))
    .sort((a, b) => b.points - a.points || a.reachedAt - b.reachedAt || a.joinedAt - b.joinedAt);
  standings.forEach((s, i) => { s.rank = i + 1; });
  return { standings, crossings };
}

// Weighted pick: each ticket is one entry. `r` in [0, 1).
export function pickWeighted(entries, r) {
  const total = entries.reduce((a, e) => a + e.tickets, 0);
  if (!total) return null;
  let x = r * total;
  for (const e of entries) {
    if (x < e.tickets) return e.userId;
    x -= e.tickets;
  }
  return entries[entries.length - 1].userId;
}

// Full derived state of a contest at `now`.
//   contest:   { type, size, startAt (ms|null), methods: [{label, per, points}] }
//   participants: [{ userId, alias, joinedAt }]
//   updates:   [{ userId, method, value, at }] sorted by `at`
//   decisions: [{ prize, userId, decision: 'confirmed' | 'rejected', at }]
//   lotteryRandom(round) -> number in [0,1), deterministic per contest (server-side secret)
export function deriveState({ contest, participants, updates, decisions = [], now, lotteryRandom }) {
  const size = SIZES[contest.size];
  const methods = contest.methods;
  const startAt = contest.startAt;

  if (!startAt) {
    return { phase: 'draft', startAt: null, endsAt: null, standings: replay(methods, participants, []).standings, prizes: [] };
  }

  const rejectedFor = (key) => new Set(decisions.filter((d) => d.prize === key && d.decision === 'rejected').map((d) => d.userId));
  const confirmedFor = (key) => decisions.find((d) => d.prize === key && d.decision === 'confirmed');

  // Status of one prize given its trigger time and ordered candidate list.
  const settle = (key, triggerAt, ordered) => {
    if (triggerAt == null || triggerAt > now) return { status: 'upcoming', winner: null };
    const confirmed = confirmedFor(key);
    if (confirmed) return { status: 'confirmed', winner: confirmed.userId, decidedAt: confirmed.at };
    const rejected = rejectedFor(key);
    const candidate = ordered.find((id) => !rejected.has(id));
    if (!candidate) return { status: 'unclaimed', winner: null };
    // The confirmation window restarts after each rejection.
    const lastReject = Math.max(triggerAt, ...decisions.filter((d) => d.prize === key && d.decision === 'rejected').map((d) => d.at));
    const decideBy = lastReject + CONFIRM_WINDOW;
    if (now > decideBy) return { status: 'confirmed', winner: candidate, auto: true, decidedAt: decideBy };
    return { status: 'pending', winner: candidate, decideBy };
  };

  const prizes = [];
  let endsAt;
  let standings;

  if (contest.type === 'deadline') {
    endsAt = startAt + size.days * DAY;
    const at = (t) => replay(methods, participants, updates, t).standings.filter((s) => s.points > 0).map((s) => s.userId);
    size.milestones.forEach((m, i) => {
      const dueAt = startAt + m.days * DAY;
      const key = `milestone:${i}`;
      prizes.push({ key, kind: 'milestone', label: `Milestone ${i + 1}`, amount: m.prize, dueAt,
        rule: `Leader after day ${m.days}`, ...settle(key, dueAt, dueAt <= now ? at(dueAt) : []) });
    });
    prizes.push({ key: 'grand', kind: 'grand', label: 'Grand prize', amount: size.grandPrize, dueAt: endsAt,
      rule: `Leader after day ${size.days}`, ...settle('grand', endsAt, endsAt <= now ? at(endsAt) : []) });
    standings = replay(methods, participants, updates, Math.min(now, endsAt)).standings;
  } else {
    const thresholds = [...size.milestones.map((m) => m.points), size.targetScore];
    const { crossings } = replay(methods, participants, updates, now, thresholds);
    const grandCross = crossings[crossings.length - 1];
    const grandRejected = rejectedFor('grand');
    const winningCross = grandCross.find((c) => !grandRejected.has(c.userId));
    endsAt = winningCross ? winningCross.at : null; // open until someone legitimately reaches the target

    size.milestones.forEach((m, i) => {
      const key = `milestone:${i}`;
      const list = crossings[i].filter((c) => endsAt == null || c.at <= endsAt);
      const first = list.find((c) => !rejectedFor(key).has(c.userId));
      const trigger = first ? first.at : (endsAt != null && endsAt <= now ? endsAt : null);
      prizes.push({ key, kind: 'milestone', label: `Milestone ${i + 1}`, amount: m.prize, threshold: m.points,
        rule: `First to ${m.points} points`, ...settle(key, trigger, list.map((c) => c.userId)) });
    });
    prizes.push({ key: 'grand', kind: 'grand', label: 'Grand prize', amount: size.grandPrize, threshold: size.targetScore,
      rule: `First to ${size.targetScore} points`, ...settle('grand', endsAt, grandCross.map((c) => c.userId)) });
    standings = replay(methods, participants, updates, endsAt != null ? Math.min(now, endsAt) : now).standings;
  }

  if (size.lottery) {
    const grand = prizes.find((p) => p.key === 'grand');
    const lottery = { key: 'lottery', kind: 'lottery', label: 'Lottery', amount: size.lottery,
      rule: 'One ticket per day you update your score' };
    if (grand.status !== 'confirmed') {
      Object.assign(lottery, { status: 'upcoming', winner: null });
    } else {
      // Drawn the moment the grand prize is confirmed. Each rejection redraws without the rejected entrant.
      const rejected = rejectedFor('lottery');
      const entries = standings.filter((s) => s.tickets > 0 && !rejected.has(s.userId));
      const drawnAt = grand.decidedAt ?? now;
      const winner = entries.length ? pickWeighted(entries, lotteryRandom(rejected.size)) : null;
      Object.assign(lottery, settle('lottery', drawnAt, winner ? [winner] : []));
    }
    prizes.push(lottery);
  }

  const phase = endsAt != null && now >= endsAt ? 'ended' : 'live';
  return { phase, startAt, endsAt, standings, prizes };
}

// Validates the organizer's input for a new contest. Returns { errors, value }.
export function validateContest(input) {
  const errors = {};
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const list = (v, max, n) => (Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, n) : []);
  // Requirements and rules: { title, text }. A plain string is a text without title.
  const items = (v, n) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? { title: '', text: str(x, 300) }
    : { title: str(x?.title, 60), text: str(x?.text, 300) })).filter((x) => x.text).slice(0, n) : []);

  const value = {
    title: str(input.title, 90),
    type: input.type,
    size: input.size,
    platformUrl: str(input.platformUrl, 300),
    summary: str(input.summary, 400),
    purpose: str(input.purpose, 1500),
    audience: str(input.audience, 1500),
    howToWin: str(input.howToWin, 1500),
    boost: str(input.boost, 1500),
    tags: list(input.tags, 30, 6),
    rules: items(input.rules, 10),
    requirements: items(input.requirements, 12),
    // Multiple-choice questions participants answer when they join.
    survey: Array.isArray(input.survey) ? input.survey.slice(0, 5).map((q) => ({
      question: str(q?.question, 200), answers: list(q?.answers, 100, 4),
    })) : [],
    company: { name: str(input.company?.name, 80), url: str(input.company?.url, 300), about: str(input.company?.about, 600) },
    methods: Array.isArray(input.methods) ? input.methods.slice(0, 3).map((m) => ({
      label: str(m?.label, 60),
      per: Math.max(1, Math.floor(Number(m?.per) || 0)),
      points: Math.max(1, Math.floor(Number(m?.points) || 0)),
      note: str(m?.note, 200),
    })) : [],
    theme: Number.isInteger(input.theme) ? Math.abs(input.theme) % 6 : 0,
  };

  if (value.title.length < 4) errors.title = 'Give the contest a title (at least 4 characters).';
  if (!TYPES[value.type]) errors.type = 'Choose deadline or score.';
  if (!SIZES[value.size]) errors.size = 'Choose a size.';
  if (!/^https?:\/\/\S+\.\S+/.test(value.platformUrl)) errors.platformUrl = 'Link to the platform where participants compete (https://…).';
  if (value.summary.length < 20) errors.summary = 'Describe the contest in at least 20 characters.';
  if (!value.methods.length || value.methods.some((m) => !m.label)) errors.methods = 'Add at least one way to score, each with a name.';
  if (value.survey.some((q) => !q.question || q.answers.length < 2)) errors.survey = 'Every question needs a text and at least two answers.';
  return { errors, value };
}
