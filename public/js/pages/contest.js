import { chrome, api, html, raw, render, $, $$, esc, money, num, date, dateTime, duration, ago, flames, coverSvg, initials,
  modal, bindForm, toast, loginUrl, perUnit } from '../lib.js';
import { SIZES, TYPES, methodPoints } from '/shared/rules.js';

const id = decodeURIComponent(location.pathname.split('/')[2] || '');
const params = new URLSearchParams(location.search);
const user = await chrome({ active: 'contests' });
const main = $('#main');
let data;

const ICON = {
  flag: '<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4m-4 3h8"/>',
  ticket: '<path d="M4 8a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 1 0-4V4H4v4zM12 6v2m0 3v2m0 3v1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-9v.5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  check: '<path d="M4 6h10M4 12h10M4 18h10M17 6l1.5 1.5L21 5M17 12l1.5 1.5L21 11"/>',
  rules: '<path d="M14 5c-1-1-6-1-6 2s6 2 6 5-5 3-6 2M10 9c-1 1-1 4 3 5"/>',
  megaphone: '<path d="M3 10v4h3l7 4V6L6 10H3zM16 9a4 4 0 0 1 0 6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5z"/>',
  podium: '<path d="M9 21V9h6v12M3 21v-7h6M15 21v-5h6v5M3 21h18"/>',
};
const icon = (name) => raw(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`);

async function load() {
  try {
    data = await api('GET', `/api/contests/${encodeURIComponent(id)}`);
  } catch (err) {
    render(main, html`<section class="wrap empty"><h1>Contest not found</h1><p>It may have been removed, or it is not live yet.</p>
      <a class="btn btn-primary" href="/contests">See all contests</a></section>`);
    return;
  }
  document.title = `${data.contest.title} · Joridiro`;
  draw();
}

/* ---------- pieces ---------- */

function ring() {
  const { contest: c, state: s, standings } = data;
  const size = SIZES[c.size];
  const R = 96, C = 2 * Math.PI * R;
  let frac = 0, center;
  const color = c.type === 'deadline' ? 'var(--green)' : 'var(--purple-2)';
  let marks = [];
  if (c.type === 'deadline') {
    if (s.startAt) frac = Math.min(1, (Date.now() - s.startAt) / (s.endsAt - s.startAt));
    marks = size.milestones.map((m) => m.days / size.days);
    center = s.phase === 'draft'
      ? html`<span class="k">Duration</span><span class="v">${size.days} days</span><span class="s">starts when paid</span>`
      : s.phase === 'ended'
        ? html`<span class="k">Deadline</span><span class="v">Ended</span><span class="s">${date(s.endsAt)}</span>`
        : html`<span class="k">Time left</span><span class="v" data-countdown="${s.endsAt}">${duration(s.endsAt - Date.now())}</span><span class="s">ends ${date(s.endsAt)}</span>`;
  } else {
    const best = standings[0]?.points ?? 0;
    frac = Math.min(1, best / size.targetScore);
    marks = size.milestones.map((m) => m.points / size.targetScore);
    center = html`<span class="k">Best result</span><span class="v">${num(best)}</span><span class="s">of ${size.targetScore} points</span>`;
  }
  const pos = (f) => {
    const a = f * 2 * Math.PI - Math.PI / 2;
    return [110 + R * Math.cos(a), 110 + R * Math.sin(a)];
  };
  const markers = marks.map((f) => {
    const [x, y] = pos(f);
    const done = frac >= f;
    return `<circle cx="${x}" cy="${y}" r="11" fill="${done ? 'currentColor' : '#fff'}" stroke="currentColor" stroke-width="2.5"/>
      <path d="M${x - 3.5} ${y + 5}v-10h6l-1.2 2.5 1.2 2.5h-6" fill="none" stroke="${done ? '#fff' : 'currentColor'}" stroke-width="1.8" stroke-linejoin="round"/>`;
  }).join('');
  return html`<div class="ring" style="color:${color}">
    <svg viewBox="0 0 220 220" role="img" aria-label="Progress ${Math.round(frac * 100)} percent">
      <circle cx="110" cy="110" r="${R}" fill="none" stroke="#ededf0" stroke-width="12"/>
      <circle cx="110" cy="110" r="${R}" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${(frac * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 110 110)"/>
      ${raw(markers)}
    </svg>
    <div class="center">${center}</div>
  </div>`;
}

function sidePanel() {
  const { contest: c, state: s, role, entry } = data;
  const live = s.phase === 'live';
  let cta = '';
  if (role === 'organizer') {
    const pending = s.prizes.filter((p) => p.status === 'pending').length;
    cta = s.phase === 'draft'
      ? html`<button class="btn btn-primary btn-block" data-act="pay">Pay ${money(c.price)} and go live</button>
        <p class="small muted" style="margin:10px 0 0">Prize pool ${money(c.pool)} + Joridiro fee, plus VAT where it applies.</p>`
      : html`${pending ? html`<a class="btn btn-primary btn-block" href="#prizes">${pending} winner${pending > 1 ? 's' : ''} to confirm</a>` : ''}
        <a class="btn btn-ghost btn-block" href="#news" style="margin-top:8px">Post an announcement</a>`;
  } else if (role === 'participant') {
    const today = entry.lastAt && new Date(entry.lastAt).toDateString() === new Date().toDateString();
    cta = html`<div class="myentry">
        <div class="figure"><div class="k">Rank</div><div class="v">#${entry.rank}</div></div>
        <div class="figure"><div class="k">Points</div><div class="v">${num(entry.points)}</div></div>
        <div class="figure"><div class="k">Tickets</div><div class="v">${entry.tickets}</div></div>
      </div>
      ${live ? html`<button class="btn btn-primary btn-block" data-act="score">Update my score</button>
        <p class="small muted" style="margin:10px 0 0">${entry.lastAt ? `Last update ${ago(entry.lastAt)}.` : 'No update yet.'}
        ${SIZES[c.size].lottery && !today ? ' Update today to earn a lottery ticket.' : ''}</p>` : ''}`;
  } else if (live) {
    cta = html`<button class="btn btn-primary btn-block" data-act="join">Join this contest</button>
      <p class="small muted" style="margin:10px 0 0">Free to join. You need a profile on ${c.company.name || 'the platform'}.</p>`;
  } else if (s.phase === 'ended') {
    cta = html`<p class="muted" style="margin:0;text-align:center">This contest has ended.</p>`;
  }
  return html`<aside class="side">
    <div class="card panel">${ring()}${cta}</div>
    <nav class="card toc" aria-label="On this page">
      <a href="#prizes">Prizes</a><a href="#about">About</a><a href="#score">How to score</a>
      ${c.requirements.length || c.rules.length ? html`<a href="#rules">Requirements & rules</a>` : ''}
      <a href="#news">Announcements</a><a href="#faq">Questions</a><a href="#board">Leaderboard</a>
    </nav>
  </aside>`;
}

function prizeRow(p) {
  const { role } = data;
  const icons = { milestone: 'flag', grand: 'trophy', lottery: 'ticket' };
  const statusChip = {
    upcoming: '', pending: html`<span class="chip pending">Being verified</span>`,
    confirmed: html`<span class="chip confirmed">Won</span>`, unclaimed: html`<span class="chip">Not won</span>`,
  }[p.status];
  const w = p.winner;
  return html`<div class="card prize ${p.kind}">
    <div class="ico">${icon(icons[p.kind])}</div>
    <div><div class="what">${p.label} ${statusChip}</div><div class="when">${p.rule}${p.dueAt && data.state.startAt ? ` · ${date(p.dueAt)}` : ''}</div></div>
    <div class="amount">${money(p.amount)}</div>
    ${w ? html`<div class="winner">
      <span>${p.status === 'pending' ? 'Leading candidate:' : 'Winner:'} <b>${w.alias}</b>${w.isMe ? ' (you)' : ''}</span>
      ${role === 'organizer' ? html`<span class="muted">${w.name} · ${w.email}</span>
        ${w.profileUrl ? html`<a class="link" href="${w.profileUrl}" target="_blank" rel="noopener">Check profile ↗</a>` : ''}` : ''}
      ${p.auto ? html`<span class="small muted">confirmed automatically after 7 days</span>` : ''}
      ${role === 'organizer' && p.status === 'pending' ? html`<span class="decide">
        <button class="btn btn-sm btn-ghost" data-act="reject" data-prize="${p.key}" data-user="${w.userId}">Reject</button>
        <button class="btn btn-sm btn-primary" data-act="confirm" data-prize="${p.key}" data-user="${w.userId}">Confirm</button></span>
        <span class="small muted" style="flex-basis:100%">Confirm if the score is correct and the rules were followed. Decide by ${dateTime(p.decideBy)}, otherwise it is confirmed automatically.</span>` : ''}
    </div>` : ''}
  </div>`;
}

function draw() {
  const { contest: c, state: s, role, standings, announcements, questions } = data;
  const size = SIZES[c.size];
  const best = standings[0]?.points ?? 0;
  const aboutItems = [['Why this contest', c.purpose], ['Who it is for', c.audience], ['How to win', c.howToWin], ['How the organizer boosts it', c.boost]].filter(([, t]) => t);
  const waitingForPayment = s.phase === 'draft' && params.get('paid');

  render(main, html`
  <div class="contest-cover">${c.cover ? raw(`<img src="${esc(c.cover)}" alt="">`) : raw(coverSvg(c.theme, c.id))}</div>
  <div class="contest-sheet"><div class="wrap contest-layout">
    <article>
      ${s.phase === 'draft' ? html`<div class="banner-note">${waitingForPayment
        ? 'Payment received. Waiting for the confirmation from the payment provider, this page refreshes by itself.'
        : 'This is a draft. Only you can see it. It goes live the moment it is paid.'}</div>` : ''}
      <div class="contest-title">
        <div class="logo-box">${c.logo ? raw(`<img src="${esc(c.logo)}" alt="">`) : initials(c.company.name)}</div>
        <div style="flex:1">
          <h1>${c.title}</h1>
          <div class="by">by ${c.company.url ? html`<a href="${c.company.url}" target="_blank" rel="noopener">${c.company.name}</a>` : c.company.name}
            · competes on <a href="${c.platformUrl}" target="_blank" rel="noopener">${new URL(c.platformUrl).host}</a></div>
        </div>
        <button class="btn btn-ghost btn-sm" data-act="share">Share</button>
      </div>
      <div class="tags">
        <span class="chip ${s.phase}">${{ live: 'Live', ended: 'Ended', draft: 'Draft' }[s.phase]}</span>
        <span class="chip ${c.type}">${TYPES[c.type].name}</span>
        ${c.tags.map((t) => html`<span class="tag">${t}</span>`)}
      </div>
      <p style="font-size:1.08rem">${c.summary}</p>
      ${c.company.about ? html`<p class="muted">${c.company.about}</p>` : ''}

      <div class="stats">
        <div class="figure"><div class="k">Prize pool</div><div class="v">${money(c.pool)}</div></div>
        <div class="figure"><div class="k">Level</div><div class="v">${flames(size.level)} <span class="small muted">${size.name}</span></div></div>
        <div class="figure"><div class="k">Best result</div><div class="v">${num(best)} pts</div></div>
        <div class="figure"><div class="k">Participants</div><div class="v">${standings.length}</div></div>
      </div>

      <section class="section" id="prizes">
        <h2>${icon('trophy')} Prizes</h2>
        <div class="prizes">${s.prizes.length ? s.prizes.map(prizeRow) : previewPrizes(c)}</div>
      </section>

      ${aboutItems.length ? html`<section class="section" id="about"><h2>${icon('info')} About the contest</h2>
        <div class="about-grid">${aboutItems.map(([h, t]) => html`<div><h3>${h}</h3><p>${t}</p></div>`)}</div></section>` : html`<span id="about"></span>`}

      <section class="section" id="score"><h2>${icon('target')} How to score</h2>
        <div class="methods">${c.methods.map((m) => html`<div class="method">
          <div class="pts">${m.points} ${m.points === 1 ? 'point' : 'points'}</div>
          <div class="per">${perUnit(m)}</div>
          ${m.note ? html`<div class="note">${m.note}</div>` : ''}</div>`)}</div>
        <p class="small muted" style="margin-top:12px">${c.type === 'deadline'
          ? `Most points after ${size.days} days wins the grand prize.`
          : `The first participant to reach ${size.targetScore} points wins the grand prize and ends the contest.`}
          Participants report their own totals. The organizer checks every winner against their profile before the money is paid.</p>
      </section>

      ${c.requirements.length || c.rules.length ? html`<section class="section" id="rules">
        <h2>${icon('rules')} Requirements & rules</h2>
        ${c.requirements.length ? html`<ul class="rules req">${c.requirements.map((r) => html`<li><span class="badge">✓</span>${r}</li>`)}</ul>` : ''}
        ${c.rules.length ? html`<ul class="rules" style="margin-top:10px">${c.rules.map((r) => html`<li><span class="badge">§</span>${r}</li>`)}</ul>` : ''}
      </section>` : ''}

      <section class="section" id="news"><h2>${icon('megaphone')} Announcements</h2>
        ${role === 'organizer' && s.phase !== 'draft' ? html`<form class="ask" id="announce" style="margin:0 0 14px">
          <div class="field" style="flex:1;margin:0"><input class="input" name="text" placeholder="Tell your participants something…" maxlength="1000"></div>
          <button class="btn btn-dark" type="submit">Post</button></form>` : ''}
        ${announcements.length ? html`<div style="display:grid;gap:10px">${announcements.map((a) => html`<div class="card ann">${a.text}<time>${dateTime(a.at)}</time>
          ${role === 'organizer' ? html`<button class="link small" data-act="del-ann" data-id="${a.id}">Delete</button>` : ''}</div>`)}</div>`
          : html`<p class="muted">No announcements yet.</p>`}
      </section>

      <section class="section qa" id="faq"><h2>${icon('chat')} Questions</h2>
        ${questions.length ? questions.map((q) => html`<details ${q.answer ? '' : raw('open')}>
          <summary>${q.question}</summary>
          ${q.answer ? html`<div class="answer">${q.answer}</div>`
            : role === 'organizer' ? html`<form class="ask answer-form" data-id="${q.id}"><div class="field" style="flex:1;margin:0"><input class="input" name="answer" placeholder="Your answer"></div><button class="btn btn-dark" type="submit">Answer</button></form>`
            : html`<div class="answer muted">Waiting for the organizer's answer.</div>`}
        </details>`) : html`<p class="muted">No questions yet.</p>`}
        ${role !== 'organizer' && s.phase !== 'draft' ? html`<form class="ask" id="ask"><div class="field" style="flex:1;margin:0">
          <input class="input" name="question" placeholder="Ask the organizer a question" maxlength="600"></div>
          <button class="btn btn-dark" type="submit">Ask</button></form>` : ''}
      </section>

      <section class="section" id="board"><h2>${icon('podium')} Leaderboard</h2>
        ${standings.length ? html`<div class="card" style="overflow-x:auto"><table class="board">
          <thead><tr><th>#</th><th>Participant</th>${role === 'organizer' ? html`<th>Account</th>` : ''}<th class="num">Points</th>
            <th class="num hide-sm">Tickets</th><th class="hide-sm">Last update</th></tr></thead>
          <tbody>${standings.map((r) => html`<tr class="${r.isMe ? 'me' : ''}">
            <td class="rank">${r.rank}</td><td>${r.alias}${r.isMe ? ' (you)' : ''}</td>
            ${role === 'organizer' ? html`<td class="small">${r.name}<br><a class="link" href="${r.profileUrl}" target="_blank" rel="noopener">profile ↗</a></td>` : ''}
            <td class="num"><b>${num(r.points)}</b></td><td class="num hide-sm">${r.tickets}</td>
            <td class="hide-sm muted small">${r.lastAt ? ago(r.lastAt) : '–'}</td></tr>`)}</tbody></table></div>`
          : html`<p class="muted">Nobody has joined yet. The first participants have the best odds.</p>`}
      </section>
    </article>
    ${sidePanel()}
  </div></div>`);

  wire();
  if (waitingForPayment) setTimeout(load, 3000);
}

function previewPrizes(c) {
  const size = SIZES[c.size];
  const rows = [
    ...size.milestones.map((m, i) => ({ kind: 'milestone', label: `Milestone ${i + 1}`, amount: m.prize, rule: c.type === 'deadline' ? `Leader after day ${m.days}` : `First to ${m.points} points` })),
    { kind: 'grand', label: 'Grand prize', amount: size.grandPrize, rule: c.type === 'deadline' ? `Leader after day ${size.days}` : `First to ${size.targetScore} points` },
    ...(size.lottery ? [{ kind: 'lottery', label: 'Lottery', amount: size.lottery, rule: 'One ticket per day you update your score' }] : []),
  ];
  return rows.map((p) => prizeRow({ ...p, status: 'upcoming' }));
}

/* ---------- interactions ---------- */

function wire() {
  if ($('#ask')) bindForm($('#ask'), async (v) => {
    if (!user) return location.assign(loginUrl());
    await api('POST', `/api/contests/${encodeURIComponent(id)}/questions`, v);
    toast('Question sent to the organizer.');
    load();
  });
  if ($('#announce')) bindForm($('#announce'), async (v) => {
    await api('POST', `/api/contests/${encodeURIComponent(id)}/announcements`, v);
    toast('Announcement posted.');
    load();
  });
  $$('.answer-form').forEach((f) => bindForm(f, async (v) => {
    await api('POST', `/api/contests/${encodeURIComponent(id)}/questions/${f.dataset.id}/answer`, v);
    load();
  }));
  // Live countdown
  clearInterval(wire.timer);
  wire.timer = setInterval(() => $$('[data-countdown]').forEach((n) => { n.textContent = duration(Number(n.dataset.countdown) - Date.now()); }), 30e3);
}

async function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  const base = `/api/contests/${encodeURIComponent(id)}`;
  try {
    if (act === 'share') {
      const url = location.origin + location.pathname;
      if (navigator.share) await navigator.share({ title: data.contest.title, url }).catch(() => {});
      else { await navigator.clipboard.writeText(url); toast('Link copied.'); }
    } else if (act === 'join') {
      if (!user) return location.assign(loginUrl());
      joinModal();
    } else if (act === 'score') {
      scoreModal();
    } else if (act === 'pay') {
      b.disabled = true;
      const r = await api('POST', `${base}/checkout`);
      if (r.url) location.assign(r.url);
      else { toast('Contest is live. (Dev mode: no payment provider configured.)'); load(); }
    } else if (act === 'confirm' || act === 'reject') {
      const sure = act === 'confirm'
        ? confirm('Confirm this winner? This cannot be undone.')
        : confirm('Reject this candidate? The prize moves to the next participant in line.');
      if (!sure) return;
      await api('POST', `${base}/decisions`, { prize: b.dataset.prize, userId: b.dataset.user, decision: act === 'confirm' ? 'confirmed' : 'rejected' });
      toast(act === 'confirm' ? 'Winner confirmed.' : 'Candidate rejected.');
      load();
    } else if (act === 'del-ann') {
      if (!confirm('Delete this announcement?')) return;
      await api('DELETE', `${base}/announcements/${b.dataset.id}`);
      load();
    }
  } catch (err) {
    toast(err.message, 'error');
    b.disabled = false;
  }
}

function joinModal() {
  const c = data.contest;
  const m = modal('Join the contest', html`
    <form id="join" novalidate>
      <p class="muted">You compete under an alias. Only the organizer sees your real name, to verify a win.</p>
      <div class="field"><label for="ja">Alias</label><input class="input" id="ja" name="alias" maxlength="30" required placeholder="e.g. Night Kitchen"></div>
      <div class="field"><label for="jp">Your profile on ${c.company.name || 'the platform'}</label>
        <input class="input" id="jp" name="profileUrl" type="url" required placeholder="${c.platformUrl}">
        <span class="hint">The organizer uses it to check your score.</span></div>
      ${c.requirements.length || c.rules.length ? html`<div class="field"><span class="label">Requirements & rules</span>
        <ul class="rules small">${[...c.requirements, ...c.rules].map((r) => html`<li>${r}</li>`)}</ul></div>` : ''}
      <div class="field" data-field="acceptRules"><label class="check"><input type="checkbox" name="acceptRules" value="yes">
        <span>I meet the requirements and accept the rules.</span></label></div>
      <button class="btn btn-primary btn-block" type="submit">Join</button>
    </form>`);
  bindForm($('#join', m.el), async (v) => {
    await api('POST', `/api/contests/${encodeURIComponent(id)}/join`, { ...v, acceptRules: v.acceptRules === 'yes' });
    m.close();
    toast('You are in. Report your first numbers as soon as you have them.');
    load();
  });
}

function scoreModal() {
  const c = data.contest, e = data.entry;
  const m = modal('Update your score', html`
    <form id="scoreform" novalidate>
      <p class="muted">Enter your <b>total so far</b> for each method, not just today's numbers.</p>
      ${c.methods.map((meth, i) => html`<div class="field"><label for="v${i}">Total ${meth.label}</label>
        <input class="input" id="v${i}" name="v${i}" type="number" min="0" step="any" inputmode="decimal" value="${e.values[i] ?? 0}">
        <span class="hint">${meth.points} ${meth.points === 1 ? 'point' : 'points'} ${perUnit(meth)} · <b data-preview="${i}"></b></span></div>`)}
      <p style="font-weight:800;font-size:1.15rem">Total: <span id="total"></span> points</p>
      <button class="btn btn-primary btn-block" type="submit">Save score</button>
    </form>`);
  const form = $('#scoreform', m.el);
  const preview = () => {
    let total = 0;
    c.methods.forEach((meth, i) => {
      const p = methodPoints(meth, form.elements[`v${i}`].value);
      total += p;
      $(`[data-preview="${i}"]`, m.el).textContent = `${num(p)} pts`;
    });
    $('#total', m.el).textContent = num(total);
  };
  form.addEventListener('input', preview);
  preview();
  bindForm(form, async (v) => {
    await api('POST', `/api/contests/${encodeURIComponent(id)}/scores`, { values: c.methods.map((_, i) => Number(v[`v${i}`] || 0)) });
    m.close();
    toast('Score saved.');
    load();
  });
}

main.addEventListener('click', onClick);
load();
