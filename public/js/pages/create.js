// Create a contest, after the designer's "New Creating the Contest" frame: seven stacked steps
// with a checklist on the left. Each "Continue" checks its step and reveals the next one.
// The draft lives in localStorage so nothing is lost when the organizer has to log in first.
import { chrome, api, html, raw, render, $, $$, esc, money, num, loginUrl, toast, icon, help, rocketSvg, ApiError } from '../lib.js';
import { SIZES, TYPES, price, prizePool } from '/shared/rules.js';

const user = await chrome({ active: 'create' });
const main = $('#main');
const STORE = 'joridiro:create-draft';

const STEPS = [
  { key: 'prize', name: 'Contest Prize' },
  { key: 'score', name: 'How to Score' },
  { key: 'rules', name: 'Rules' },
  { key: 'requirements', name: 'Requirements' },
  { key: 'about', name: 'About the Contest' },
  { key: 'questions', name: 'Questions' },
  { key: 'company', name: 'About Company' },
];
// Which step shows a server-side validation error.
const FIELD_STEP = { title: 0, platformUrl: 0, type: 0, size: 0, methods: 1, summary: 4, survey: 5 };

const blank = () => ({
  reached: 0, title: '', platformUrl: '', cover: null, type: 'score', size: 'small',
  methods: [], rules: [], requirements: [],
  req: { category: { on: false, text: '' }, kind: 'both', realName: false, demographics: { on: false, text: '' }, regions: { on: false, tags: [] }, roles: { on: false, text: '' } },
  summary: '', purpose: '', audience: '', howToWin: '', boost: '', tags: [],
  survey: [], company: { name: '', url: '', about: '' }, logo: null, terms: false,
});
let draft;
try { draft = { ...blank(), ...JSON.parse(localStorage.getItem(STORE)) }; } catch { draft = blank(); }
// "Choose medium" on the landing page links here with ?size=medium.
const askedSize = new URLSearchParams(location.search).get('size');
if (SIZES[askedSize]) draft.size = askedSize;
const save = () => {
  try { localStorage.setItem(STORE, JSON.stringify(draft)); } catch {
    try { localStorage.setItem(STORE, JSON.stringify({ ...draft, cover: null, logo: null })); } catch { /* storage full or blocked */ }
  }
};

/* ---------- small building blocks ---------- */

const counter = (name, max) => html`<span class="count" data-count="${name}">${(draft[name] || '').length}/${max}</span>`;
const textField = ({ name, label, value, placeholder = '', max = 200, required = false, type = 'text', area = false, count = false, hint = '' }) => html`
  <div class="field" data-field="${name}">
    <div class="label-row"><label for="f-${name}" class="${required ? 'req' : ''}">${label}</label>${count ? counter(name, max) : ''}</div>
    ${area ? html`<textarea class="input" id="f-${name}" name="${name}" maxlength="${max}" placeholder="${placeholder}" rows="3">${value}</textarea>`
      : html`<input class="input" id="f-${name}" name="${name}" type="${type}" maxlength="${max}" placeholder="${placeholder}" value="${value}">`}
    ${hint ? html`<span class="hint">${hint}</span>` : ''}
  </div>`;
const stepHead = (title, tip) => html`<div class="cstep-head"><h2>${title}</h2>${help(tip)}</div>`;
const continueBtn = (i) => html`<button type="button" class="btn btn-primary btn-lg btn-block continue" data-continue="${i}">Continue</button>`;
const tagBox = (key, tags, placeholder) => html`<div class="taginput" data-tags="${key}">
  ${tags.map((t, i) => html`<span class="tag">${t}<button type="button" data-untag="${i}" aria-label="Remove ${t}">×</button></span>`)}
  <input placeholder="${tags.length ? '' : placeholder}" aria-label="${placeholder}" maxlength="30"></div>`;

/* ---------- step 1: basics and prize ---------- */

function sizeText(key, type) {
  const s = SIZES[key];
  const win = type === 'deadline'
    ? `Runs for ${s.days} days. Whoever has the most points at the end wins ${money(s.grandPrize)}.`
    : `The first participant to reach ${s.targetScore} points wins ${money(s.grandPrize)}, at the latest after ${s.days} days.`;
  const ms = s.milestones.length
    ? ` ${s.milestones.length === 1 ? 'One milestone pays' : `${s.milestones.length} milestones pay`} ${money(s.milestones[0].prize)}${s.milestones.length > 1 ? ' each' : ''} on the way,`
      + ` and a lottery of ${money(s.lottery)} rewards everyone who keeps reporting.`
    : ' No milestones and no lottery: one prize, quick and simple.';
  return win + ms;
}

