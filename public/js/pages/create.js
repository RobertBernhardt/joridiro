import { chrome, api, html, raw, render, $, $$, esc, money, coverSvg, bindForm, loginUrl, toast } from '../lib.js';
import { SIZES, TYPES, price, prizePool } from '/shared/rules.js';

const user = await chrome({ active: 'create' });
const main = $('#main');

const sizeCard = (key) => {
  const s = SIZES[key];
  return html`<label class="choice"><input type="radio" name="size" value="${key}" ${key === 'medium' ? raw('checked') : ''}>
    <span class="face"><strong>${s.name}</strong>
      <span class="muted small" data-size-detail="${key}"></span><br>
      <b>${money(price(key))}</b> <span class="muted" style="font-size:.85rem">net</span></span></label>`;
};

const listEditor = (name, placeholder, items = ['']) => html`<div class="list" data-list="${name}">
  ${items.map((v) => html`<div class="list-row"><input class="input" value="${v}" placeholder="${placeholder}" maxlength="300"><button type="button" class="icon-btn" data-remove aria-label="Remove">×</button></div>`)}
  </div><button type="button" class="link" data-add="${name}" data-placeholder="${placeholder}">+ Add another</button>`;

const methodRow = (m = { points: 1, per: 1, label: '' }) => html`<div class="method-row">
  <input class="input" type="number" min="1" value="${m.points}" aria-label="Points" data-k="points">
  <span class="word">points for every</span>
  <input class="input" type="number" min="1" value="${m.per}" aria-label="Units" data-k="per">
  <input class="input label-input" value="${m.label}" placeholder="orders, € revenue, 5-star reviews…" aria-label="What is counted" data-k="label" maxlength="60">
  <button type="button" class="icon-btn" data-remove aria-label="Remove">×</button></div>`;

render(main, html`
<section class="wrap page-head">
  <h1>Create a contest</h1>
  <p>Put up a prize, define what counts, and invite the sellers you want on your platform. It goes live the moment it is paid.</p>
  ${user ? '' : html`<div class="banner-note">You can fill everything in now. You will need an account to publish. <a class="link" href="${loginUrl()}">Log in or sign up</a></div>`}
</section>
<form class="wrap create-layout" id="create" novalidate>
  <div>
    <section class="card create-step"><h2><span class="n">1</span> Type and size</h2>
      <div class="field" data-field="type"><span class="label">How is the winner decided?</span>
        <div class="choice-grid">${Object.entries(TYPES).map(([k, t], i) => html`<label class="choice">
          <input type="radio" name="type" value="${k}" ${i === 0 ? raw('checked') : ''}><span class="face"><strong>${t.name}</strong><span class="small muted">${t.blurb}</span></span></label>`)}</div>
      </div>
      <div class="field" data-field="size"><span class="label">How big?</span>
        <div class="choice-grid">${Object.keys(SIZES).map(sizeCard)}</div>
        <span class="hint">Sizes are fixed so participants can compare contests at a glance. You tune the difficulty with your scoring and rules.</span>
      </div>
    </section>

    <section class="card create-step"><h2><span class="n">2</span> The basics</h2>
      <div class="field"><label for="title">Contest title</label><input class="input" id="title" name="title" maxlength="90" placeholder="Become the first five-star kitchen on Quartermeal"></div>
      <div class="field"><label for="platformUrl">Where do participants compete?</label><input class="input" id="platformUrl" name="platformUrl" type="url" placeholder="https://your-platform.com">
        <span class="hint">Your platform. Participants need a profile there, and you check their scores there.</span></div>
      <div class="field"><label for="summary">Short description</label><textarea class="input" id="summary" name="summary" maxlength="400" placeholder="What is the contest, who should join, what can they win?"></textarea></div>
      <div class="field"><label for="tags">Tags</label><input class="input" id="tags" name="tags" placeholder="Food delivery, London, Restaurants"><span class="hint">Comma separated, up to six.</span></div>
      <div class="field"><span class="label">Cover</span>
        <div class="choice-grid themes">${[0, 1, 2, 3, 4, 5].map((t) => html`<label class="choice"><input type="radio" name="theme" value="${t}" ${t === 0 ? raw('checked') : ''}>
          <span class="face">${raw(coverSvg(t, 'preview' + t))}</span></label>`)}</div>
        <span class="hint">Generated artwork, or upload your own below (PNG, JPEG or WebP, max 1.5 MB).</span>
        <input type="file" accept="image/png,image/jpeg,image/webp" data-image="cover">
      </div>
    </section>

    <section class="card create-step"><h2><span class="n">3</span> How to score</h2>
      <p class="muted">Up to three countable results on your platform. Participants report their totals; you verify winners.</p>
      <div id="methods" data-field="methods">${methodRow({ points: 1, per: 1, label: '' })}</div>
      <button type="button" class="link" id="add-method">+ Add a scoring method</button>
    </section>

    <section class="card create-step"><h2><span class="n">4</span> Requirements and rules</h2>
      <div class="field"><span class="label">Who can take part?</span>${listEditor('requirements', 'e.g. You run a restaurant in London')}</div>
      <div class="field"><span class="label">Rules</span>${listEditor('rules', 'e.g. Orders must be delivered within 15 minutes')}</div>
    </section>

    <section class="card create-step"><h2><span class="n">5</span> Tell the story <span class="small muted" style="font-weight:600">(optional)</span></h2>
      <div class="field"><label for="purpose">Why are you running this contest?</label><textarea class="input" id="purpose" name="purpose" maxlength="1500"></textarea></div>
      <div class="field"><label for="audience">Who is it for?</label><textarea class="input" id="audience" name="audience" maxlength="1500"></textarea></div>
      <div class="field"><label for="howToWin">Tips: how do you win?</label><textarea class="input" id="howToWin" name="howToWin" maxlength="1500"></textarea></div>
      <div class="field"><label for="boost">How do you boost it?</label><textarea class="input" id="boost" name="boost" maxlength="1500" placeholder="Ads, newsletter, fee waivers… anything that brings buyers to your new sellers."></textarea></div>
      <div class="field"><label for="cname">Company name</label><input class="input" id="cname" name="companyName" maxlength="80"></div>
      <div class="field"><label for="curl">Company website</label><input class="input" id="curl" name="companyUrl" type="url" placeholder="https://"></div>
      <div class="field"><label for="cabout">About the company</label><textarea class="input" id="cabout" name="companyAbout" maxlength="600"></textarea></div>
      <div class="field"><span class="label">Logo</span><input type="file" accept="image/png,image/jpeg,image/webp" data-image="logo"></div>
    </section>
  </div>

  <aside class="card summary">
    <h3 id="sum-title">Your contest</h3>
    <div id="sum-lines"></div>
    <div class="total"><span>Total</span><span id="sum-total"></span></div>
    <p class="small muted">Net price. VAT is added at checkout where it applies. If nobody scores a single point, you get your money back.</p>
    <button class="btn btn-primary btn-block" type="submit">${user ? 'Create and pay' : 'Log in to publish'}</button>
  </aside>
</form>`);

