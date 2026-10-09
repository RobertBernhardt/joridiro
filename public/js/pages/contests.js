import { chrome, api, html, render, $, $$ } from '../lib.js';
import { contestCard } from '../cards.js';

chrome({ active: 'contests' });

const main = $('#main');
{
  render(main, html`<section class="wrap page-head">
      <h1>Contests</h1>
      <p>Platforms put up prize money, their first sellers compete on real results. Pick one and start scoring.</p>
    </section>
    <section class="wrap">
      <div class="filters" role="group" aria-label="Filter contests">
        <button data-f="all" aria-pressed="true">All</button>
        <button data-f="live" aria-pressed="false">Live</button>
        <button data-f="ended" aria-pressed="false">Ended</button>
        <button data-f="deadline" aria-pressed="false">Deadline</button>
        <button data-f="score" aria-pressed="false">Score</button>
      </div>
      <div class="grid-cards" id="list"><p class="muted">Loading contests…</p></div>
    </section>`);

  const { contests } = await api('GET', '/api/contests');
  const list = $('#list');
  const show = (f) => {
    const items = contests.filter((c) => f === 'all' || c.phase === f || c.type === f);
    render(list, items.length ? items.map(contestCard) : html`<div class="empty card"><h3>Nothing here yet</h3>
      <p>Be the first platform to run one.</p><a class="btn btn-primary" href="/create">Create a contest</a></div>`);
  };
  show('all');
  $$('.filters button').forEach((b) => b.addEventListener('click', () => {
    $$('.filters button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    show(b.dataset.f);
  }));
}