function prizeFacts() {
  const s = SIZES[draft.size], deadline = draft.type === 'deadline';
  const fact = (ico, title, text, off = false) => html`<div class="fact ${off ? 'off' : ''}"><span class="fi">${icon(ico)}</span><div><b>${title}</b><span>${text}</span></div></div>`;
  const msWhen = s.milestones.map((m) => (deadline ? `day ${m.days}` : `${m.points} points`)).join(', ');
  return html`
    ${fact('trophy', money(s.grandPrize), 'Grand prize')}
    ${deadline ? fact('clock', `${s.days} days`, 'Duration') : fact('bolt', `${s.targetScore} points`, 'Target score')}
    ${s.milestones.length ? fact('flag', `${s.milestones.length} milestone${s.milestones.length > 1 ? 's' : ''}`, `${money(s.milestones[0].prize)} each, at ${msWhen}`)
      : fact('flag', 'No milestones', 'Milestones come with Medium and Large contests', true)}
    ${s.lottery ? fact('ticket', `${money(s.lottery)} lottery`, 'One ticket for every day a participant reports a score')
      : fact('ticket', 'No lottery', 'Lotteries come with Medium and Large contests', true)}`;
}

function bill() {
  const s = SIZES[draft.size];
  const line = (k, v, cls = '') => html`<div class="line ${cls}"><span>${k}</span><b>${money(v)}</b></div>`;
  return html`
    ${line('Total prize pool', prizePool(draft.size), 'total-pool')}
    ${line('Grand prize', s.grandPrize)}
    ${s.milestones.map((m, i) => line(s.milestones.length > 1 ? `Milestone ${'ABC'[i]}` : 'Milestone', m.prize))}
    ${s.lottery ? line('Lottery', s.lottery) : ''}
    ${line(`Platform fee (${Math.round((s.fee / prizePool(draft.size)) * 100)}%)`, s.fee)}
    <div class="pay"><span>You will pay</span><b>${money(price(draft.size))}</b></div>
    <p class="vat">Net prices. VAT is added at checkout where it applies.</p>`;
}

const stepPrize = () => html`
  ${textField({ name: 'title', label: 'Contest name', value: draft.title, placeholder: 'Enter a meaningful and memorable title for your contest', max: 90, required: true })}
  ${textField({ name: 'platformUrl', label: 'On which site does the contest take place?', value: draft.platformUrl, placeholder: 'https://www.yourplatform.com', max: 300, required: true, type: 'url',
    hint: 'Participants need a profile there. You check their scores there.' })}
  <div class="field" data-field="cover"><span class="label">Upload banner</span>
    <label class="dropzone ${draft.cover ? 'has-image' : ''}" id="cover-drop">
      ${draft.cover ? raw(`<img src="${esc(draft.cover)}" alt="Banner preview">`) : html`
        <strong>Drag and drop the contest banner to upload</strong>
        <span class="muted">JPG, PNG or WebP, max 1.5 MB. Recommended size 1680 × 400 px.</span>
        <span class="btn btn-ghost">${icon('upload')}Upload image</span>`}
      <input type="file" accept="image/png,image/jpeg,image/webp" data-image="cover" aria-label="Upload banner"></label>
    <span class="hint">${draft.cover ? html`<button type="button" class="link" data-clear-image="cover">Remove banner</button>` : 'No banner? We generate artwork for your contest.'}</span>
  </div>

  <div style="margin-top:48px">${stepHead('Contest Prize', 'The size decides the prizes and how long the contest runs. Sizes are fixed so participants can compare contests at a glance. You tune the difficulty with your scoring and rules.')}</div>
  <div class="field" data-field="type"><span class="label req">Contest type</span>
    <div class="radio-grid">${Object.entries({ score: 'First to reach the target wins', deadline: 'Highest score when time runs out wins' }).map(([k, sub]) => html`
      <label class="radio"><input type="radio" name="type" value="${k}" ${draft.type === k ? raw('checked') : ''}>
        <span class="face"><span><strong>${TYPES[k].name}</strong><span class="sub">${sub}</span></span></span></label>`)}</div>
  </div>
  <div class="field" data-field="size"><span class="label req">Contest size</span>
    <div class="sizes">${Object.entries(SIZES).map(([k, s]) => html`<label class="size">
      <input type="radio" name="size" value="${k}" ${draft.size === k ? raw('checked') : ''}>
      <span class="face">${rocketSvg(k)}<strong>${s.name} Contest</strong><span class="amt">${icon('trophy')}${money(s.grandPrize)}</span></span></label>`)}</div>
  </div>
  <div id="prize-live">${prizeLive()}</div>`;

const prizeLive = () => html`
  <div class="size-detail">${rocketSvg(draft.size)}<div><h3>${SIZES[draft.size].name} ${TYPES[draft.type].short.toLowerCase()} contest</h3><p>${sizeText(draft.size, draft.type)}</p></div></div>
  <div class="prize-split"><div class="facts">${prizeFacts()}</div><div class="card bill">${bill()}</div></div>`;

