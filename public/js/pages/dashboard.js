// Dashboard, after the designer's profile page: purple banner, the person on the left,
// and two tabs: their contests and their details (also used for invoices).
import { chrome, api, html, raw, render, $, esc, money, num, duration, loginUrl, flames, icon, bindForm, toast } from '../lib.js';
import { SIZES, TYPES } from '/shared/rules.js';

let user = await chrome();
if (!user) location.replace(loginUrl());
const main = $('#main');
const { organizing, joined } = await api('GET', '/api/dashboard');
let details = user.details || {};

const BANNER = `<svg viewBox="0 0 1440 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><linearGradient id="bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <path d="M60 0h330L230 180H120z" fill="url(#bw)"/><path d="M300 0h170L270 180H180z" fill="url(#bw)" opacity=".6"/>
  <path d="M1080 0h360v180L1180 110z" fill="url(#bw)" opacity=".35"/></svg>`;

const progress = (c) => {
  if (c.phase === 'draft') return 0;
  if (c.type === 'deadline') return c.phase === 'ended' ? 1 : Math.min(1, (Date.now() - c.startAt) / (c.endsAt - c.startAt));
  return Math.min(1, c.best / c.targetScore);
};
const bar = (c) => html`<div class="bar ${c.type}" title="${Math.round(progress(c) * 100)}%"><i style="width:${(progress(c) * 100).toFixed(1)}%"></i></div>`;
const phaseChip = (c) => html`<span class="chip ${c.phase}">${{ live: 'Open', ended: 'Closed', draft: 'Draft' }[c.phase]}</span>`;
const remaining = (c) => c.phase === 'draft' ? 'starts when paid' : c.phase === 'ended' ? 'ended'
  : c.type === 'deadline' ? `${duration(c.endsAt - Date.now())} left` : `best ${num(c.best)} of ${num(c.targetScore)} points`;
const contestCell = (c, sub) => html`<a href="/c/${encodeURIComponent(c.id)}">${c.title}</a><div class="small muted">${sub}</div>`;

function contestsTab() {
  const pending = organizing.filter((c) => c.pendingDecisions);
  const drafts = organizing.filter((c) => c.phase === 'draft');
  return html`<h1>Contests</h1>
    ${pending.map((c) => html`<div class="todo">${icon('trophy')}<span>${c.pendingDecisions} winner${c.pendingDecisions > 1 ? 's' : ''} to confirm in “${c.title}”</span>
      <a class="btn btn-primary btn-sm" href="/c/${encodeURIComponent(c.id)}#prizes">Review</a></div>`)}
    ${drafts.map((c) => html`<div class="todo">${icon('info')}<span>“${c.title}” is a draft. It goes live when paid.</span>
      <a class="btn btn-primary btn-sm" href="/c/${encodeURIComponent(c.id)}">Pay ${money(c.price)}</a></div>`)}

    <section class="dash-section" id="organizing">
      <div class="head"><h2>Contests you organize</h2><a class="btn btn-primary btn-sm" href="/create">${icon('plus')}New contest</a></div>
      ${organizing.length ? html`<div class="table-wrap"><table class="board">
        <thead><tr><th>Contest name</th><th>Deadline / Target</th><th class="num">Participants</th><th>Status</th><th class="num">Prize pool</th></tr></thead>
        <tbody>${organizing.map((c) => html`<tr>
          <td>${contestCell(c, `${TYPES[c.type].short} · ${SIZES[c.size].name}`)}</td>
          <td>${bar(c)}<div class="small muted" style="margin-top:4px">${remaining(c)}</div></td>
          <td class="num">${c.participants}</td><td>${phaseChip(c)}</td><td class="num">${money(c.pool)}</td>
        </tr>`)}</tbody></table></div>`
        : html`<div class="card empty"><h3>No contests yet</h3><p>Got a platform that needs its first sellers? Put up a prize.</p>
          <a class="btn btn-primary" href="/create">Create a contest</a></div>`}
    </section>

    <section class="dash-section" id="joined">
      <div class="head"><h2>Contests in which you participate</h2></div>
      ${joined.length ? html`<div class="table-wrap"><table class="board">
        <thead><tr><th>Contest name</th><th>Deadline / Target</th><th class="num">My points</th><th class="num">Ranking</th><th>Status</th><th class="num">Prize pool</th></tr></thead>
        <tbody>${joined.map((c) => html`<tr>
          <td>${contestCell(c, raw(`${esc(c.company)} · ${flames(SIZES[c.size].level, c.type)}`))}
            ${c.won.length ? html`<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${c.won.map((w) => html`<span class="chip ${w.status}">${w.label} ${money(w.amount)}</span>`)}</div>` : ''}</td>
          <td>${bar(c)}<div class="small muted" style="margin-top:4px">${remaining(c)}</div></td>
          <td class="num"><b>${num(c.points)}</b></td><td class="num">#${c.rank} <span class="muted small">of ${c.participants}</span></td>
          <td>${phaseChip(c)}</td><td class="num">${money(c.pool)}</td>
        </tr>`)}</tbody></table></div>`
        : html`<div class="card empty"><h3>You are not in any contest</h3><p>Find one that fits what you sell.</p>
          <a class="btn btn-primary" href="/contests">Browse contests</a></div>`}
    </section>`;
}

