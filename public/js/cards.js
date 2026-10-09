import { html, money, duration, flames, coverSvg, raw, initials, esc } from './lib.js';
import { SIZES, TYPES } from '/shared/rules.js';

export function contestCard(c) {
  const left = c.phase === 'live' && c.type === 'deadline' ? duration(c.endsAt - Date.now()) : null;
  return html`<a class="card ccard" href="/c/${encodeURIComponent(c.id)}">
    <div class="cover">${c.cover ? raw(`<img src="${esc(c.cover)}" alt="" loading="lazy">`) : raw(coverSvg(c.theme, c.id))}</div>
    <div class="body">
      <div class="top">
        <div class="logo-box">${c.logo ? raw(`<img src="${esc(c.logo)}" alt="">`) : initials(c.company)}</div>
        <div><h3>${c.title}</h3><div class="company">${c.company}</div></div>
      </div>
      <div class="meta">
        <span class="chip ${c.phase}">${c.phase === 'live' ? 'Live' : 'Ended'}</span>
        <span class="chip ${c.type}">${TYPES[c.type].short}</span>
        ${flames(SIZES[c.size].level, c.type)}
      </div>
      <div class="figures">
        <div class="figure"><div class="k">Prize pool</div><div class="v">${money(c.pool)}</div></div>
        <div class="figure"><div class="k">${c.type === 'deadline' ? 'Time left' : 'Target'}</div>
          <div class="v">${c.type === 'deadline' ? (left ?? '–') : `${c.targetScore} pts`}</div></div>
        <div class="figure"><div class="k">Players</div><div class="v">${c.participants}</div></div>
      </div>
    </div>
  </a>`;
}