/* ---------- list steps: score methods, rules, requirements, questions ---------- */

// One "saved cards + editor + add bar" block. `editing` is the index being edited, -1 for new.
const LISTS = {
  methods: {
    max: 3, add: 'Add method', empty: () => ({ points: 1, per: 1, label: '', note: '' }),
    card: (m) => html`<div class="card entry"><span class="eico">${icon('coins')}</span>
      <div><div class="t">${m.per === 1 ? 'For each of your' : 'For every'}</div><div class="x">${m.per === 1 ? m.label : `${num(m.per)} ${m.label}`}</div>${m.note ? html`<div class="n">${m.note}</div>` : ''}</div>
      <div class="side-r"><span class="pts">${icon('coins')}${m.points} ${m.points === 1 ? 'point' : 'points'}</span>`,
    editor: (m) => html`<div class="row">
        <div class="field"><label for="m-points">Points</label><input class="input" id="m-points" data-k="points" type="number" min="1" value="${m.points}"></div>
        <div class="field"><label for="m-per">For every</label><input class="input" id="m-per" data-k="per" type="number" min="1" value="${m.per}"></div>
        <div class="field wide"><label for="m-label" class="req">What counts</label><input class="input" id="m-label" data-k="label" list="units" maxlength="60" value="${m.label}" placeholder="orders, € revenue, 5-star reviews…"></div>
      </div>
      <div class="field"><label for="m-note">How do you count it? <span class="muted">(optional)</span></label><input class="input" id="m-note" data-k="note" maxlength="200" value="${m.note}" placeholder="e.g. Only orders that were delivered within 15 minutes"></div>`,
    read: (ed) => {
      const v = (k) => $(`[data-k=${k}]`, ed).value.trim();
      const m = { points: Math.max(1, Math.floor(Number(v('points')) || 1)), per: Math.max(1, Math.floor(Number(v('per')) || 1)), label: v('label'), note: v('note') };
      return m.label ? m : { error: ['label', 'Say what participants have to achieve, e.g. "orders".'] };
    },
  },
  rules: {
    max: 10, add: 'Add rule', empty: () => ({ title: '', text: '' }),
    card: (r, i) => html`<div class="card entry rule"><span class="eico">§</span>
      <div><div class="t">${r.title || `Rule ${i + 1}`}</div><div class="x">${r.text}</div></div><div class="side-r">`,
    editor: (r) => html`
      <div class="field"><label for="r-title">Title <span class="muted">(optional)</span></label><input class="input" id="r-title" data-k="title" maxlength="60" value="${r.title}" placeholder="e.g. What is forbidden?"></div>
      <div class="field"><label for="r-text" class="req">Rule</label><input class="input" id="r-text" data-k="text" maxlength="300" value="${r.text}" placeholder="e.g. Orders you place yourself don't count."></div>`,
    read: (ed) => {
      const r = { title: $('[data-k=title]', ed).value.trim(), text: $('[data-k=text]', ed).value.trim() };
      return r.text ? r : { error: ['text', 'Write the rule.'] };
    },
  },
  requirements: {
    max: 6, add: 'Add requirement', empty: () => ({ title: '', text: '' }),
    card: (r) => html`<div class="card entry requirement"><span class="eico">${icon('pointer')}</span>
      <div><div class="t">${r.title || 'Requirement'}</div><div class="x">${r.text}</div></div><div class="side-r">`,
    editor: (r) => html`
      <div class="field"><label for="q-title">Requirement title</label><input class="input" id="q-title" data-k="title" maxlength="60" value="${r.title}" placeholder="e.g. Experience"></div>
      <div class="field"><label for="q-text" class="req">What do participants need?</label><input class="input" id="q-text" data-k="text" maxlength="300" value="${r.text}" placeholder="e.g. At least 20 reviews on your profile"></div>`,
    read: (ed) => {
      const r = { title: $('[data-k=title]', ed).value.trim(), text: $('[data-k=text]', ed).value.trim() };
      return r.text ? r : { error: ['text', 'Describe the requirement.'] };
    },
  },
  survey: {
    max: 5, add: 'Add question', empty: () => ({ question: '', answers: ['', ''] }),
    card: (q, i) => html`<div class="card entry"><span class="eico">${icon('question')}</span>
      <div><div class="t">Question ${i + 1}</div><div class="x">${q.question}</div><ol>${q.answers.map((a) => html`<li>${a}</li>`)}</ol></div><div class="side-r">`,
    editor: (q) => html`
      <div class="field"><label for="s-q" class="req">Question</label><input class="input" id="s-q" data-k="question" maxlength="200" value="${q.question}" placeholder="e.g. How many years have you been selling online?"></div>
      <div class="field"><span class="label">How many answers does your question have?</span>
        <div class="radio-grid">${[2, 3, 4].map((n) => html`<label class="radio compact"><input type="radio" name="s-n" value="${n}" data-answers-n ${q.answers.length === n ? raw('checked') : ''}><span class="face"><strong>${n} answers</strong></span></label>`)}</div></div>
      <div class="field"><span class="label req">Answers</span>
        ${q.answers.map((a, i) => html`<input class="input" data-answer="${i}" maxlength="100" value="${a}" placeholder="Answer ${i + 1}" aria-label="Answer ${i + 1}">`)}</div>`,
    read: (ed) => {
      const q = { question: $('[data-k=question]', ed).value.trim(), answers: $$('[data-answer]', ed).map((i) => i.value.trim()) };
      if (!q.question) return { error: ['question', 'Write the question.'] };
      if (q.answers.some((a) => !a)) return { error: ['answers', 'Fill in every answer, or choose fewer answers.'] };
      return q;
    },
  },
};
const editing = { methods: draft.methods.length ? null : -1, rules: draft.rules.length ? null : -1, requirements: null, survey: draft.survey.length ? null : -1 };