let avatarData; // undefined: unchanged, null: remove, data URL: new
function detailsTab() {
  const f = (name, label, opts = {}) => html`<div class="field"><label for="d-${name}" class="${opts.required ? 'req' : ''}">${label}</label>
    <input class="input" id="d-${name}" name="${name}" maxlength="${opts.max || 120}" value="${opts.value ?? details[name] ?? ''}"
      placeholder="${opts.placeholder || ''}" ${opts.disabled ? raw('disabled') : ''} ${opts.type ? raw(`type="${opts.type}"`) : ''}></div>`;
  return html`<h1>My details</h1>
    <form class="details-form" id="details" novalidate>
      <div class="upload-row">
        <span class="thumb">${details.avatar ? raw(`<img src="${esc(details.avatar)}" alt="">`) : icon('upload')}</span>
        <span class="text"><strong>Your profile picture</strong><span>JPG, PNG or WebP, max 1.5 MB</span></span>
        <label class="btn btn-ghost">${icon('upload')}Upload image<input type="file" accept="image/png,image/jpeg,image/webp" id="avatar" aria-label="Upload profile picture"></label>
      </div>
      <div class="grid2">
        ${f('name', 'Full name', { required: true, value: user.name, max: 80 })}
        ${f('email', 'Email', { value: user.email, disabled: true, type: 'email' })}
        ${f('company', 'Company', { placeholder: 'Your company, if you invoice as one' })}
        ${f('vatId', 'VAT ID', { placeholder: 'Enter your VAT ID' })}
        ${f('taxId', 'Tax ID', { placeholder: 'Enter your tax ID' })}
        ${f('country', 'Country', { placeholder: 'Germany' })}
        ${f('city', 'City')}
        ${f('street', 'Street')}
        ${f('zip', 'Zip code')}
      </div>
      <p class="small muted">We use these details for the invoices of your contests and to pay out prize money.</p>
      <button class="btn btn-primary" type="submit">Save changes</button>
    </form>`;
}

function draw() {
  const tab = location.hash === '#details' ? 'details' : 'contests';
  render(main, html`<div class="dash-banner">${raw(BANNER)}</div>
  <div class="dash">
    <aside class="dash-side">
      <div class="big-avatar">${raw(`<img src="${esc(details.avatar || '/favicon.svg')}" alt="">`)}</div>
      <div class="name">${user.name}</div>
      <div class="mail">${user.email}</div>
      <nav class="dash-nav">
        <a href="#contests" ${tab === 'contests' ? raw('aria-current="page"') : ''}>${icon('monitor')}Contests</a>
        <a href="#details" ${tab === 'details' ? raw('aria-current="page"') : ''}>${icon('usersquare')}My details</a>
        <a href="#" id="logout">${icon('logout')}Log out</a>
      </nav>
    </aside>
    <div class="dash-main">${tab === 'details' ? detailsTab() : contestsTab()}</div>
  </div>`);

  $('#logout').addEventListener('click', async (e) => {
    e.preventDefault();
    await api('POST', '/api/auth/logout');
    location.assign('/');
  });
  if (tab !== 'details') return;
  $('#avatar').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return toast('That image is larger than 1.5 MB.', 'error');
    const r = new FileReader();
    r.onload = () => { avatarData = r.result; $('.upload-row .thumb').innerHTML = `<img src="${esc(r.result)}" alt="">`; };
    r.readAsDataURL(file);
  });
  bindForm($('#details'), async (v) => {
    const { name, ...rest } = v;
    const res = await api('POST', '/api/me', { name, details: rest, avatar: avatarData });
    user = res.user;
    details = res.user.details;
    avatarData = undefined;
    toast('Your details are saved.');
    draw();
  });
}

addEventListener('hashchange', draw);
draw();
