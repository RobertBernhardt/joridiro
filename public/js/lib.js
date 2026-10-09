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

// The mark: a hero bursting out of a cracked egg. Same figure as in the landing scenes.
export const markSvg = (cls = '') => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true">
  <path d="M26 12c-6 3-13 9-16 16" stroke="#ea3d09" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".55"/>
  <path d="M41 15c-6 1-12 6-16 9l-9 2c5 1 10 1 14-1 4-2 8-5 11-10z" fill="#ea3d09"/>
  <path d="M42 15 34 27M42 15l7-9M34 27l-6 6M34 27l2 7" stroke="#16131f" stroke-width="5" stroke-linecap="round" fill="none"/>
  <circle cx="45.5" cy="10.5" r="3.6" fill="#16131f"/>
  <path d="M13 41l5-5 4 4 5-6 4 5 5-5 4 5 5-4 5 4c0 11-8 19-18 19S13 52 13 41z" fill="#f4f1ea" stroke="#16131f" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M17 47c2 6 7 10 13 11" stroke="#d6d0c4" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`;

export const logoHtml = (dark = false) => `<a class="logo${dark ? ' logo-dark' : ''}" href="/" aria-label="Joridiro home">
  <span class="wm">JORI</span>${markSvg('mark')}<span class="wm">DIRO</span></a>`;

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

const FLAME = (on) => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="${on ? '#3fa81e' : '#e6e6e9'}"/><path d="M12 5c1 3 5 4.5 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2-4 0 1.5.8 2.5 2 2.8C10.4 10 11 7 12 5z" fill="#fff"/></svg>`;
export const flames = (level) => raw(`<span class="flames" title="Level ${level} of 3">${[1, 2, 3].map((i) => FLAME(i <= level)).join('')}</span>`);

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
      <nav class="nav">${link('/#how', 'How it works', 'how')}${link('/contests', 'Contests', 'contests')}${link('/create', 'Create a contest', 'create')}</nav>
      <div class="header-actions">${user
        ? `<a class="btn btn-ghost btn-sm" href="/dashboard">Dashboard</a><a class="avatar" href="/dashboard" title="${esc(user.name)}">${esc(initials(user.name))}</a>`
        : `<a class="btn btn-ghost btn-sm" href="${loginUrl()}">Log in</a><a class="btn btn-primary btn-sm" href="/login?tab=register&next=${encodeURIComponent(location.pathname)}">Sign up</a>`}</div>
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
      <nav><a href="/contests">Contests</a><a href="/create">Create a contest</a><a href="/#faq">FAQ</a><a href="mailto:info@joridiro.com">Contact</a><a href="/imprint">Imprint</a><a href="/legal/privacy-2023.pdf">Privacy</a><a href="/legal/terms-2023.pdf">Terms</a></nav>
      <span class="small">© ${new Date().getFullYear()} Joridiro</span>
    </div>`;
  }
  return user;
}