function listBlock(key) {
  const L = LISTS[key], items = draft[key], e = editing[key];
  const tools = (i) => html`<button type="button" class="icon-btn" data-edit="${key}:${i}" aria-label="Edit">${icon('edit')}</button>
    <button type="button" class="icon-btn" data-del="${key}:${i}" aria-label="Delete">${icon('trash')}</button></div></div>`;
  const editor = (item, i) => html`<div class="editor" data-editor="${key}" data-index="${i}">${L.editor(item)}
    <div class="actions"><div><button type="button" class="btn btn-primary" data-save="${key}">Save</button>
      ${items.length || i >= 0 ? html`<button type="button" class="btn btn-ghost" data-cancel="${key}">Cancel</button>` : ''}</div>
      ${i >= 0 ? html`<button type="button" class="btn btn-danger" data-del="${key}:${i}">${icon('trash')}Delete</button>` : ''}</div></div>`;
  return html`<div class="entries">${items.map((it, i) => (e === i ? editor(it, i) : html`${L.card(it, i)}${tools(i)}`))}</div>
    ${e === -1 ? editor(L.empty(), -1) : ''}
    ${e === null && items.length < L.max ? html`<button type="button" class="add-bar" data-add="${key}">${icon('plus')}${L.add}</button>` : ''}`;
}
const redrawList = (key) => render($(`[data-list="${key}"]`), listBlock(key));

/* ---------- requirements toggles ---------- */

const toggleQ = (k, q, inner = '') => html`<div class="toggle-q" data-field="req-${k}"><div class="q"><span>${q}</span>
  <label class="switch"><input type="checkbox" data-req-on="${k}" ${(k === 'realName' ? draft.req.realName : draft.req[k].on) ? raw('checked') : ''} aria-label="${q}"><span></span></label></div>
  ${inner && (k === 'realName' ? false : draft.req[k].on) ? inner : ''}</div>`;
const stepRequirements = () => html`
  ${toggleQ('category', 'Is there a special category on your site in which participants have to be active to earn points?',
    html`<input class="input" data-req-text="category" maxlength="200" value="${draft.req.category.text}" placeholder="e.g. Food trucks, Fast food">`)}
  <div class="toggle-q"><div class="q"><span>Your participants should be:</span></div>
    <div class="radio-grid">${[['individuals', 'Individuals'], ['companies', 'Companies'], ['both', 'Both']].map(([v, l]) => html`
      <label class="radio compact"><input type="radio" name="kind" value="${v}" ${draft.req.kind === v ? raw('checked') : ''}><span class="face"><strong>${l}</strong></span></label>`)}</div></div>
  ${toggleQ('realName', 'Do participants have to take part under their verified real name?')}
  ${toggleQ('demographics', 'Is your contest limited to specific demographics?',
    html`<input class="input" data-req-text="demographics" maxlength="200" value="${draft.req.demographics.text}" placeholder="e.g. Students between 18 and 25">`)}
  ${toggleQ('regions', 'Do you want to limit participation to specific regions?', tagBox('regions', draft.req.regions.tags, 'Type a region and press Enter, e.g. London-Soho'))}
  ${toggleQ('roles', 'Do participants need certain roles to take part in your contest?',
    html`<input class="input" data-req-text="roles" maxlength="200" value="${draft.req.roles.text}" placeholder="e.g. Restaurant owner, Shop owner">`)}
  <div data-list="requirements">${listBlock('requirements')}</div>`;

