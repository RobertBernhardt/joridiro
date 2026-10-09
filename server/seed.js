// Fills the database with demo contests, users and score histories.
//   npm run seed            -> resets data/joridiro.db
// Demo logins (password for all: demo1234):
//   organizer@demo.joridiro  runs every demo contest
//   player@demo.joridiro     takes part in several
import { rmSync } from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { openDb } from './db.js';
import { hashPassword } from './auth.js';
import { DAY } from '../public/shared/rules.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Deterministic randomness so the demo looks the same every time.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CONTESTS = [
  {
    id: 'grow-on-quartermeal-in-london', type: 'deadline', size: 'large', startedDaysAgo: 12, theme: 0, pace: 1.6,
    aliases: ['Paul’s Kitchen', 'Night Kitchen', 'Wok Rocket', 'Pie Hard', 'Sauce Boss', 'Dumpling Duke', 'Curry Up', 'Bao Down', 'Flash Fry'],
    data: {
      title: 'Grow on Quartermeal with your restaurant in London',
      platformUrl: 'https://quartermeal.example.com',
      summary: 'Quartermeal delivers within 15 minutes or the meal is free. We need London kitchens that can cook that fast. Most points after 45 days takes £5,000.',
      purpose: 'We are launching in London and need restaurants whose dishes our riders can deliver while they are still hot.',
      audience: 'Restaurants, snack bars and pubs inside our London delivery zones that can finish a dish in under eight minutes.',
      howToWin: 'Collect points for every order, every £150 of revenue and every five-star review on Quartermeal. Most points after 45 days wins.',
      boost: 'Our riders are on standby from day one, and we run a city-wide poster and social campaign aimed at hungry Londoners for the full 45 days.',
      tags: ['Food delivery', 'London', 'Restaurants'],
      rules: ['Orders must be delivered within 15 minutes to count.', 'Only one review point per customer.'],
      requirements: ['Your restaurant is inside a Quartermeal London zone.', 'You own or manage the restaurant.'],
      company: { name: 'Quartermeal', url: 'https://quartermeal.example.com', about: 'Food delivery that guarantees 15 minutes from order to door.' },
      methods: [
        { label: 'orders', per: 1, points: 1, note: 'Every delivered order' },
        { label: '£ revenue', per: 150, points: 1, note: 'Revenue through Quartermeal' },
        { label: 'five-star reviews', per: 1, points: 3, note: 'Reviews from distinct customers' },
      ],
    },
    announcements: [
      [10, 'Our poster campaign is live in every Tube station between Zone 1 and 2. Expect a rush this week.'],
      [4, 'Milestone 1 is decided. Thanks for the photos of your fastest dishes, keep them coming.'],
    ],
    questions: [
      ['Can I combine points from two restaurants I own?', 'Yes. Register both kitchens on Quartermeal and report the combined numbers.'],
      ['What if a delivery takes 16 minutes?', 'Then it does not count for the contest, and the customer gets the meal for free.'],
    ],
  },
  {
    id: 'become-lord-of-the-rings', type: 'score', size: 'medium', startedDaysAgo: 5, theme: 1, pace: 1,
    aliases: ['Paul of the Shire', 'Goldfinger', 'Ringmaster', 'Sam G.', 'Dwarf Deals', 'Elven Smithy', 'Not Sauron'],
    data: {
      title: 'Become Lord of the Rings',
      platformUrl: 'https://ringbazaar.example.com',
      summary: 'I built a marketplace for rings and nobody is selling any. Rings are amazing. First seller to 25 points becomes Lord of the Rings and takes €1,500.',
      purpose: 'RingBazaar needs its first hundred ring sellers before the buyers will come.',
      audience: 'Jewellers, smiths and anyone in Middle-earth with a drawer full of rings.',
      howToWin: 'Sell rings on RingBazaar. Magic rings count ten times. The first to 25 points wins the grand prize.',
      boost: 'We are paying the town criers of all four Shire farthings to announce RingBazaar daily.',
      tags: ['Marketplace', 'Jewellery', 'Middle-earth'],
      rules: ['No eagles. I hate them.', 'Only metal rings. No screw nuts, you dwarves.', 'You must legally own every ring you sell.'],
      requirements: ['You sell rings on RingBazaar under your own name.'],
      company: { name: 'RingBazaar', url: 'https://ringbazaar.example.com', about: 'The marketplace for every ring in Middle-earth.' },
      methods: [
        { label: 'rings sold', per: 1, points: 1, note: 'Any ordinary ring' },
        { label: 'gold coins revenue', per: 100, points: 1, note: 'Gross revenue on RingBazaar' },
        { label: 'magic rings sold', per: 1, points: 10, note: 'Certified magic only' },
      ],
    },
    announcements: [[2, 'An eagle tried to register. Rejected. Rules are rules.']],
    questions: [['Does the One Ring count as magic?', 'It does, but you will not want to sell it.']],
  },
  {
    id: 'first-reality-gaming-tours-in-lisbon', type: 'deadline', size: 'small', startedDaysAgo: 2, theme: 2, pace: 0.7,
    aliases: ['Paul Walks', 'Tour Ninja', 'Alfama Ace', 'Tram 28 Quest'],
    data: {
      title: 'Launch the first reality-gaming tour in Lisbon',
      platformUrl: 'https://questwalk.example.com',
      summary: 'QuestWalk wants city tours that feel like a game. Most bookings for a new gamified tour in Lisbon after seven days wins €250.',
      purpose: 'Test whether game-like tours sell in Lisbon before we open the category worldwide.',
      audience: 'Guides in Lisbon who can design a tour with roles, puzzles and a winner.',
      howToWin: 'Publish a new tour on QuestWalk and collect bookings. Every booked guest is one point.',
      boost: 'We feature every contest tour on our Lisbon landing page and in our newsletter.',
      tags: ['Tours', 'Lisbon', 'Games'],
      rules: ['Maximum eight guests per tour.', 'The tour must have a way to name a winner.'],
      requirements: ['You are a licensed guide in Lisbon.'],
      company: { name: 'QuestWalk', url: 'https://questwalk.example.com', about: 'City tours you play instead of watch.' },
      methods: [{ label: 'booked guests', per: 1, points: 1, note: 'Paid bookings for your contest tour' }],
    },
    announcements: [],
    questions: [],
  },
  {
    id: 'first-to-five-booked-lessons', type: 'score', size: 'small', startedDaysAgo: 30, theme: 3, pace: 2.5, finished: true,
    aliases: ['Professor Paul', 'Pi Hard', 'Sine Language', 'Mr. Matrix', 'Calc Star'],
    data: {
      title: 'First tutor to five booked lessons',
      platformUrl: 'https://tutorly.example.com',
      summary: 'Tutorly opened its maths category. The first tutor with five booked lessons won €250.',
      purpose: 'Seed the new maths category with active tutors.',
      audience: 'Maths tutors for secondary school students.',
      howToWin: 'Every booked lesson is one point. First to five wins.',
      boost: 'Parent newsletter feature during the contest.',
      tags: ['Education', 'Tutoring'],
      rules: ['Lessons must be at least 45 minutes.'],
      requirements: ['You teach maths on Tutorly.'],
      company: { name: 'Tutorly', url: 'https://tutorly.example.com', about: 'Online tutoring for school students.' },
      methods: [{ label: 'booked lessons', per: 1, points: 1, note: '' }],
    },
    announcements: [],
    questions: [],
  },
];


