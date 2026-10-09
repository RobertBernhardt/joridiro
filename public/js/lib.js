// Small helpers shared by every page. No framework: tagged templates that escape by default.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Raw(String(s));
const fmt = (v) => (v instanceof Raw ? v.s : Array.isArray(v) ? v.map(fmt).join('') : v === false || v == null ? '' : esc(v));
export const html = (strings, ...vals) => raw(strings.reduce((out, s, i) => out + s + (i < vals.length ? fmt(vals[i]) : ''), ''));
export const render = (el, tpl) => { el.innerHTML = fmt(tpl); return el; };

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- API ---------- */
export class ApiError extends Error {
  constructor(status, message, fields) { super(message); this.status = status; this.fields = fields || {}; }
}
export async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body !== undefined || method !== 'GET' ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : method !== 'GET' ? '{}' : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || 'Something went wrong.', data.fields);
  return data;
}

let mePromise;
export const session = () => (mePromise ||= api('GET', '/api/me').then((d) => d.user).catch(() => null));
export const loginUrl = () => `/login?next=${encodeURIComponent(location.pathname + location.search)}`;

/* ---------- formatting ---------- */
const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const money = (n) => eur.format(n);
export const num = (n) => new Intl.NumberFormat('en-IE').format(n);
export const date = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const dateTime = (t) => `${new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ${new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
export const perUnit = (m) => (m.per === 1 ? `for each of your ${m.label}` : `for every ${num(m.per)} ${m.label}`);
export function duration(ms) {
  if (ms <= 0) return '0m';
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}
export function ago(t) {
  const s = (Date.now() - t) / 1000;
  if (s < 90) return 'just now';
  if (s < 5400) return `${Math.round(s / 60)} min ago`;
  if (s < 129600) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} days ago`;
}
export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

/* ---------- brand art (all code, no image files) ---------- */

// The original Joridiro logo (vector files in /img). On dark backgrounds the figure and
// the wordmark are white.
export const logoHtml = (dark = false) => `<a class="logo" href="/" aria-label="Joridiro home">
  <img src="/img/logo${dark ? '-white' : ''}.svg" alt="Joridiro" width="165" height="42"></a>`;

// Generated cover art for contests without an uploaded image. Six palettes, deterministic shapes.
const THEMES = [
  ['#05041c', '#1a0b3d', '#ebed04', '#3658e2', '#ff3fe0'],
  ['#0c0220', '#2a0b2e', '#ffcf70', '#b035d0', '#ea3d09'],
  ['#020b1c', '#08263a', '#c6ff3a', '#2546c8', '#20e3b2'],
  ['#140414', '#3a0a24', '#ff5028', '#ff3fe0', '#ffcf70'],
  ['#03041a', '#16123f', '#9c88cc', '#3658e2', '#c6ff3a'],
  ['#0a0a0a', '#1f1530', '#ea3d09', '#ffcf70', '#841ba0'],
];
export function coverSvg(theme = 0, seedText = 'x') {
  const [d1, d2, a, b, c] = THEMES[theme % THEMES.length];
  let h = 2166136261;
  for (const ch of seedText) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const r = () => ((h = Math.imul(h ^ (h >>> 13), 1274126177)) >>> 0) / 4294967296;
  const id = `cv${theme}${(h >>> 0).toString(36)}`;
  const ribbons = [0, 1, 2].map((i) => {
    const y = 60 + r() * 220, k = 60 + r() * 120;
    return `<path d="M-20 ${y} C 200 ${y - k} 420 ${y + k} 820 ${y - k / 2}" stroke="${[a, b, c][i]}" stroke-width="${1.5 + r() * 2.5}" fill="none" opacity=".75" filter="url(#${id}g)"/>`;
  }).join('');
  const stars = Array.from({ length: 40 }, () => `<circle cx="${(r() * 800).toFixed(0)}" cy="${(r() * 350).toFixed(0)}" r="${(r() * 1.3 + .3).toFixed(1)}" fill="#fff" opacity="${(r() * .7 + .2).toFixed(2)}"/>`).join('');
  const ox = 520 + r() * 180, oy = 120 + r() * 120;
  return `<svg viewBox="0 0 800 350" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${d2}"/><stop offset="1" stop-color="${d1}"/></linearGradient>
    <radialGradient id="${id}o"><stop offset="0" stop-color="${a}" stop-opacity=".95"/><stop offset=".35" stop-color="${a}" stop-opacity=".35"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}o2"><stop offset="0" stop-color="${b}" stop-opacity=".6"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>
    <filter id="${id}g" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="800" height="350" fill="url(#${id}bg)"/>
  <circle cx="${ox}" cy="${oy}" r="260" fill="url(#${id}o)"/>
  <circle cx="${120 + r() * 120}" cy="${260 + r() * 60}" r="240" fill="url(#${id}o2)"/>
  ${stars}${ribbons}
  <ellipse cx="${ox}" cy="${oy}" rx="38" ry="48" fill="${d1}" stroke="${a}" stroke-width="2" opacity=".9"/>
</svg>`;
}