// The toggles become ordinary requirements with a title, so the contest page shows them like any other.
function requirementsOut() {
  const r = draft.req, out = [];
  if (r.category.on && r.category.text.trim()) out.push({ title: 'Category', text: `Only activity in ${r.category.text.trim()} counts.` });
  if (r.kind !== 'both') out.push({ title: 'Participants', text: r.kind === 'companies' ? 'Only companies can take part.' : 'Only individuals can take part.' });
  if (r.realName) out.push({ title: 'Real name', text: 'You take part under your verified real name.' });
  if (r.demographics.on && r.demographics.text.trim()) out.push({ title: 'Demographics', text: r.demographics.text.trim() });
  if (r.regions.on && r.regions.tags.length) out.push({ title: 'Location', text: `You are based in ${r.regions.tags.join(', ')}.` });
  if (r.roles.on && r.roles.text.trim()) out.push({ title: 'Roles', text: r.roles.text.trim() });
  return [...out, ...draft.requirements];
}

/* ---------- about, company, finish ---------- */

const stepAbout = () => html`
  ${textField({ name: 'summary', label: 'Short description', value: draft.summary, area: true, max: 400, required: true, count: true, placeholder: 'This text appears on your contest and in the contest list' })}
  ${textField({ name: 'purpose', label: 'What is this contest for?', value: draft.purpose, area: true, max: 1500, count: true, placeholder: 'Tell your participants about the purpose of this contest' })}
  ${textField({ name: 'audience', label: 'Who is this contest for?', value: draft.audience, area: true, max: 1500, count: true, placeholder: 'Tell your participants about your target audience' })}
  ${textField({ name: 'howToWin', label: 'What do participants have to do to win?', value: draft.howToWin, area: true, max: 1500, count: true, placeholder: 'Tell your participants the steps they have to take to win' })}
  ${textField({ name: 'boost', label: 'How do you support this contest?', value: draft.boost, area: true, max: 1500, count: true, placeholder: 'Ads, newsletters, fee waivers… anything that brings buyers to your new sellers' })}
  <div class="field" data-field="tags"><span class="label">Keywords</span>${tagBox('tags', draft.tags, 'Up to six keywords. Press Enter after each one')}</div>`;

const stepCompany = () => html`
  <div class="field"><div class="upload-row">
    <span class="thumb">${draft.logo ? raw(`<img src="${esc(draft.logo)}" alt="Logo preview">`) : icon('upload')}</span>
    <span class="text"><strong>Add your company logo</strong><span>PNG, JPG or WebP, max 1.5 MB</span></span>
    <label class="btn btn-ghost">${icon('upload')}${draft.logo ? 'Replace' : 'Upload image'}<input type="file" accept="image/png,image/jpeg,image/webp" data-image="logo" aria-label="Upload logo"></label>
  </div></div>
  ${textField({ name: 'company.name', label: 'Company name', value: draft.company.name, max: 80, placeholder: user ? user.name : 'Enter your company name' })}
  ${textField({ name: 'company.url', label: 'Company link', value: draft.company.url, type: 'url', max: 300, placeholder: 'https://www.yourcompany.com' })}
  ${textField({ name: 'company.about', label: 'Company description', value: draft.company.about, area: true, max: 600, placeholder: 'Tell participants something about your company' })}
  <div class="finish">
    <div class="field" data-field="terms" style="margin:0"><label class="check"><input type="checkbox" name="terms" ${draft.terms ? raw('checked') : ''}>
      <span>I agree to the <a href="/legal/terms-2023.pdf" target="_blank" rel="noopener">terms and conditions</a></span></label></div>
    <button class="btn btn-primary btn-lg btn-block" type="submit">${user ? html`Create contest and pay ${money(price(draft.size))}` : 'Log in to publish'}</button>
    <p class="small muted" style="margin:0;text-align:center">Net price, VAT is added at checkout. The contest goes live the moment it is paid.</p>
  </div>`;

const TIPS = {
  score: 'Participants collect points for results on your platform: orders, revenue, reviews… Up to three ways to score. Participants report their own totals and you check every winner.',
  rules: 'What participants must not do, or how things are counted. Clear rules make it easy to reject a winner who cheated.',
  requirements: 'Who may take part. Participants confirm they meet every requirement when they join.',
  about: 'Your pitch. Tell sellers why they should join and how you help them win.',
  questions: 'Optional multiple-choice questions every participant answers when joining. You see the answers as statistics, for example to learn about your new sellers.',
  company: 'Shown next to the contest so participants know who is behind it.',
};

/* ---------- page ---------- */

