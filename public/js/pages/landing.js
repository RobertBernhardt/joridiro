import { chrome, api, html, render, $, money } from '../lib.js';
import { contestCard } from '../cards.js';
import { SIZES, TYPES, price, prizePool } from '/shared/rules.js';

chrome({ dark: true });

const header = $('#site-header');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Scenes are built when their section comes near the viewport.
const loaders = {
  launch: () => import('../scenes/launch.js').then((m) => m.launchScene),
  boulder: () => import('../scenes/boulder.js').then((m) => m.boulderScene),
  dominos: () => import('../scenes/dominos.js').then((m) => m.dominoScene),
};
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    io.unobserve(e.target);
    loaders[e.target.dataset.scene]?.().then((build) => build(e.target)).catch((err) => console.error(err));
  }
}, { rootMargin: '400px 0px' });
document.querySelectorAll('[data-scene]').forEach((s) => io.observe(s));

// Pricing straight from the shared rules, so it can never disagree with checkout.
render($('#price-grid'), Object.entries(SIZES).map(([key, s]) => html`<div class="price ${key === 'medium' ? 'featured' : ''}">
  <h3>${s.name}</h3>
  <div class="amount">${money(price(key))}</div>
  <div class="muted-night small">${money(prizePool(key))} goes to your participants</div>
  <ul>
    <li>Grand prize ${money(s.grandPrize)}</li>
    <li>${s.milestones.length ? `${s.milestones.length} milestone${s.milestones.length > 1 ? 's' : ''} worth ${money(s.milestones.reduce((a, m) => a + m.prize, 0))}` : 'No milestones'}</li>
    <li>${s.lottery ? `Lottery ${money(s.lottery)}` : 'No lottery'}</li>
    <li>${s.days} days or first to ${s.targetScore} points</li>
  </ul>
  <a class="btn ${key === 'medium' ? 'btn-primary' : 'btn-glass'}" href="/create?size=${key}">Choose ${s.name.toLowerCase()}</a>
</div>`));

api('GET', '/api/contests').then(({ contests }) => {
  const live = contests.filter((c) => c.phase === 'live').sort((a, b) => b.pool - a.pool)[0];
  if (live) render($('#live-card'), contestCard(live));
  else $('.how-demo').hidden = true;
}).catch(() => { $('.how-demo').hidden = true; });
