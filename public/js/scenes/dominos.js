// Domino chain: each stone ~1.45x the one before. The caped hero kicks the
// smallest one, the chain amplifies and the giant falls. Plays when the section
// scrolls into view; a click sets the stones up again and replays it.
import { createStage, el, svgFrom, sprite, Particles, buildHero, clamp, lerp, rand, easeOut, easeIn, easeInOut, reduced, f1, f2 } from './engine.js';

const W = 1600, H = 800, FLOOR = 600;
const LABELS = ['Contest', 'First sellers', 'First buyers', 'More sellers', 'More buyers', 'Network effects'];
const COLORS = [
  ['#1d1830', '#9c88cc'], ['#b0420f', '#ffb04a'], ['#5b1a7a', '#ff3fe0'],
  ['#a88c08', '#ebed04'], ['#0f6f73', '#20e3b2'], ['#9a1d06', '#ff5028'],
];
const PIPS = [[1, 0], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5]];

export function dominoScene(section) {
  const st = createStage(section, { W, H, focus: [600, 160, 980, 520], frontMask: [0.7, 0.55], shade: [0.22, 0.5, 0.5, 0.55, 0.75] });
  const { bg, art } = st;

  // geometry: heights grow by 1.42; each gap is half the stone's height, so a
  // falling stone touches the next one at 30 degrees. The giant lands at x ~ 1575.
  const stones = [];
  let x = 720;
  for (let i = 0; i < 6; i++) {
    const h = 56 * Math.pow(1.4, i), w = h * .27;
    stones.push({ i, x, h, w, gap: h * .5, angle: 0 });
    x += w + h * .5;
  }

  /* ---------- background ---------- */
  svgFrom(`<defs>
    <linearGradient id="dSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03031a"/><stop offset=".7" stop-color="#140530"/><stop offset="1" stop-color="#0a0320"/></linearGradient>
    <radialGradient id="dAcid"><stop offset="0" stop-color="#ebed04" stop-opacity=".75"/><stop offset=".3" stop-color="#9aa82a" stop-opacity=".3"/><stop offset="1" stop-color="#140530" stop-opacity="0"/></radialGradient>
    <radialGradient id="dBlue"><stop offset="0" stop-color="#3658e2" stop-opacity=".6"/><stop offset="1" stop-color="#3658e2" stop-opacity="0"/></radialGradient>
    <radialGradient id="dMag"><stop offset="0" stop-color="#ff3fe0" stop-opacity=".4"/><stop offset="1" stop-color="#ff3fe0" stop-opacity="0"/></radialGradient>
    <linearGradient id="dFloor" x1="0" y1="${FLOOR}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1c0b3a"/><stop offset="1" stop-color="#05020f"/></linearGradient>
    <filter id="dSmoke" x="-25%" y="-25%" width="150%" height="150%">
      <feTurbulence type="fractalNoise" baseFrequency=".008 .013" numOctaves="3" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="70" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="4"/>
    </filter>
    <filter id="dHaze" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".005 .008" numOctaves="3" seed="21"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .2  0 0 0 1.5 -.6"/>
    </filter>
    <filter id="dBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect x="-200" y="-200" width="2000" height="1200" fill="url(#dSky)"/>
  <ellipse cx="1400" cy="430" rx="700" ry="420" fill="url(#dAcid)"/>
  <ellipse cx="300" cy="120" rx="600" ry="380" fill="url(#dBlue)"/>
  <ellipse cx="900" cy="560" rx="520" ry="200" fill="url(#dMag)"/>
  <rect x="-200" y="${FLOOR}" width="2000" height="${H - FLOOR + 200}" fill="url(#dFloor)"/>
  <g id="dGrid" stroke="#9c88cc" stroke-width="1" opacity=".16"></g>
  <path d="M-200 ${FLOOR} H 1800" stroke="#ff3fe0" stroke-width="3" opacity=".6" filter="url(#dBlur)"/>
  <path d="M-200 ${FLOOR} H 1800" stroke="#ffb0f0" stroke-width="1" opacity=".55"/>
  <g filter="url(#dSmoke)" fill="#02010c" opacity=".9">
    <path d="M-100 -100 H 800 C 600 0 380 60 200 40 C 80 30 0 110 -100 180 Z"/>
    <path d="M1700 -100 H 1250 C 1360 -10 1480 40 1560 120 C 1620 180 1650 260 1700 320 Z"/>
  </g>
  <rect x="-200" y="-200" width="2000" height="1200" filter="url(#dHaze)"/>`, bg);
  const grid = bg.querySelector('#dGrid');
  for (let k = -14; k <= 14; k++) el('line', { x1: 800 + k * 40, y1: FLOOR, x2: 800 + k * 260, y2: H + 60 }, grid);
  for (let k = 1; k < 8; k++) { const y = FLOOR + Math.pow(k / 8, 1.8) * (H - FLOOR + 60); el('line', { x1: -200, y1: f1(y), x2: 1800, y2: f1(y) }, grid); }
  let seed = 4;
  const srnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 110; i++) el('circle', { cx: f1(srnd() * W), cy: f1(srnd() * (FLOOR - 80)), r: f2(srnd() * 1.2 + .3), fill: '#fff', opacity: f2(srnd() * .6 + .15) }, bg);
  st.finishBg();

  /* ---------- stones ---------- */
  const defs = svgFrom('<defs></defs>', art);
  COLORS.forEach(([base, neon], i) => {
    defs.insertAdjacentHTML('beforeend', `<linearGradient id="dFace${i}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#05030c"/><stop offset=".35" stop-color="${base}"/><stop offset=".85" stop-color="${base}"/><stop offset="1" stop-color="${neon}"/></linearGradient>`);
  });
  // Reflections fade into the floor under a gradient overlay (an SVG mask would be
  // re-evaluated on every frame while the stones move).
  defs.insertAdjacentHTML('beforeend', `<linearGradient id="dReflFade" x1="0" y1="${FLOOR}" x2="0" y2="${FLOOR + 170}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#1c0b3a" stop-opacity=".55"/><stop offset="1" stop-color="#0c0420" stop-opacity="1"/></linearGradient>`);

  const reflections = el('g', { opacity: .45 }, art);
  el('rect', { x: -200, y: FLOOR, width: 2000, height: H - FLOOR + 200, fill: 'url(#dReflFade)' }, art);
  const stoneLayer = el('g', {}, art);
  const labelLayer = el('g', {}, art);

  for (const s of stones) {
    const [base, neon] = COLORS[s.i];
    const top = FLOOR - s.h, d = s.h * .07;
    s.g = el('g', { id: `dom${s.i}` }, stoneLayer);
    // side face (depth), front face, inset frame, centre bar, pips, neon edges
    el('path', { d: `M${f1(s.x + s.w)} ${f1(top)} l${f1(d)} ${f1(-d * .6)} v${f1(s.h)} l${f1(-d)} ${f1(d * .6)} Z`, fill: '#05030c' }, s.g);
    el('path', { d: `M${f1(s.x)} ${f1(top)} l${f1(d)} ${f1(-d * .6)} h${f1(s.w)} l${f1(-d)} ${f1(d * .6)} Z`, fill: neon, opacity: .55 }, s.g);
    el('rect', { x: f1(s.x), y: f1(top), width: f1(s.w), height: f1(s.h), rx: 2, fill: `url(#dFace${s.i})` }, s.g);
    const ins = Math.max(3, s.w * .12);
    el('rect', { x: f1(s.x + ins), y: f1(top + ins), width: f1(s.w - 2 * ins), height: f1(s.h - 2 * ins), rx: 2, fill: 'none', stroke: neon, 'stroke-width': f1(Math.max(1, s.w * .03)), opacity: .45 }, s.g);
    el('line', { x1: f1(s.x + ins), y1: f1(top + s.h / 2), x2: f1(s.x + s.w - ins), y2: f1(top + s.h / 2), stroke: neon, 'stroke-width': f1(Math.max(1.2, s.w * .05)), opacity: .7 }, s.g);
    const pip = (n, cy0) => {
      const pts = { 1: [[.5, .5]], 2: [[.3, .25], [.7, .75]], 3: [[.3, .2], [.5, .5], [.7, .8]], 4: [[.3, .25], [.7, .25], [.3, .75], [.7, .75]], 5: [[.3, .2], [.7, .2], [.5, .5], [.3, .8], [.7, .8]], 6: [[.3, .18], [.7, .18], [.3, .5], [.7, .5], [.3, .82], [.7, .82]] }[n] || [];
      const hh = s.h / 2 - ins * 2;
      for (const [px, py] of pts) el('circle', { cx: f1(s.x + s.w * px), cy: f1(cy0 + ins + py * hh), r: f1(s.w * .085), fill: neon }, s.g);
    };
    pip(PIPS[s.i][0], top);
    pip(PIPS[s.i][1], top + s.h / 2);
    el('path', { d: `M${f1(s.x + s.w)} ${f1(top + 2)} V${f1(FLOOR - 2)}`, stroke: neon, 'stroke-width': 5, opacity: .25 }, s.g);
    el('path', { d: `M${f1(s.x + s.w)} ${f1(top + 2)} V${f1(FLOOR - 2)}`, stroke: neon, 'stroke-width': 1.6, opacity: .9 }, s.g);
    el('use', { href: `#dom${s.i}`, transform: `translate(0 ${2 * FLOOR}) scale(1 -1)` }, reflections);

    s.label = el('text', { x: f1(s.x + s.w / 2), y: FLOOR + 32 + (s.i % 3) * 24, 'text-anchor': 'middle', fill: '#8a82aa', 'font-size': 14 + s.i * 1.6, 'font-weight': 800, 'font-family': 'Catamaran, system-ui, sans-serif', 'letter-spacing': '.06em' }, labelLayer);
    s.label.textContent = LABELS[s.i].toUpperCase();
    s.neon = neon;
  }

  const heroWrap = el('g', { opacity: 0 }, art);
  const hero = buildHero(heroWrap, { scale: 2.1, id: 'dHero' });

  /* ---------- effects ---------- */
  const SPR = { dust: sprite('rgba(120,96,160,.85)', 96, .2), glow: sprite('rgba(255,236,120,.85)', 128, 0), spark: sprite('rgba(255,255,220,1)', 32, .3) };
  const dust = new Particles(140), sparks = new Particles(120);
  const glows = COLORS.map(([, n]) => sprite(hexA(n, .8), 128, 0));

  /* ---------- timeline ---------- */
  // Each stone falls with a period that grows with sqrt(height), like a real domino.
  const KICK = 1.25;
  const fallDur = (s) => .38 * Math.sqrt(s.h / 56);
  const contact = (s) => Math.asin(Math.min(.95, s.gap / s.h)) * 180 / Math.PI;
  let start = 0;
  for (const s of stones) { s.start = KICK + start; start += fallDur(s); }
  const END = stones[5].start + fallDur(stones[5]) * 1.6;

  const state = { mode: reduced ? 'done' : 'waiting', t: 0, shake: 0, reset: 0 };
  let flash = 0, impacted = false;

  st.onVisible = (ratio) => { if (state.mode === 'waiting' && ratio >= .35) { state.mode = 'play'; state.t = 0; } };
  st.clicks.push(() => {
    if (state.mode === 'done') { state.mode = 'reset'; state.reset = 0; return true; }
    return false;
  });

  function stoneAngle(s, t) {
    const dt = t - s.start, d = fallDur(s), c = contact(s);
    if (dt <= 0) return 0;
    if (s.i === 5) {                    // the giant: accelerates all the way to the floor, small bounce
      const k = dt / (d * 1.6);
      if (k < 1) return 90 * easeIn(k) ** .8;
      const b = (dt - d * 1.6) / .35;
      return b < 1 ? 90 - Math.sin(b * Math.PI) * 4 * (1 - b) : 90;
    }
    if (dt < d) return c * easeIn(dt / d) ** .7;                          // tip over until it hits the next stone
    const next = stones[s.i + 1], nk = clamp(stoneAngle(next, t) / 90, 0, 1);
    return c + (68 - c) * easeOut(nk);                                     // then lean as the next one falls
  }

  /* ---------- per frame ---------- */
  const L = st.light, D = st.dark;
  const draw = (ctx, img, x0, y0, size, a) => { ctx.globalAlpha = a; ctx.drawImage(img, x0 - size / 2, y0 - size / 2, size, size); };

  st.frames.push((t, dt) => {
    st.toArtT(L); st.toArtT(D);
    hero.setCape(t, 1.2);
    flash *= Math.pow(.03, dt);
    let T = 0;
    if (state.mode === 'play') { state.t += dt; T = state.t; if (T > END + 1) state.mode = 'done'; }
    else if (state.mode === 'done') T = END + 2;
    else if (state.mode === 'reset') {
      state.reset += dt;
      const k = clamp(state.reset / .9, 0, 1);
      for (const s of stones) { s.angle = lerp(s.angleAtReset ?? s.angle, 0, easeInOut(k)); }
      if (state.reset === dt) stones.forEach((s) => { s.angleAtReset = s.angle; });
      if (k >= 1) { state.mode = 'play'; state.t = 0; impacted = false; stones.forEach((s) => { delete s.angleAtReset; }); }
    }

    if (state.mode !== 'reset' && state.mode !== 'waiting') for (const s of stones) s.angle = stoneAngle(s, T);
    if (state.mode === 'waiting') for (const s of stones) s.angle = 0;

    // impact of the giant
    const giant = stones[5];
    if (!impacted && giant.angle >= 89.5 && state.mode === 'play') {
      impacted = true; flash = 1; state.shake = 1;
      for (let i = 0; i < 46; i++) dust.add({ x: giant.x + giant.w + rand(0, giant.h), y: FLOOR - rand(0, 20), vx: rand(-160, 220), vy: rand(-90, -10), life: rand(1.8, 3.6), s0: 30, s1: rand(90, 190) });
      for (let i = 0; i < 40; i++) sparks.add({ x: giant.x + giant.w + rand(0, giant.h), y: FLOOR - 4, vx: rand(-260, 260), vy: rand(-380, -80), life: rand(.6, 1.2), size: rand(3, 7) });
    }
    state.shake *= Math.pow(.02, dt);
    const sh = state.shake > .02 ? `translate(${f1(rand(-6, 6) * state.shake)} ${f1(rand(-4, 4) * state.shake)})` : '';
    stoneLayer.setAttribute('transform', sh);

    for (const s of stones) {
      s.g.setAttribute('transform', s.angle > .01 ? `rotate(${f2(s.angle)} ${f1(s.x + s.w)} ${FLOOR})` : '');
      const lit = s.angle > 5;
      s.label.setAttribute('fill', lit ? s.neon : '#8a82aa');
      s.label.setAttribute('opacity', lit ? 1 : .75);
      if (lit) draw(L, glows[s.i], s.x + s.w / 2, FLOOR + 26 + (s.i % 3) * 24, 90 + s.i * 30, .35);
      // the stone that is falling right now glows
      if (s.angle > 1 && s.angle < contact(s) + 2 && state.mode === 'play') draw(L, glows[s.i], s.x + s.w, FLOOR - s.h * .6, s.h * 1.4, .35);
    }
    if (impacted) draw(L, SPR.glow, giant.x + giant.w + giant.h * .5, FLOOR - 20, 700, .25 + flash * .5);

    // hero: swoop in, kick, follow the chain, land on the fallen giant
    let hx, hy, rot, sc = 1, vis = 1;
    if (state.mode === 'waiting' || state.mode === 'reset') {
      vis = state.mode === 'reset' ? 1 - clamp(state.reset / .5, 0, 1) : 0;
      hx = lerp(heroLanded().x, -150, clamp(state.reset / .9, 0, 1)); hy = heroLanded().y - 200 * clamp(state.reset / .9, 0, 1); rot = -20; sc = -1;
    } else if (T < KICK) {
      const k = easeInOut(T / KICK);
      hx = lerp(-160, stones[0].x - 26, k); hy = lerp(120, FLOOR - stones[0].h * .75, k) - Math.sin(k * Math.PI) * 60; rot = lerp(30, 64, k);
    } else if (T < KICK + .25) {
      hx = stones[0].x - 26 + (T - KICK) * 40; hy = FLOOR - stones[0].h * .75; rot = 64;
      if (T - KICK < dt * 1.5) { flash = Math.max(flash, .35); for (let i = 0; i < 18; i++) sparks.add({ x: stones[0].x, y: FLOOR - stones[0].h * .7, vx: rand(40, 260), vy: rand(-200, 60), life: rand(.3, .7), size: rand(3, 6) }); }
    } else {
      const land = heroLanded();
      const k = clamp((T - KICK - .25) / (END - KICK + .4), 0, 1);
      const e = easeInOut(k);
      hx = lerp(stones[0].x - 16, land.x, e); hy = lerp(FLOOR - stones[0].h * .75, land.y, e) - Math.sin(e * Math.PI) * 240;
      rot = lerp(40, -30, e);
    }
    heroWrap.setAttribute('opacity', f2(vis));
    heroWrap.setAttribute('transform', `translate(${f1(hx)} ${f1(hy)}) scale(${sc < 0 ? -1 : 1} 1) rotate(${f1(rot)})`);
    if (state.mode === 'play' && T > KICK && T < END && Math.random() < .5) sparks.add({ x: hx - 20, y: hy + 10, vx: rand(-30, 30), vy: rand(-10, 30), life: .5, size: 4 });

    L.globalCompositeOperation = 'lighter';
    sparks.step(dt, (q, k) => { q.vy += 500 * dt; q.x += q.vx * dt; q.y += q.vy * dt; draw(L, SPR.spark, q.x, q.y, q.size, 1 - k); });
    L.globalCompositeOperation = 'source-over';
    dust.step(dt, (q, k) => {
      q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= Math.pow(.4, dt); q.vy *= Math.pow(.5, dt);
      draw(D, SPR.dust, q.x, q.y, lerp(q.s0, q.s1, easeOut(k)), Math.sin(Math.PI * Math.min(1, k * 2)) * .45 * (1 - k));
    });
    if (flash > .02) { L.setTransform(1, 0, 0, 1, 0, 0); L.globalAlpha = flash * .25; L.fillStyle = '#fff6d0'; L.fillRect(0, 0, st.fxLight.width, st.fxLight.height); }
    L.globalAlpha = 1; D.globalAlpha = 1;
  });

  // where the hero stands after the giant fell: on its upper side, near the far end
  function heroLanded() {
    const g = stones[5];
    return { x: g.x + g.w + g.h * .78, y: FLOOR - g.w - 34 };
  }

  if (reduced) st.renderOnce();
  return st;
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