render(main, html`
<div class="page-band"><h1>Create new contest</h1></div>
${user ? '' : html`<div class="wrap" style="margin-top:24px"><div class="banner-note">You can fill everything in now. Your draft is kept in this browser and you log in before you publish. <a class="link" href="${loginUrl()}">Log in or sign up</a></div></div>`}
<form class="create" id="create" novalidate>
  <ol class="steps-nav" aria-label="Steps">${STEPS.map((s, i) => html`<li data-nav="${i}"><a href="#step-${s.key}"><span class="dot">${raw('<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')}</span>${s.name}</a></li>`)}</ol>
  <div>
    <section class="cstep" id="step-prize" data-step="0">${stepPrize()}${continueBtn(0)}</section>
    <section class="cstep" id="step-score" data-step="1">${stepHead('How to score', TIPS.score)}<div data-list="methods">${listBlock('methods')}</div>${continueBtn(1)}</section>
    <section class="cstep" id="step-rules" data-step="2">${stepHead('Rules', TIPS.rules)}<div data-list="rules">${listBlock('rules')}</div>${continueBtn(2)}</section>
    <section class="cstep" id="step-requirements" data-step="3">${stepHead('Requirements', TIPS.requirements)}<div id="req-box">${stepRequirements()}</div>${continueBtn(3)}</section>
    <section class="cstep" id="step-about" data-step="4">${stepHead('About the contest', TIPS.about)}${stepAbout()}${continueBtn(4)}</section>
    <section class="cstep" id="step-questions" data-step="5">${stepHead('Questions', TIPS.questions)}<div data-list="survey">${listBlock('survey')}</div>${continueBtn(5)}</section>
    <section class="cstep" id="step-company" data-step="6">${stepHead('About Company', TIPS.company)}${stepCompany()}</section>
  </div>
</form>
<datalist id="units"><option value="orders"><option value="sales"><option value="€ revenue"><option value="5-star reviews"><option value="bookings"><option value="new listings"></datalist>`);

const form = $('#create');

function showSteps() {
  $$('[data-step]').forEach((s) => { s.hidden = Number(s.dataset.step) > draft.reached; });
  $$('[data-step] .continue').forEach((b) => { b.hidden = Number(b.dataset.continue) < draft.reached; });
  $$('[data-nav]').forEach((li) => {
    const i = Number(li.dataset.nav);
    li.className = i < draft.reached ? 'done' : i === draft.reached ? 'current' : 'locked';
  });
}
showSteps();

/* ---------- live updates ---------- */

form.addEventListener('input', (e) => {
  const t = e.target;
  if (t.name && t.type !== 'radio' && t.type !== 'checkbox' && t.type !== 'file') {
    if (t.name.startsWith('company.')) draft.company[t.name.slice(8)] = t.value;
    else if (t.name in draft) draft[t.name] = t.value;
    const c = $(`[data-count="${t.name}"]`);
    if (c) c.textContent = `${t.value.length}/${t.maxLength}`;
    t.closest('.field')?.classList.remove('has-error');
    t.closest('.field')?.querySelector('.field-error')?.remove();
  }
  if (t.dataset.reqText) draft.req[t.dataset.reqText].text = t.value;
  save();
});

form.addEventListener('change', (e) => {
  const t = e.target;
  if (t.name === 'type' || t.name === 'size') {
    draft[t.name] = t.value;
    render($('#prize-live'), prizeLive());
    const pay = $('#create [type=submit]');
    if (user && pay) pay.textContent = `Create contest and pay ${money(price(draft.size))}`;
  }
  if (t.name === 'kind') draft.req.kind = t.value;
  if (t.name === 'terms') draft.terms = t.checked;
  if (t.dataset.reqOn) {
    const k = t.dataset.reqOn;
    if (k === 'realName') draft.req.realName = t.checked; else draft.req[k].on = t.checked;
    render($('#req-box'), stepRequirements());
    if (t.checked && k !== 'realName') $(`[data-field="req-${k}"] input:not([type=checkbox])`)?.focus();
  }
  if (t.dataset.answersN !== undefined) {
    const ed = t.closest('[data-editor]'), n = Number(t.value);
    const current = $$('[data-answer]', ed).map((i) => i.value);
    const q = { question: $('[data-k=question]', ed).value, answers: Array.from({ length: n }, (_, i) => current[i] || '') };
    ed.outerHTML = String(html`<div class="editor" data-editor="survey" data-index="${ed.dataset.index}">${LISTS.survey.editor(q)}${raw(ed.querySelector('.actions').outerHTML)}</div>`);
  }
  if (t.dataset.image) readImage(t);
  save();
});