const form = $('#create');
const images = {};

function summary() {
  const size = form.elements.size.value, type = form.elements.type.value, s = SIZES[size];
  const lines = [
    ['Grand prize', s.grandPrize],
    ...s.milestones.map((m, i) => [`Milestone ${i + 1}`, m.prize]),
    ...(s.lottery ? [['Lottery', s.lottery]] : []),
    ['Joridiro fee', s.fee],
  ];
  $('#sum-title').textContent = form.elements.title.value.trim() || 'Your contest';
  $('#sum-lines').innerHTML = `<p class="small muted">${esc(TYPES[type].name)} · ${type === 'deadline' ? `${s.days} days` : `first to ${s.targetScore} points`}</p>`
    + lines.map(([k, v]) => `<div class="line"><span>${esc(k)}</span><b>${money(v)}</b></div>`).join('');
  $('#sum-total').textContent = money(price(size));
  for (const k of Object.keys(SIZES)) {
    const z = SIZES[k];
    $(`[data-size-detail="${k}"]`).textContent = `${money(prizePool(k))} in prizes · ${type === 'deadline' ? `${z.days} days` : `${z.targetScore} points`}`;
  }
}
form.addEventListener('input', summary);
form.addEventListener('change', summary);
summary();

form.addEventListener('click', (e) => {
  const rm = e.target.closest('[data-remove]');
  if (rm) {
    const row = rm.parentElement;
    if (row.parentElement.children.length > 1) row.remove();
    else row.querySelectorAll('input').forEach((i) => { if (!i.type || i.type === 'text') i.value = ''; });
  }
  const add = e.target.closest('[data-add]');
  if (add) {
    const list = $(`[data-list="${add.dataset.add}"]`);
    if (list.children.length >= 10) return;
    list.insertAdjacentHTML('beforeend', `<div class="list-row"><input class="input" placeholder="${esc(add.dataset.placeholder)}" maxlength="300"><button type="button" class="icon-btn" data-remove aria-label="Remove">×</button></div>`);
    list.lastElementChild.querySelector('input').focus();
  }
  if (e.target.id === 'add-method') {
    const box = $('#methods');
    if (box.children.length >= 3) return toast('Three scoring methods at most. Keep it simple for participants.');
    box.insertAdjacentHTML('beforeend', String(methodRow()));
    box.lastElementChild.querySelector('[data-k=label]').focus();
  }
});

$$('[data-image]').forEach((input) => input.addEventListener('change', () => {
  const file = input.files[0];
  if (!file) return delete images[input.dataset.image];
  if (file.size > 1.5 * 1024 * 1024) { toast('That image is larger than 1.5 MB.', 'error'); input.value = ''; return; }
  const r = new FileReader();
  r.onload = () => { images[input.dataset.image] = r.result; };
  r.readAsDataURL(file);
}));

bindForm(form, async (v) => {
  if (!user) return location.assign(loginUrl());
  const list = (name) => $$(`[data-list="${name}"] input`).map((i) => i.value.trim()).filter(Boolean);
  const body = {
    title: v.title, type: v.type, size: v.size, platformUrl: v.platformUrl, summary: v.summary,
    tags: (v.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    theme: Number(v.theme), purpose: v.purpose, audience: v.audience, howToWin: v.howToWin, boost: v.boost,
    company: { name: v.companyName, url: v.companyUrl, about: v.companyAbout },
    methods: $$('#methods .method-row').map((row) => ({
      points: Number(row.querySelector('[data-k=points]').value), per: Number(row.querySelector('[data-k=per]').value),
      label: row.querySelector('[data-k=label]').value.trim(),
    })),
    requirements: list('requirements'), rules: list('rules'),
    cover: images.cover, logo: images.logo,
  };
  const { id } = await api('POST', '/api/contests', body);
  // If checkout can't start, the draft is saved and can be paid from its page.
  const pay = await api('POST', `/api/contests/${encodeURIComponent(id)}/checkout`).catch(() => ({}));
  location.assign(pay.url || `/c/${encodeURIComponent(id)}`);
});