// Level flames: green for deadline contests, purple for score contests, like the designer's.
const FLAME = (on, color) => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="${on ? color : '#e6e6e9'}"/><path d="M12 5c1 3 5 4.5 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2-4 0 1.5.8 2.5 2 2.8C10.4 10 11 7 12 5z" fill="#fff"/></svg>`;
export const flames = (level, type = 'deadline') => raw(`<span class="flames" title="Level ${level} of 3">${[1, 2, 3].map((i) => FLAME(i <= level, type === 'score' ? '#841ba0' : '#4cbb25')).join('')}</span>`);

/* ---------- UI bits ---------- */
export function toast(message, kind = '') {
  let host = $('.toast-host');
  if (!host) { host = document.createElement('div'); host.className = 'toast-host'; host.setAttribute('role', 'status'); document.body.append(host); }
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  t.textContent = message;
  host.append(t);
  setTimeout(() => t.remove(), 4200);
}

export function modal(title, body) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-head"><h2 id="modal-title">${esc(title)}</h2><button class="modal-close" aria-label="Close">×</button></div>
    <div class="modal-body">${body}</div></div>`;
  const prev = document.activeElement;
  const close = () => { wrap.remove(); removeEventListener('keydown', onKey); prev?.focus?.(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('.modal-close')) close(); });
  addEventListener('keydown', onKey);
  document.body.append(wrap);
  (wrap.querySelector('input, textarea, select, button:not(.modal-close)') || wrap.querySelector('button'))?.focus();
  return { el: wrap, close };
}

// Wires a form: collects values, shows server field errors next to inputs.
export function bindForm(form, submit) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    form.querySelectorAll('.field-error, .form-error').forEach((n) => n.remove());
    form.querySelectorAll('.has-error').forEach((n) => n.classList.remove('has-error'));
    btn && (btn.disabled = true);
    try {
      await submit(Object.fromEntries(new FormData(form)), form);
    } catch (err) {
      if (!(err instanceof ApiError)) { console.error(err); err = new ApiError(0, 'Network problem. Please try again.'); }
      let placed = false;
      for (const [name, msg] of Object.entries(err.fields)) {
        const input = form.querySelector(`[name="${name}"]`) || form.querySelector(`[data-field="${name}"]`);
        const field = input?.closest('.field') || input;
        if (!field) continue;
        field.classList.add('has-error');
        field.insertAdjacentHTML('beforeend', `<div class="field-error">${esc(msg)}</div>`);
        placed = true;
      }
      if (!placed || err.status !== 400) form.insertAdjacentHTML('afterbegin', `<div class="form-error" role="alert">${esc(err.message)}</div>`);
      form.querySelector('.has-error .input, .has-error input')?.focus();
    } finally {
      btn && (btn.disabled = false);
    }
  });
}

/* ---------- icons (stroke icons on a 24px grid) ---------- */
const ICONS = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  help: '<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4.1M12 17.6v.1"/>',
  link: '<path d="M9.5 14.5l5-5M8 11l-2.2 2.2a3.5 3.5 0 0 0 5 5L13 16M16 13l2.2-2.2a3.5 3.5 0 0 0-5-5L11 8"/>',
  share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1"/>',
  trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0V4zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 14v4m-4 2h8"/>',
  flag: '<path d="M6 21V4m0 1h11l-2.5 4L17 13H6"/>',
  ticket: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M5.6 5.6l2.5 2.5M15.9 15.9l2.5 2.5M18.4 5.6l-2.5 2.5M8.1 15.9l-2.5 2.5"/>',
  podium: '<path d="M9 21V10h6v11M3 21v-7h6M15 21v-5h6v5M3 21h18M12 3l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
  coins: '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 10v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4M5 14v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4"/>',
  gauge: '<path d="M4.9 18.5A9 9 0 1 1 19.1 18.5"/><path d="M12 13l4-5"/><circle cx="12" cy="13" r="1.2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-9.5v.5"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  crosshair: '<circle cx="12" cy="12" r="8"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',
  pointer: '<path d="M4 11h9a2 2 0 0 0 0-4H9.5M13 11h3a2 2 0 0 1 0 4h-1M15 15h-1.5a2 2 0 0 1 0 4H8a4 4 0 0 1-4-4v-4l3.5-5.5"/>',
  idcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16a3 3 0 0 1 6 0M14 10h4M14 14h3"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 5"/>',
  tag: '<path d="M3 12V4h8l9 9-8 8-9-9z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  megaphone: '<path d="M3 10v4h3l8 5V5L6 10H3zM18 9a4 4 0 0 1 0 6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5z"/>',
  checklist: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 12l3 3 7-7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  edit: '<path d="M16.5 3.5l4 4L8 20H4v-4z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
  upload: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 8a4 4 0 0 1 0 8M12 12v9M9 15l3-3 3 3"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
  usersquare: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M6.5 21a5.5 5.5 0 0 1 11 0"/>',
  logout: '<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>',
  question: '<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4.1M12 17.6v.1"/>',
};
export const icon = (name, cls = 'ico') => raw(`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`);
// A small "?" that explains something on hover or focus.
export const help = (text) => html`<button type="button" class="help-btn" aria-label="${text}">${icon('help')}<span class="tip" role="tooltip">${text}</span></button>`;