function readImage(input) {
  const file = input.files[0], key = input.dataset.image;
  if (!file) return;
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return toast('Please use a PNG, JPEG or WebP image.', 'error');
  if (file.size > 1.5 * 1024 * 1024) return toast('That image is larger than 1.5 MB.', 'error');
  const r = new FileReader();
  r.onload = () => {
    draft[key] = r.result;
    save();
    redrawImages();
  };
  r.readAsDataURL(file);
}
function redrawImages() {
  const cover = $('[data-field="cover"]');
  const tmp = document.createElement('div');
  render(tmp, stepPrize());
  cover.replaceWith(tmp.querySelector('[data-field="cover"]'));
  const row = $('.upload-row');
  render(tmp, stepCompany());
  row.replaceWith(tmp.querySelector('.upload-row'));
}
const drop = () => $('#cover-drop');
form.addEventListener('dragover', (e) => { if (e.target.closest('#cover-drop')) { e.preventDefault(); drop().classList.add('over'); } });
form.addEventListener('dragleave', (e) => { if (e.target.closest('#cover-drop')) drop().classList.remove('over'); });
form.addEventListener('drop', (e) => {
  if (!e.target.closest('#cover-drop')) return;
  e.preventDefault();
  const input = $('[data-image=cover]');
  input.files = e.dataTransfer.files;
  readImage(input);
});

// Tag boxes: Enter or comma adds a tag, Backspace in an empty field removes the last one.
form.addEventListener('keydown', (e) => {
  const box = e.target.closest('[data-tags]');
  if (!box || e.target.tagName !== 'INPUT') {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') e.preventDefault();
    return;
  }
  const list = box.dataset.tags === 'tags' ? draft.tags : draft.req.regions.tags;
  const max = box.dataset.tags === 'tags' ? 6 : 12;
  if ((e.key === 'Enter' || e.key === ',') && e.target.value.trim()) {
    e.preventDefault();
    const tag = e.target.value.trim();
    e.target.value = ''; // the field is replaced below; an empty field keeps focusout from adding it again
    if (list.length < max && !list.includes(tag)) list.push(tag);
    redrawTags(box);
  } else if (e.key === 'Enter') e.preventDefault();
  else if (e.key === 'Backspace' && !e.target.value && list.length) { list.pop(); redrawTags(box); }
});
form.addEventListener('focusout', (e) => {
  const box = e.target.closest?.('[data-tags]');
  if (box?.isConnected && e.target.tagName === 'INPUT' && e.target.value.trim()) {
    const list = box.dataset.tags === 'tags' ? draft.tags : draft.req.regions.tags;
    const tag = e.target.value.trim();
    e.target.value = '';
    if (list.length < (box.dataset.tags === 'tags' ? 6 : 12) && !list.includes(tag)) list.push(tag);
    redrawTags(box, false);
  }
});
function redrawTags(box, focus = true) {
  const key = box.dataset.tags;
  const list = key === 'tags' ? draft.tags : draft.req.regions.tags;
  const ph = key === 'tags' ? 'Up to six keywords. Press Enter after each one' : 'Type a region and press Enter, e.g. London-Soho';
  box.outerHTML = String(tagBox(key, list, ph));
  if (focus) $(`[data-tags="${key}"] input`).focus();
  save();
}

/* ---------- clicks: lists, continue, images ---------- */

function saveEditor(key) {
  const ed = $(`[data-editor="${key}"]`);
  if (!ed) return true;
  const item = LISTS[key].read(ed);
  ed.querySelectorAll('.field-error').forEach((n) => n.remove());
  if (item.error) {
    const [k, msg] = item.error;
    const input = $(`[data-k="${k}"]`, ed) || $('[data-answer]', ed);
    input.closest('.field').insertAdjacentHTML('beforeend', `<div class="field-error">${esc(msg)}</div>`);
    input.focus();
    return false;
  }
  const i = Number(ed.dataset.index);
  if (i >= 0) draft[key][i] = item; else draft[key].push(item);
  editing[key] = null;
  save();
  redrawList(key);
  return true;
}
// An editor that is still empty can be dropped silently when the organizer moves on.
const editorEmpty = (key) => {
  const ed = $(`[data-editor="${key}"]`);
  return ed && Number(ed.dataset.index) < 0 && $$('input:not([type=radio]):not([type=number])', ed).every((i) => !i.value.trim());
};

