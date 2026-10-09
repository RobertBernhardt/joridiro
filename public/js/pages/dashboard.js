import { chrome, api, html, render, $, money, num, duration, initials, loginUrl, flames } from '../lib.js';
import { SIZES, TYPES } from '/shared/rules.js';

const user = await chrome();
if (!user) location.replace(loginUrl());

const main = $('#main');
const { organizing, joined } = await api('GET', '/api/dashboard');

const progress = (c) => {
  if (c.phase === 'draft') return 0;
  if (c.type === 'deadline') return c.phase === 'ended' ? 1 : Math.min(1, (Date.now() - c.startAt) / (c.endsAt - c.startAt));
  return Math.min(1, c.best / c.targetScore);
};
const bar = (c) => html`<div class="bar ${c.type}" title="${Math.round(progress(c) * 100)}%"><i style="width:${(progress(c) * 100).toFixed(1)}%"></i></div>`;
const phaseChip = (c) => html`<span class="chip ${c.phase}">${{ live: 'Live', ended: 'Ended', draft: 'Draft' }[c.phase]}</span>`;
const remaining = (c) => c.phase !== 'live' ? '–' : c.type === 'deadline' ? duration(c.endsAt - Date.now()) : `${c.best}/${c.targetScore} pts`;

const pending = organizing.reduce((a, c) => a + c.pendingDecisions, 0);
const wonTotal = joined.flatMap((c) => c.won).filter((w) => w.status !== 'unclaimed').reduce((a, w) => a + w.amount, 0);

render(main, html`<div class="wrap dash">
  <aside class="card dash-side">
    <div class="avatar">${initials(user.name)}</div>
    <div><b>${user.name}</b><div class="small muted">${user.email}</div></div>
    <nav><a href="#organizing">My contests</a><a href="#joined">Participating</a><a href="/create">Create a contest</a>
      <a href="#" id="logout">Log out</a></nav>
  </aside>
  <div>
    <h1 style="font-size:1.8rem">Hi ${user.name.split(' ')[0]}</h1>
    <div class="kpis">
      <div class="card kpi accent"><div class="v">${organizing.filter((c) => c.phase === 'live').length}</div><div class="k">Contests running</div></div>
      <div class="card kpi"><div class="v">${pending}</div><div class="k">Winners to confirm</div></div>
      <div class="card kpi"><div class="v">${joined.filter((c) => c.phase === 'live').length}</div><div class="k">Contests you compete in</div></div>
      <div class="card kpi"><div class="v">${money(wonTotal)}</div><div class="k">Prize money won</div></div>
    </div>

    <section id="organizing">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px">
        <h2 style="margin:0;font-size:1.3rem">Contests you organize</h2>
        <a class="btn btn-primary btn-sm" href="/create">+ New contest</a>
      </div>
      ${organizing.length ? html`<div class="card table-card"><table class="board">
        <thead><tr><th>Contest</th><th>Status</th><th>Progress</th><th>Left</th><th class="num">Players</th><th class="num">Pool</th><th></th></tr></thead>
        <tbody>${organizing.map((c) => html`<tr>
          <td><a href="/c/${encodeURIComponent(c.id)}">${c.title}</a><div class="small muted">${TYPES[c.type].short} · ${SIZES[c.size].name}</div></td>
          <td>${phaseChip(c)}</td><td>${bar(c)}</td><td>${remaining(c)}</td>
          <td class="num">${c.participants}</td><td class="num">${money(c.pool)}</td>
          <td>${c.phase === 'draft' ? html`<a class="btn btn-sm btn-primary" href="/c/${encodeURIComponent(c.id)}">Pay ${money(c.price)}</a>`
            : c.pendingDecisions ? html`<a class="btn btn-sm btn-ghost" href="/c/${encodeURIComponent(c.id)}#prizes">${c.pendingDecisions} to confirm</a>` : ''}</td>
        </tr>`)}</tbody></table></div>`
        : html`<div class="card empty"><h3>No contests yet</h3><p>Got a platform that needs its first sellers? Put up a prize.</p>
          <a class="btn btn-primary" href="/create">Create a contest</a></div>`}
    </section>

    <section id="joined" style="margin-top:36px">
      <h2 style="font-size:1.3rem">Contests you compete in</h2>
      ${joined.length ? html`<div class="card table-card"><table class="board">
        <thead><tr><th>Contest</th><th>Status</th><th>Progress</th><th class="num">My points</th><th class="num">Rank</th><th class="num">Tickets</th><th>Prizes</th></tr></thead>
        <tbody>${joined.map((c) => html`<tr>
          <td><a href="/c/${encodeURIComponent(c.id)}">${c.title}</a><div class="small muted">${c.company} · ${flames(SIZES[c.size].level)}</div></td>
          <td>${phaseChip(c)}</td><td>${bar(c)}<div class="small muted">${remaining(c)}</div></td>
          <td class="num"><b>${num(c.points)}</b></td><td class="num">#${c.rank} <span class="muted small">of ${c.participants}</span></td>
          <td class="num">${c.tickets}</td>
          <td>${c.won.length ? c.won.map((w) => html`<span class="chip ${w.status}">${w.label} ${money(w.amount)}</span> `) : html`<span class="muted small">Prize pool ${money(c.pool)}</span>`}</td>
        </tr>`)}</tbody></table></div>`
        : html`<div class="card empty"><h3>You are not in any contest</h3><p>Find one that fits what you sell.</p>
          <a class="btn btn-primary" href="/contests">Browse contests</a></div>`}
    </section>
  </div>
</div>`);

$('#logout').addEventListener('click', async (e) => {
  e.preventDefault();
  await api('POST', '/api/auth/logout');
  location.assign('/');
});
