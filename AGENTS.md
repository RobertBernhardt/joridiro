# AGENTS.md

Notes for coding agents working on this repo. Read README.md for the product and
the contest mechanics; this file covers how the code is put together and the
traps that already cost time.

## What this is

Joridiro: platforms post prize contests, their first sellers compete on real
results (orders, revenue, reviews), the platform confirms winners. Live demo:
https://joridiro.vercel.app (deployed from `main`).

## Hard constraints (from the owner)

- **No frameworks, no npm dependencies, no build step.** Vanilla ES modules in
  the browser, plain Node (>= 22.5) on the server. Don't add packages; dev tools
  are used from outside the repo (see "Checking your work").
- **No image files for illustrations.** All art is drawn in code (SVG + canvas).
  The only vector files are the original logo (`public/img/logo*.svg`) and
  `public/favicon.svg`.
- The app pages follow the designer's Figma file; the landing and 404 pages use
  the dark "Nocturne" scene style. Keep both looks.
- Copy is English, short, plain. The owner dislikes walls of text.

## Commands

```bash
npm run seed   # fresh demo DB (data/joridiro.db, or $DB_FILE)
npm start      # http://localhost:8000 (or $PORT)
npm run dev    # same with --watch
npm test       # node:test, rules + API (must stay green)
```

Demo logins, password `demo1234`: `organizer@demo.joridiro` (runs all demo
contests), `player@demo.joridiro` (takes part in all of them).

## Layout

```
public/shared/rules.js   THE domain logic, shared by server and browser:
                         SIZES/prices, TYPES, methodPoints, replay, deriveState,
                         validateContest. Pure functions, no I/O.
server/index.js          createApp({ dbFile, uploadDir, production, devPayments, clock })
                         -> { server, db, handle }. Routing, static files, CSP, pages.
server/api.js            every JSON route as [method, path, handler(ctx)].
server/db.js             node:sqlite schema + tiny migrations (ALTER TABLE ADD COLUMN).
server/auth.js           scrypt, hashed session tokens, login rate limit.
server/payments.js       Stripe Checkout via fetch, webhook HMAC check.
server/seed.js           demo data (4 contests with history, announcements, Q&A, survey).
api/handler.js           Vercel Function wrapper (demo: DB in /tmp, reseeded per cold start).
public/*.html            page shells: header, <main id="main">, footer, one module.
public/js/lib.js         html`` templates (escape by default, raw() to opt out), api(),
                         session(), formatting, icon(), help(), rocketSvg(), coverSvg(),
                         flames(), modal(), toast(), bindForm(), chrome() (header/footer).
public/js/pages/*.js     one module per page; they render into #main.
public/js/scenes/*.js    landing/404 animations (engine.js + one file per scene).
public/css/app.css       design tokens (:root) + all app styles.
public/css/scenes.css    dark landing/404 styles, overrides .site-header.dark.
test/                    rules.test.js, api.test.js (spins up createApp on :memory:).
```

## How things work

- **State is derived, never scheduled.** `deriveState()` computes phase,
  standings, milestones, grand prize and lottery from start time + score log +
  organizer decisions on every read. No cron, no background jobs. If you need
  "something happens at time T", express it as a function of `now`.
- Contests: columns for id/type/size/status/start_at, everything else is the
  `data` JSON column (title, texts, methods, rules, requirements, survey,
  company, theme). Requirements and rules are `{ title, text }` (strings are
  accepted and normalized). `survey` = up to 5 `{ question, answers[2..4] }`;
  answers per participant live in `participants.answers` (JSON array of indexes).
- Users: `users.details` JSON holds billing details and `avatar` (POST /api/me).
- Uploads: data URLs in JSON, saved by `saveImage()` (PNG/JPEG/WebP, 1.5 MB).
- Payments: without `STRIPE_SECRET_KEY` and outside production, checkout just
  activates the contest ("dev payments"). The Vercel demo runs that way.
- CSRF: non-GET requests must be `application/json` and same-origin.
- CSP is strict (`script-src 'self'`): **no inline scripts or inline event
  handlers.** Inline `style=""` is allowed.
- Templates: `html\`...\`` escapes every interpolation. Arrays are joined.
  `raw()` only for markup you built yourself (SVG strings etc.), never for
  user input.
- Page routes: server PAGES map in `server/index.js` and the rewrites in
  `vercel.json` must both list a new page.

## Design system (app pages)

Source: Figma file `KyUqNwr7E9fB8ZEXgprD7I` ("Joridiro"). Frames: "New Creating
the Contest" (node 1579:100391), "Contset-Participant View" (526:38360),
"Contest page- Organizer View" (526:38856), "Profile" (526:39683, 1186:57406).
The account only has **view** access and the **Figma Starter plan allows very
few MCP calls per month** (they ran out after ~20). Don't burn them on
screenshots you can't download: figma.com asset URLs are blocked by the sandbox
proxy, so `get_screenshot` only helps with `enableBase64Response: true`.

Better reference: the old SvelteKit frontend in git history (`git show
cc3d2ae:frontend/...`) is the designer's version as built. It runs with
`npm install --legacy-peer-deps`, `@sveltejs/vite-plugin-svelte@3` and
`vitePreprocess` imported from it in `svelte.config.js`; mock
`http://localhost:8000/user/me` with Playwright `route()`, and open
`/demo?data=QUARTERMEAL_LARGE_DEADLINE` for a contest page.

Tokens (CSS variables in `app.css`): Catamaran, radius 7px, line `#E6E6E9`,
soft fill `#F7F7F9`, band `#E6E6E9`, brand/orange `#EA3D09`, purple `#841BA0`
(score contests, selected cards), green `#4CBB25` (deadline contests), muted
`#6A7584`. Buttons are flat (no shadows). Section headers have a "?" tooltip
(`help()`).

## The scenes (landing, 404)

Performance rules learned the hard way (see README "The scenes"):
filters only on static background layers, no `mix-blend-mode` on full-screen
layers, static and moving content in separate SVG layers, no SVG masks on moving
content, loops run only while the section is visible, respect
`prefers-reduced-motion`. The caped hero is built from the real logo paths
(`scenes/hero-figure.js`); it is white on dark backgrounds only.

## Checking your work

- `npm test` before every commit.
- Visual checks: Chromium + Playwright are preinstalled outside the repo:
  `require('/opt/node22/lib/node_modules/playwright')`. Screenshot at 1440 and
  390 px wide and check `document.documentElement.scrollWidth - innerWidth`
  (horizontal overflow) on every page you touch.
- Log in inside Playwright with `fetch('/api/auth/login', …)` from a page on
  the same origin.
- Killing the dev server: `pkill -f "server/index.js"` also matches your own
  shell command line and kills it (exit 144). Use `kill $(pgrep -f "[s]erver/index.js")`.
- The sandbox can't reach `*.vercel.app` directly (403); use the Vercel MCP
  `web_fetch_vercel_url` to check the live site.

## Git and deploy

- Work on the feature branch you were given; the owner has authorized pushing
  the same commits to `main`, which auto-deploys to Vercel (project root `/`,
  framework "Other", output `public`).
- Secrets: never commit keys. Old Stripe test keys and a `key.pem` exist in
  history from 2023; they should be rotated, not reused.

## Not built yet

See README "What is not built yet": email verification/reset, payouts,
messaging, admin panel, contest editing, attachments in "About the contest",
persistent hosting for real use.