form.addEventListener('click', (e) => {
  const b = e.target.closest('button, a');
  if (!b) return;
  const [key, idx] = (b.dataset.edit || b.dataset.del || '').split(':');
  if (b.dataset.add) {
    if ($(`[data-editor="${b.dataset.add}"]`) && !saveEditor(b.dataset.add)) return;
    editing[b.dataset.add] = -1;
    redrawList(b.dataset.add);
    $(`[data-editor="${b.dataset.add}"] input`)?.focus();
  } else if (b.dataset.edit) {
    editing[key] = Number(idx);
    redrawList(key);
    $(`[data-editor="${key}"] input`)?.focus();
  } else if (b.dataset.del) {
    if (Number(idx) >= 0) draft[key].splice(Number(idx), 1);
    editing[key] = draft[key].length || key === 'requirements' ? null : -1;
    save();
    redrawList(key);
  } else if (b.dataset.save) {
    saveEditor(b.dataset.save);
  } else if (b.dataset.cancel) {
    editing[b.dataset.cancel] = null;
    redrawList(b.dataset.cancel);
  } else if (b.dataset.untag !== undefined) {
    const box = b.closest('[data-tags]');
    (box.dataset.tags === 'tags' ? draft.tags : draft.req.regions.tags).splice(Number(b.dataset.untag), 1);
    redrawTags(box, false);
  } else if (b.dataset.clearImage) {
    draft[b.dataset.clearImage] = null;
    save();
    redrawImages();
  } else if (b.dataset.continue !== undefined) {
    const i = Number(b.dataset.continue);
    if (!checkStep(i)) return;
    draft.reached = Math.max(draft.reached, i + 1);
    save();
    showSteps();
    $(`[data-step="${i + 1}"]`).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

function fieldError(name, msg) {
  const field = $(`[data-field="${name}"]`);
  if (!field) return;
  field.classList.add('has-error');
  field.querySelector('.field-error')?.remove();
  field.insertAdjacentHTML('beforeend', `<div class="field-error">${esc(msg)}</div>`);
}
function checkStep(i) {
  $$(`[data-step="${i}"] .field-error`).forEach((n) => n.remove());
  $$(`[data-step="${i}"] .has-error`).forEach((n) => n.classList.remove('has-error'));
  const errors = [];
  const need = (ok, name, msg) => { if (!ok) { fieldError(name, msg); errors.push(name); } };
  if (i === 0) {
    need(draft.title.trim().length >= 4, 'title', 'Give the contest a name (at least 4 characters).');
    need(/^https?:\/\/\S+\.\S+/.test(draft.platformUrl.trim()), 'platformUrl', 'Link to the site where participants compete (https://…).');
  }
  for (const [step, key] of [[1, 'methods'], [2, 'rules'], [3, 'requirements'], [5, 'survey']]) {
    if (i !== step || !$(`[data-editor="${key}"]`)) continue;
    if (editorEmpty(key)) { editing[key] = null; redrawList(key); } else if (!saveEditor(key)) errors.push(key);
  }
  if (i === 1 && !draft.methods.length && !errors.length) {
    editing.methods = -1;
    redrawList('methods');
    toast('Add at least one way to score.', 'error');
    errors.push('methods');
  }
  if (i === 3) {
    for (const k of ['category', 'demographics', 'roles']) need(!draft.req[k].on || draft.req[k].text.trim(), `req-${k}`, 'Fill this in, or switch it off.');
    need(!draft.req.regions.on || draft.req.regions.tags.length, 'req-regions', 'Add at least one region, or switch it off.');
  }
  if (i === 4) need(draft.summary.trim().length >= 20, 'summary', 'Describe the contest in at least 20 characters.');
  if (errors.length) $(`[data-step="${i}"] .has-error, [data-step="${i}"] .field-error`)?.closest('.field, .toggle-q, .editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return !errors.length;
}

/* ---------- submit ---------- */

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  for (let i = 0; i < STEPS.length - 1; i++) {
    if (!checkStep(i)) { draft.reached = Math.max(draft.reached, i); showSteps(); return; }
  }
  if (!draft.terms) return fieldError('terms', 'Please accept the terms and conditions.');
  if (!user) { save(); return location.assign(loginUrl()); }
  const btn = $('#create [type=submit]');
  btn.disabled = true;
  try {
    const { id } = await api('POST', '/api/contests', {
      title: draft.title, type: draft.type, size: draft.size, platformUrl: draft.platformUrl.trim(),
      summary: draft.summary, purpose: draft.purpose, audience: draft.audience, howToWin: draft.howToWin, boost: draft.boost,
      tags: draft.tags, methods: draft.methods, rules: draft.rules, requirements: requirementsOut(), survey: draft.survey,
      company: draft.company, theme: Math.floor(Math.random() * 6), cover: draft.cover || undefined, logo: draft.logo || undefined,
    });
    localStorage.removeItem(STORE);
    // If checkout can't start, the draft is saved and can be paid from its page.
    const pay = await api('POST', `/api/contests/${encodeURIComponent(id)}/checkout`).catch(() => ({}));
    location.assign(pay.url || `/c/${encodeURIComponent(id)}`);
  } catch (err) {
    btn.disabled = false;
    if (!(err instanceof ApiError)) return toast('Network problem. Please try again.', 'error');
    const fields = Object.entries(err.fields);
    for (const [name, msg] of fields) fieldError(name, msg);
    const first = fields.map(([n]) => FIELD_STEP[n]).filter((n) => n !== undefined).sort()[0];
    if (first !== undefined) $(`[data-step="${first}"]`).scrollIntoView({ behavior: 'smooth' });
    toast(err.message, 'error');
  }
});
