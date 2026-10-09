# Joridiro

Prize contests for platforms that need their first sellers. A platform puts up a
prize; sellers compete on real results on that platform (orders, revenue, reviews);
the platform confirms the winners. It turns the first-mover disadvantage of an
empty marketplace into a chance to win.

This is a rebuild of the 2023 version (SvelteKit + Express + MongoDB + Redis +
Google Cloud). It has **no framework and no npm dependencies**, so there is nothing
to keep updating.

## Run it

Requires Node.js 22.5 or newer (for the built-in `node:sqlite`).

```bash
npm run seed    # demo data -> data/joridiro.db
npm start       # http://localhost:8000
npm test        # rules + API tests (node:test)
```

Demo logins (password `demo1234`): `organizer@demo.joridiro` runs every demo
contest, `player@demo.joridiro` takes part in several.

Environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8000` | HTTP port |
| `DB_FILE` | `data/joridiro.db` | SQLite file |
| `UPLOAD_DIR` | `data/uploads` | uploaded covers and logos |
| `NODE_ENV` | | `production` forces secure cookies and disables dev payments |
| `STRIPE_SECRET_KEY` | | enables Stripe Checkout; without it contests go live without payment (dev only) |
| `STRIPE_WEBHOOK_SECRET` | | verifies `/api/stripe/webhook` |
| `STRIPE_AUTOMATIC_TAX` | | `1` turns on Stripe Tax at checkout |

## Layout

```
shared/rules.js     contest sizes, prices, scoring, standings, winners, lottery
                    (pure functions, used by server and browser)
server/             node:http server, SQLite, auth, Stripe, JSON API, demo seed
public/             static pages: plain HTML + ES modules, no build step
  js/lib.js         escaping html`` templates, fetch wrapper, header/footer, modals
  js/pages/         one module per page
  js/scenes/        the code-drawn animated scenes (SVG + canvas)
test/               node:test suites
```

### No cron jobs

The old backend scheduled milestone and deadline jobs with `node-schedule` and a
Mongo collection of cron entries, and restarted them on boot. Now nothing is
scheduled. A contest's state is derived on every read from three facts:

1. when it started (set when the payment succeeds),
2. the append-only log of score updates,
3. the organizer's confirm/reject decisions.

`deriveState()` in `shared/rules.js` turns these into the phase, standings, and
the status of every prize. Consequences:

- Deadline milestones go to whoever led at the due time (replayed from the log).
- Score contests end the moment someone reaches the target; if that winner is
  rejected, the contest reopens automatically.
- Each rejection passes the prize to the next in line; silence for 7 days counts
  as confirmation.
- The lottery is drawn once the grand prize is confirmed, weighted by tickets (one
  per calendar day with a score update). The draw is deterministic per contest
  (HMAC of a server-side secret), so it never changes between page loads and
  can't be predicted from the outside.

### Scoring

Organizers define up to three methods: "N points for every M units of X".
Participants report their **cumulative** totals; points are
`floor(value / M) * N`. (The old code used `floor(N / M * value)`, which counts
partial blocks: "3 points for every 2 reviews" gave 4 points for 3 reviews instead of 3.)

### Prices

| Size | Grand prize | Milestones | Lottery | Fee | Total (net) | Duration / target |
|---|---|---|---|---|---|---|
| Small | €250 | – | – | €45 | €295 | 7 days / 5 points |
| Medium | €1,500 | €300 | €222 | €273 | €2,295 | 25 days / 25 points |
| Large | €5,000 | €500 + €1,000 + €1,500 | €666 | €829 | €9,495 | 45 days / 100 points |

### Security basics

scrypt password hashes, random session tokens stored hashed, `HttpOnly` +
`SameSite=Lax` cookies, JSON-only POSTs with an Origin check (CSRF), a strict
Content-Security-Policy, escaped templates, path-traversal-safe static serving,
upload type and size limits, a login rate limit, verified Stripe webhooks.

## The scenes

The landing page and the 404 page are drawn entirely in code. The illustrations of
the old site (rocket and planets, dominos, the man pushing a ball, the egg on the
404 page) were redrawn as SVG + canvas in the "Nocturne" style: dark, neon, smoky.
They are animated and react to clicks:

- **Hero**: rocket → countdown, lift-off, comes back and lands · egg → cracks, the
  caped hero from the logo hatches and flies off · ringed planet → ring spins up,
  the moon swings by · sky → shooting star, every third click a UFO.
- **Problem**: a seller pushes a huge ball uphill and keeps slipping. Click → a
  prize trophy drops onto the crest, the seller gets a surge, the ball goes over
  the top and the town behind the hill lights up.
- **Dominos**: six stones, each 1.4× the last, labelled from "Contest" to "Network
  effects". The hero kicks the first one when the section scrolls into view; click
  to set them up again.
- **404**: a startled egg between two neon fours; its eyes follow the pointer,
  three pokes hatch the hero.

Performance rules that mattered (measured in headless software rendering, where
the scenes run at 40–60 fps at 1376×768):

- Filters only in the static background layer. One animated path inside the
  filtered background dropped the hero from 52 to 18 fps.
- No `mix-blend-mode` on full-screen layers.
- Static and moving content in separate SVG layers with `will-change`.
- A scene's loop only runs while the section actually has visible area.
- `prefers-reduced-motion` shows still frames.

Everything (HTML, CSS, JS, all four scenes) is about 53 KB gzipped. The old
site's images alone were about 17 MB.

## What is not built yet

These were in the old version or will be needed, but should be decided first:

- Email verification and password reset (needs a mail provider).
- Paying out winners: identity, tax ID, bank details, payouts (e.g. Stripe Connect).
- Messaging between organizer and participants (was socket.io), contest editing
  with admin approval, an admin panel.
- An end date for score contests nobody finishes.
- Updated legal pages: `public/legal/*-2023.pdf` and the imprint are copied from
  the 2023 site unchanged.
- Hosting: one Node process with a SQLite file needs a persistent disk (a small
  VPS, Fly.io or Railway). Serverless platforms like Vercel don't fit as is.