// Rockets for the three contest sizes, drawn in code like the rest of the art.
// Small is a stubby orange one, medium a classic white one, large adds two boosters.
const ROCKETS = {
  small: { body: '#ff8a4c', nose: '#ea3d09', fin: '#c23206', sx: 1.22, sy: 0.82, boosters: false },
  medium: { body: '#f4f1ff', nose: '#ea3d09', fin: '#ea3d09', sx: 1, sy: 1, boosters: false },
  large: { body: '#f4f1ff', nose: '#b035d0', fin: '#841ba0', sx: 1, sy: 1, boosters: true },
};
export function rocketSvg(size, cls = 'rocket') {
  const r = ROCKETS[size];
  const booster = (x) => `<g transform="translate(${x} 0)"><path d="M0 40c0-6 2-10 4-12 2 2 4 6 4 12v18H0z" fill="${r.body}" stroke="#2a2340" stroke-opacity=".25"/>
    <path d="M0 40c0-6 2-10 4-12 2 2 4 6 4 12z" fill="${r.nose}"/><path d="M1 58h6l1.5 6c-1.5 3-7.5 3-9 0z" fill="#ffb300"/></g>`;
  return raw(`<svg class="${cls}" viewBox="0 0 64 80" aria-hidden="true"><g transform="translate(32 40) scale(${r.sx} ${r.sy}) translate(-32 -40)">
    <path d="M26 62c0 8 6 16 6 16s6-8 6-16z" fill="#ffb300"/><path d="M29 62c0 5 3 10 3 10s3-5 3-10z" fill="#ffe08a"/>
    <path d="M22 42L11 58v6l13-6zM42 42l11 16v6l-13-6z" fill="${r.fin}"/>
    ${r.boosters ? booster(12) + booster(44) : ''}
    <path d="M32 3c11 9 14 26 12 45l-2 14H22l-2-14C18 29 21 12 32 3z" fill="${r.body}" stroke="#2a2340" stroke-opacity=".25"/>
    <path d="M32 3c5 4 8.5 10 10.3 17H21.7C23.5 13 27 7 32 3z" fill="${r.nose}"/>
    <circle cx="32" cy="32" r="6.5" fill="#3658e2" stroke="#fff" stroke-width="2.5"/><circle cx="30" cy="30" r="1.8" fill="#fff" opacity=".7"/>
    <path d="M30.5 48h3v15h-3z" fill="${r.fin}"/><path d="M23 62h18l-2 3H25z" fill="#6a7584"/>
  </g></svg>`);
}

/* ---------- page chrome ---------- */
export async function chrome({ active = '', dark = false } = {}) {
  const header = $('#site-header');
  const user = await session();
  if (header) {
    header.className = `site-header${dark ? ' dark' : ''}`;
    const link = (href, label, key) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`;
    header.innerHTML = `<div class="wrap">
      ${logoHtml(dark)}
      <button class="menu-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="nav">${link('/#how', 'How it works', 'how')}${link('/contests', 'Contests', 'contests')}${link('/#faq', 'FAQ', 'faq')}</nav>
      <div class="header-actions">${user
        ? `<a class="header-user" href="/dashboard" title="Your dashboard">${icon('user')}${esc(user.name.split(' ')[0])}</a>`
        : `<a class="header-user" href="${loginUrl()}">${icon('user')}Log in</a>`}
        <a class="btn btn-primary" href="/create"${active === 'create' ? ' aria-current="page"' : ''}>${icon('plus')}Create Contest</a></div>
    </div>`;
    const toggle = header.querySelector('.menu-toggle');
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }
  const footer = $('#site-footer');
  if (footer) {
    footer.className = `site-footer${dark ? ' dark' : ''}`;
    footer.innerHTML = `<div class="wrap">
      ${logoHtml(dark)}
      <nav><a href="/#how">How it works</a><a href="/contests">Contests</a><a href="/create">Create a contest</a><a href="/#faq">FAQ</a><a href="mailto:info@joridiro.com">Contact</a><a href="/imprint">Imprint</a><a href="/legal/privacy-2023.pdf">Privacy</a><a href="/legal/terms-2023.pdf">Terms</a></nav>
      <span class="copy">© ${new Date().getFullYear()} Joridiro. All rights reserved.</span>
    </div>`;
  }
  return user;
}
