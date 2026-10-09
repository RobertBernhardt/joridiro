import { chrome, api, html, raw, render, $, $$, esc, money, num, date, dateTime, duration, ago, flames, coverSvg, initials,
  modal, bindForm, toast, loginUrl, perUnit, icon } from '../lib.js';
import { SIZES, TYPES, methodPoints } from '/shared/rules.js';

const id = decodeURIComponent(location.pathname.split('/')[2] || '');
const params = new URLSearchParams(location.search);
const user = await chrome({ active: 'contests' });
const main = $('#main');
let data;

// Requirements get an icon by their title; anything else gets the pointing hand.
const REQ_ICON = { location: 'pin', roles: 'crosshair', 'real name': 'idcard', participants: 'people', demographics: 'people', category: 'tag' };
const asItem = (r) => (typeof r === 'string' ? { title: '', text: r } : r);
const tip = (text) => html`<span class="help" title="${text}" aria-label="${text}" role="img">${icon('help')}</span>`;

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

// Progress ring: time for deadline contests, best score for score contests. Milestones sit on the ring.
function ring() {
  const { contest: c, state: s, standings } = data;
  const size = SIZES[c.size];
  const R = 94, C = 2 * Math.PI * R;
  let frac = 0, center, marks = [];
  if (c.type === 'deadline') {
    if (s.startAt) frac = Math.min(1, (Date.now() - s.startAt) / (s.endsAt - s.startAt));
    marks = size.milestones.map((m) => m.days / size.days);
    center = s.phase === 'draft'
      ? html`<span class="k">Duration</span><span class="v">${size.days} days</span><span class="s">starts when paid</span>`
      : s.phase === 'ended'
        ? html`<span class="k">Deadline</span><span class="v">Ended</span><span class="s">${date(s.endsAt)}</span>`
        : html`<span class="k">Deadline</span><span class="v" data-countdown="${s.endsAt}">${duration(s.endsAt - Date.now())}</span><span class="s">ends ${date(s.endsAt)}</span>`;
  } else {
    const best = standings[0]?.points ?? 0;
    frac = Math.min(1, best / size.targetScore);
    marks = size.milestones.map((m) => m.points / size.targetScore);
    center = html`<span class="k">Target</span><span class="v">${num(size.targetScore)}</span><span class="s">best so far ${num(best)}</span>`;
  }
  const pos = (f) => {
    const a = f * 2 * Math.PI - Math.PI / 2;
    return [105 + R * Math.cos(a), 105 + R * Math.sin(a)];
  };
  const marker = (f, glyph) => {
    const [x, y] = pos(f);
    const done = frac >= f;
    return `<g transform="translate(${x - 12} ${y - 12})"><circle cx="12" cy="12" r="12" fill="${done ? 'currentColor' : '#fff'}" stroke="${done ? 'currentColor' : '#cfcfcf'}" stroke-width="2"/>
      <g transform="translate(5 5) scale(.58)" fill="none" stroke="${done ? '#fff' : '#6a7584'}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${glyph}</g></g>`;
  };
  const FLAG = '<path d="M6 21V4m0 1h11l-2.5 4L17 13H6"/>', PODIUM = '<path d="M9 21V10h6v11M3 21v-7h6M15 21v-5h6v5"/>';
  return html`<div class="ring" style="color:${c.type === 'deadline' ? 'var(--green)' : 'var(--purple)'}">
    <svg viewBox="0 0 210 210" role="img" aria-label="Progress ${Math.round(frac * 100)} percent">
      <circle cx="105" cy="105" r="${R}" fill="none" stroke="#d9d9d9" stroke-width="7"/>
      <circle cx="105" cy="105" r="${R}" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"
        stroke-dasharray="${(frac * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 105 105)"/>
      ${raw(marks.map((f) => marker(f, FLAG)).join('') + marker(1, PODIUM))}
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
      ? html`<button class="btn btn-primary btn-block btn-lg" data-act="pay">Pay ${money(c.price)} and go live</button>
        <p class="note">Prize pool ${money(c.pool)} plus Joridiro fee, plus VAT where it applies.</p>`
      : html`${pending ? html`<a class="btn btn-primary btn-block" href="#prizes">${pending} winner${pending > 1 ? 's' : ''} to confirm</a>` : ''}
        <a class="btn btn-ghost btn-block" href="#news">${icon('megaphone')}Post an announcement</a>`;
  } else if (role === 'participant') {
    const today = entry.lastAt && new Date(entry.lastAt).toDateString() === new Date().toDateString();
    cta = html`<div class="myentry">
        <div class="figure"><div class="k">Rank</div><div class="v">#${entry.rank}</div></div>
        <div class="figure"><div class="k">Points</div><div class="v">${num(entry.points)}</div></div>
        <div class="figure"><div class="k">Tickets</div><div class="v">${entry.tickets}</div></div>
      </div>
      ${live ? html`<button class="btn btn-primary btn-block btn-lg" data-act="score">Update my score</button>
        <p class="note">${entry.lastAt ? `Last update ${ago(entry.lastAt)}.` : 'No update yet.'}
        ${SIZES[c.size].lottery && !today ? ' Update today to earn a lottery ticket.' : ''}</p>` : ''}`;
  } else if (live) {
    cta = html`<button class="btn btn-primary btn-block btn-lg" data-act="join">Join contest</button>
      <p class="note">Free to join. You need a profile on ${c.company.name || 'the platform'}.</p>`;
  } else if (s.phase === 'ended') {
    cta = html`<p class="note">This contest has ended.</p>`;
  }
  const items = c.requirements.length, rules = c.rules.length;
  return html`<aside class="side">
    ${ring()}
    <div class="cta">${cta}</div>
    <nav class="toc" aria-label="On this page">
      <a href="#prizes">Status</a>${hasAbout(c) ? html`<a href="#about">About</a>` : ''}<a href="#score">How to score</a>
      ${items ? html`<a href="#requirements">Requirements</a>` : ''}${rules ? html`<a href="#rules">Rules</a>` : ''}
      <a href="#news">Announcements</a><a href="#faq">FAQs</a>${data.surveyStats ? html`<a href="#survey">Questions to participants</a>` : ''}<a href="#board">Leaderboard</a>
    </nav>
  </aside>`;
}

const hasAbout = (c) => c.company.about || c.purpose || c.audience || c.howToWin || c.boost;

function prizeRow(p, next) {
  const { role, contest: c } = data;
  const icons = { milestone: 'flag', grand: 'podium', lottery: 'ticket' };
  const statusChip = {
    upcoming: '', pending: html`<span class="chip pending">Being verified</span>`,
    confirmed: html`<span class="chip confirmed">Won</span>`, unclaimed: html`<span class="chip">Not won</span>`,
  }[p.status];
  const w = p.winner;
  const when = p.dueAt && data.state.startAt ? date(p.dueAt) : c.type === 'score' && p.threshold ? `${num(p.threshold)} points` : p.rule;
  return html`<div class="card prize ${p.kind} ${p.status === 'confirmed' || p.status === 'unclaimed' ? 'done' : ''}">
    <div class="pico">${icon(icons[p.kind])}</div>
    <div><div class="what">${p.label} ${statusChip}</div><div class="when">${when}</div></div>
    ${next ? html`<span class="chip countdown">${icon('clock')}<span data-countdown="${p.dueAt}">${duration(p.dueAt - Date.now())}</span></span>` : ''}
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

function prizeList() {
  const { contest: c, state: s } = data;
  if (!s.prizes.length) return previewPrizes(c);
  // The countdown chip sits on the next prize that is decided by a date.
  const next = s.phase === 'live' && c.type === 'deadline' ? s.prizes.find((p) => p.dueAt && p.dueAt > Date.now()) : null;
  return s.prizes.map((p) => prizeRow(p, p === next && p.kind === 'milestone'));
}

function draw() {
  const { contest: c, state: s, role, standings, announcements, questions, entry } = data;
  const size = SIZES[c.size];
  const best = standings[0]?.points ?? 0;
  const aboutItems = [['The purpose of this contest', c.purpose], ['Who is this contest for?', c.audience], ['What do you have to do to win?', c.howToWin],
    ['How does the organizer support this contest?', c.boost]].filter(([, t]) => t);
  const waitingForPayment = s.phase === 'draft' && params.get('paid');
  const requirements = c.requirements.map(asItem), rules = c.rules.map(asItem);

  render(main, html`
  <div class="contest-cover">${c.cover ? raw(`<img src="${esc(c.cover)}" alt="">`) : raw(coverSvg(c.theme, c.id))}</div>
  <div class="contest-layout">
    <article class="${c.type}-type">
      ${s.phase === 'draft' ? html`<div class="banner-note" style="margin-top:16px">${waitingForPayment
        ? 'Payment received. Waiting for the confirmation from the payment provider, this page refreshes by itself.'
        : 'This is a draft. Only you can see it. It goes live the moment it is paid.'}</div>` : ''}
      <div class="contest-title">
        <div class="logo-box">${c.logo ? raw(`<img src="${esc(c.logo)}" alt="">`) : initials(c.company.name)}</div>
        <div>
          <h1>${c.title}</h1>
          <div class="by">${c.company.name}
            ${c.company.url ? html`<a href="${c.company.url}" target="_blank" rel="noopener" title="Company website">${icon('link')}</a>` : ''}
            <span class="muted small">competes on <a href="${c.platformUrl}" target="_blank" rel="noopener" style="display:inline">${new URL(c.platformUrl).host}</a></span></div>
        </div>
        <button class="btn btn-ghost" data-act="share">${icon('share')}Share</button>
      </div>
      <div class="contest-body">
        <div class="tags">
          <span class="chip ${s.phase}">${{ live: 'Live', ended: 'Ended', draft: 'Draft' }[s.phase]}</span>
          <span class="chip ${c.type}">${TYPES[c.type].name}</span>
          ${c.tags.map((t) => html`<span class="tag">${t}</span>`)}
        </div>
        <p class="lead-text">${c.summary}</p>

        <div class="stats">
          <div class="figure"><div class="k">Grand Prize</div><div class="v">${money(size.grandPrize)}</div></div>
          <div class="figure"><div class="k">Level</div><div class="v">${flames(size.level, c.type)}</div></div>
          <div class="figure"><div class="k">Best Result</div><div class="v">${num(best)} points</div></div>
          <div class="figure"><div class="k">Total Participants</div><div class="v">${standings.length}</div></div>
        </div>

        <section class="prizes" id="prizes" style="scroll-margin-top:90px">${prizeList()}</section>

        ${hasAbout(c) ? html`<section class="section about" id="about">
          <h2 class="section-title">About the contest</h2>
          ${c.company.about ? html`<p>${c.company.about}</p>` : ''}
          ${aboutItems.length ? html`<div class="about-sub">${aboutItems.map(([h, t]) => html`<div><h3>${h}</h3><p>${t}</p></div>`)}</div>` : ''}
        </section>` : ''}

        <section class="section" id="score"><h2 class="section-title">${icon('gauge')}How to score</h2>
          <div class="methods">${c.methods.map((m, i) => html`<div class="card method">
            <span class="coin">${icon('coins')}</span>
            <div class="pts">${icon('coins')}${m.points} ${m.points === 1 ? 'point' : 'points'}</div>
            <div>${m.per === 1 ? 'For each of your' : 'For every'}</div>
            <div class="per">${m.per === 1 ? m.label : `${num(m.per)} ${m.label}`}${m.note ? tip(m.note) : ''}</div>
            ${entry ? html`<div class="mine"><span>Your points:</span><b>${num(methodPoints(m, entry.values[i]))}</b></div>` : ''}
          </div>`)}</div>
          <p class="small muted" style="margin-top:16px">${c.type === 'deadline'
            ? `Most points after ${size.days} days wins the grand prize.`
            : `The first participant to reach ${num(size.targetScore)} points wins the grand prize and ends the contest.`}
            Participants report their own totals. The organizer checks every winner against their profile before the money is paid.</p>
        </section>

        ${requirements.length ? html`<section class="section" id="requirements">
          <h2 class="section-title">${icon('checklist')}Requirements ${tip('You confirm that you meet every requirement when you join.')}</h2>
          <div class="items">${requirements.map((r) => html`<div class="card item">
            <span class="iico">${icon(REQ_ICON[r.title.toLowerCase()] || 'pointer')}</span>
            <div>${r.title ? html`<div class="t">${r.title}</div>` : ''}<div class="x">${r.text}</div></div><span class="star" aria-hidden="true">*</span></div>`)}</div>
        </section>` : ''}

        ${rules.length ? html`<section class="section" id="rules">
          <h2 class="section-title"><span style="font-size:1.6rem;line-height:1">§</span>Rules ${tip('Break a rule and the organizer can reject your win.')}</h2>
          <div class="items">${rules.map((r) => html`<div class="card item rule"><span class="iico">§</span>
            <div>${r.title ? html`<div class="t">${r.title}</div>` : ''}<div class="x">${r.text}</div></div></div>`)}</div>
        </section>` : ''}

        <section class="section" id="news"><h2 class="section-title">${icon('megaphone')}Announcements</h2>
          ${role === 'organizer' && s.phase !== 'draft' ? html`<form class="ask" id="announce" style="margin:0 0 20px">
            <div class="field"><input class="input" name="text" placeholder="Tell your participants something…" maxlength="1000"></div>
            <button class="btn btn-primary" type="submit">Post</button></form>` : ''}
          ${announcements.length ? html`<div class="items">${announcements.map((a) => html`<div class="card ann"><span class="bm">${icon('bookmark')}</span>
            <div><p>${a.text}</p><time>– ${date(a.at)}</time>
            ${role === 'organizer' ? html`<button class="link" data-act="del-ann" data-id="${a.id}">Delete</button>` : ''}</div></div>`)}</div>`
            : html`<p class="muted">No announcements yet.</p>`}
        </section>

        <section class="section" id="faq"><h2 class="section-title">${icon('chat')}Frequently Asked Questions</h2>
          ${questions.length ? html`<div class="qa">${questions.map((q, i) => html`<details ${q.answer ? '' : raw('open')}>
            <summary><span class="n">${i + 1}</span><span>${q.question}</span></summary>
            ${q.answer ? html`<div class="answer">${q.answer}</div>`
              : role === 'organizer' ? html`<form class="ask answer-form" data-id="${q.id}" style="margin-left:60px"><div class="field"><input class="input" name="answer" placeholder="Your answer"></div><button class="btn btn-primary" type="submit">Answer</button></form>`
              : html`<div class="answer muted">Waiting for the organizer's answer.</div>`}
          </details>`)}</div>` : html`<p class="muted">No questions yet.</p>`}
          ${role !== 'organizer' && s.phase !== 'draft' ? html`<form class="ask" id="ask"><div class="field">
            <input class="input" name="question" placeholder="Ask a question" maxlength="600" aria-label="Ask the organizer a question"></div>
            <button class="btn btn-primary" type="submit">Submit</button></form>` : ''}
        </section>

        ${data.surveyStats ? html`<section class="section" id="survey"><h2 class="section-title">${icon('question')}Questions to participants</h2>
          <div class="survey">${c.survey.map((q, qi) => {
            const counts = data.surveyStats[qi], total = Math.max(1, counts.reduce((a, b) => a + b, 0));
            return html`<div class="card q"><h3>${q.question}</h3>${q.answers.map((a, ai) => html`<div class="bar-row">
              <span>${a}</span><span class="b"><i style="width:${((counts[ai] / total) * 100).toFixed(1)}%"></i></span><span class="c">${counts[ai]}</span></div>`)}</div>`;
          })}</div>
          <p class="small muted" style="margin-top:12px">Only you see these answers.</p>
        </section>` : ''}

        <section class="section" id="board"><h2 class="section-title">${icon('podium')}Leaderboard</h2>
          ${standings.length ? html`<div class="card" style="overflow-x:auto"><table class="board">
            <thead><tr><th>#</th><th>Participant</th>${role === 'organizer' ? html`<th>Account</th>` : ''}<th class="num">Points</th>
              <th class="num hide-sm">Tickets</th><th class="hide-sm">Last update</th></tr></thead>
            <tbody>${standings.map((r) => html`<tr class="${r.isMe ? 'me' : ''}">
              <td class="rank">${String(r.rank).padStart(2, '0')}</td><td>${r.alias}${r.isMe ? ' (you)' : ''}</td>
              ${role === 'organizer' ? html`<td class="small">${r.name}<br><a class="link" href="${r.profileUrl}" target="_blank" rel="noopener">profile ↗</a></td>` : ''}
              <td class="num"><b>${num(r.points)}</b></td><td class="num hide-sm">${r.tickets}</td>
              <td class="hide-sm muted small">${r.lastAt ? ago(r.lastAt) : '–'}</td></tr>`)}</tbody></table></div>`
            : html`<p class="muted">Nobody has joined yet. The first participants have the best odds.</p>`}
        </section>
      </div>
    </article>
    ${sidePanel()}
  </div>`);

  wire();
  if (waitingForPayment) setTimeout(load, 3000);
}

function previewPrizes(c) {
  const size = SIZES[c.size];
  const rows = [
    ...size.milestones.map((m, i) => ({ kind: 'milestone', label: `Milestone ${i + 1}`, amount: m.prize, rule: c.type === 'deadline' ? `Day ${m.days}` : `${m.points} points` })),
    ...(size.lottery ? [{ kind: 'lottery', label: 'Lottery', amount: size.lottery, rule: 'One ticket per day you update your score' }] : []),
    { kind: 'grand', label: 'Grand Prize', amount: size.grandPrize, rule: c.type === 'deadline' ? `Day ${size.days}` : `${size.targetScore} points` },
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
  const items = [...c.requirements, ...c.rules].map(asItem);
  const m = modal('Join the contest', html`
    <form id="join" novalidate>
      <p class="muted">You compete under an alias. Only the organizer sees your real name, to verify a win.</p>
      <div class="field"><label for="ja" class="req">Alias</label><input class="input" id="ja" name="alias" maxlength="30" required placeholder="e.g. Night Kitchen"></div>
      <div class="field"><label for="jp" class="req">Your profile on ${c.company.name || 'the platform'}</label>
        <input class="input" id="jp" name="profileUrl" type="url" required placeholder="${c.platformUrl}">
        <span class="hint">The organizer uses it to check your score.</span></div>
      ${c.survey.length ? html`<div class="field" data-field="answers"><span class="label">The organizer would like to know</span>
        ${c.survey.map((q, qi) => html`<fieldset style="border:0;padding:0;margin:0 0 8px"><legend style="font-weight:500;margin-bottom:8px">${q.question}</legend>
          <div class="radio-grid">${q.answers.map((a, ai) => html`<label class="radio compact"><input type="radio" name="a${qi}" value="${ai}"><span class="face"><strong style="font-size:.98rem;font-weight:500">${a}</strong></span></label>`)}</div></fieldset>`)}</div>` : ''}
      ${items.length ? html`<div class="field"><span class="label">Requirements and rules</span>
        <ul style="margin:0;padding-left:1.2em">${items.map((r) => html`<li>${r.title ? html`<b>${/[?:!.]$/.test(r.title) ? r.title : `${r.title}:`}</b> ` : ''}${r.text}</li>`)}</ul></div>` : ''}
      <div class="field" data-field="acceptRules"><label class="check"><input type="checkbox" name="acceptRules" value="yes">
        <span>I meet the requirements and accept the rules.</span></label></div>
      <button class="btn btn-primary btn-block btn-lg" type="submit">Join</button>
    </form>`);
  bindForm($('#join', m.el), async (v) => {
    const answers = c.survey.map((_, i) => (v[`a${i}`] === undefined ? null : Number(v[`a${i}`])));
    await api('POST', `/api/contests/${encodeURIComponent(id)}/join`, { alias: v.alias, profileUrl: v.profileUrl, acceptRules: v.acceptRules === 'yes', answers });
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