export function seed(dbFile = process.env.DB_FILE || join(ROOT, 'data', 'joridiro.db'), now = Date.now()) {
  if (dbFile !== ':memory:') for (const ext of ['', '-wal', '-shm']) rmSync(dbFile + ext, { force: true });
  const db = openDb(dbFile);
  const rand = rng(42);
  const pass = hashPassword('demo1234');

  const user = (email, name) => {
    const id = randomUUID();
    db.run('INSERT INTO users (id, email, name, pass, created_at) VALUES (?, ?, ?, ?, ?)', id, email, name, pass, now - 60 * DAY);
    return id;
  };
  const organizer = user('organizer@demo.joridiro', 'Olivia Organizer');
  const player = user('player@demo.joridiro', 'Paul Player');
  const others = Array.from({ length: 10 }, (_, i) => user(`p${i}@demo.joridiro`, `Demo Player ${i + 1}`));

  db.tx(() => {
    for (const c of CONTESTS) {
      const startAt = now - c.startedDaysAgo * DAY - 3 * 3600e3;
      db.run(`INSERT INTO contests (id, organizer_id, type, size, status, start_at, data, seed, created_at)
        VALUES (?, ?, ?, ?, 'live', ?, ?, ?, ?)`, c.id, organizer, c.type, c.size, startAt,
        JSON.stringify({ ...c.data, type: c.type, size: c.size, theme: c.theme }), randomBytes(32).toString('hex'), startAt - DAY);

      const people = [player, ...others.slice(0, c.aliases.length - 1)];
      people.forEach((uid, i) => {
        const alias = c.aliases[i];
        const joinedAt = startAt + rand() * DAY * Math.min(2, c.startedDaysAgo * 0.4);
        db.run('INSERT INTO participants (contest_id, user_id, alias, profile_url, joined_at) VALUES (?, ?, ?, ?, ?)',
          c.id, uid, alias, `https://example.com/profile/${i}`, joinedAt);

        // A score history: roughly daily updates with growing cumulative values.
        const skill = 0.4 + rand() * 1.2;
        const values = c.data.methods.map(() => 0);
        const lastDay = c.finished ? 9 : c.startedDaysAgo;
        for (let day = 0; day <= lastDay; day++) {
          if (rand() < 0.3) continue;
          const at = Math.max(joinedAt + 3600e3, startAt + day * DAY + rand() * DAY * 0.8);
          if (at > now - 1800e3) break;
          c.data.methods.forEach((m, mi) => {
            values[mi] += Math.round(rand() * skill * c.pace * m.per * (mi === 2 && c.id.includes('ring') ? 0.05 : 1.2));
            db.run('INSERT INTO updates (contest_id, user_id, method, value, at) VALUES (?, ?, ?, ?, ?)', c.id, uid, mi, values[mi], at);
          });
        }
      });

      c.announcements.forEach(([ago, text]) => db.run('INSERT INTO announcements (contest_id, text, at) VALUES (?, ?, ?)', c.id, text, now - ago * DAY));
      c.questions.forEach(([q, a]) => {
        const askedAt = startAt + DAY * 0.5;
        db.run('INSERT INTO questions (contest_id, user_id, question, answer, asked_at, answered_at) VALUES (?, ?, ?, ?, ?, ?)',
          c.id, others[3], q, a, askedAt, askedAt + 7200e3);
      });
    }
  });
  return db;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed().close();
  console.log('Seeded demo data. Log in as organizer@demo.joridiro or player@demo.joridiro (password demo1234).');
}
