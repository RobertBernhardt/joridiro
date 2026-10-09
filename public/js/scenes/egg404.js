// 404: a startled egg between two neon fours. Its eyes follow the pointer;
// each click makes it flinch and crack, the third one hatches the caped hero.
import { createStage, el, svgFrom, sprite, Particles, buildHero, clamp, lerp, rand, easeOut, backOut, reduced, f1, f2 } from './engine.js';

const W = 1400, H = 800, EX = 700, EY = 380;

export function egg404Scene(section) {
  const st = createStage(section, { W, H, focus: [330, 80, 740, 470], frontMask: [0.5, 0.45], shade: null });
  const { bg, art } = st;

  svgFrom(`<defs>
    <linearGradient id="eSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03031a"/><stop offset="1" stop-color="#170632"/></linearGradient>
    <radialGradient id="eGlowA"><stop offset="0" stop-color="#ff3fe0" stop-opacity=".5"/><stop offset="1" stop-color="#ff3fe0" stop-opacity="0"/></radialGradient>
    <radialGradient id="eGlowB"><stop offset="0" stop-color="#c6ff3a" stop-opacity=".45"/><stop offset="1" stop-color="#c6ff3a" stop-opacity="0"/></radialGradient>
    <filter id="eNeon" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="eHaze" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".005 .008" numOctaves="3" seed="2"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .08  0 0 0 0 .05  0 0 0 0 .2  0 0 0 1.5 -.6"/></filter>
  </defs>
  <rect x="-200" y="-200" width="1800" height="1200" fill="url(#eSky)"/>
  <ellipse cx="330" cy="330" rx="360" ry="320" fill="url(#eGlowA)"/>
  <ellipse cx="1070" cy="330" rx="360" ry="320" fill="url(#eGlowB)"/>
  <rect x="-200" y="520" width="1800" height="500" fill="#0c0322"/>
  <path d="M-200 520 H 1600" stroke="#9c88cc" stroke-width="2" opacity=".35"/>
  <rect x="-200" y="-200" width="1800" height="1200" filter="url(#eHaze)"/>`, bg);
  st.finishBg();

  // neon fours: blurred glow tube (static) + thin bright core that flickers
  const four = (x) => `M${x + 70} 510 V 160 L ${x - 70} 380 H ${x + 110}`;
  const tubes = [];
  for (const [x, color] of [[330, '#ff3fe0'], [1070, '#c6ff3a']]) {
    svgFrom(`<path d="${four(x)}" fill="none" stroke="${color}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" opacity=".55" filter="url(#eNeon)"/>`, bg);
    tubes.push(svgFrom(`<path d="${four(x)}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>`, art));
  }

  svgFrom(`<defs>
    <radialGradient id="eShell" cx="${EX - 40}" cy="${EY - 120}" r="230" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fffbea"/><stop offset=".5" stop-color="#e8dcc0"/><stop offset=".85" stop-color="#9a8398"/><stop offset="1" stop-color="#4a3058"/>
    </radialGradient>
    <clipPath id="eEyeL"><ellipse cx="${EX - 42}" cy="${EY - 70}" rx="30" ry="36"/></clipPath>
    <clipPath id="eEyeR"><ellipse cx="${EX + 42}" cy="${EY - 70}" rx="30" ry="36"/></clipPath>
  </defs>`, art);
  const egg = el('g', {}, art);
  const shadow = el('ellipse', { cx: EX, cy: 522, rx: 120, ry: 14, fill: '#000', opacity: .45 }, art);
  art.insertBefore(shadow, egg);
  const body = el('g', {}, egg);
  el('path', { d: `M${EX} ${EY - 190} C ${EX + 92} ${EY - 190} ${EX + 128} ${EY - 40} ${EX + 128} ${EY + 20} C ${EX + 128} ${EY + 100} ${EX + 72} ${EY + 140} ${EX} ${EY + 140} C ${EX - 72} ${EY + 140} ${EX - 128} ${EY + 100} ${EX - 128} ${EY + 20} C ${EX - 128} ${EY - 40} ${EX - 92} ${EY - 190} ${EX} ${EY - 190} Z`, fill: 'url(#eShell)' }, body);
  el('path', { d: `M${EX - 112} ${EY - 20} C ${EX - 108} ${EY - 110} ${EX - 60} ${EY - 182} ${EX - 6} ${EY - 188}`, stroke: '#ff3fe0', 'stroke-width': 4, fill: 'none', opacity: .6, 'stroke-linecap': 'round' }, body);
  el('path', { d: `M${EX + 116} ${EY - 10} C ${EX + 120} ${EY + 60} ${EX + 90} ${EY + 120} ${EX + 30} ${EY + 136}`, stroke: '#c6ff3a', 'stroke-width': 4, fill: 'none', opacity: .55, 'stroke-linecap': 'round' }, body);
  const eyes = [];
  for (const [dx, clip] of [[-42, 'eEyeL'], [42, 'eEyeR']]) {
    el('ellipse', { cx: EX + dx, cy: EY - 70, rx: 30, ry: 36, fill: '#fff' }, body);
    const g = el('g', { 'clip-path': `url(#${clip})` }, body);
    const iris = el('g', {}, g);
    el('circle', { cx: EX + dx, cy: EY - 66, r: 15, fill: '#20e3b2' }, iris);
    el('circle', { cx: EX + dx, cy: EY - 66, r: 8, fill: '#05030c' }, iris);
    el('circle', { cx: EX + dx + 5, cy: EY - 72, r: 4, fill: '#fff' }, iris);
    const lid = el('rect', { x: EX + dx - 32, y: EY - 108, width: 64, height: 0, fill: '#d9c9ad' }, g);
    eyes.push({ iris, lid });
    el('ellipse', { cx: EX + dx, cy: EY - 70, rx: 30, ry: 36, fill: 'none', stroke: '#3a2442', 'stroke-width': 3 }, body);
  }
  const browL = el('path', { d: `M${EX - 70} ${EY - 122} Q ${EX - 44} ${EY - 140} ${EX - 18} ${EY - 124}`, stroke: '#3a2442', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, body);
  const browR = el('path', { d: `M${EX + 18} ${EY - 124} Q ${EX + 44} ${EY - 140} ${EX + 70} ${EY - 122}`, stroke: '#3a2442', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, body);
  const mouth = el('ellipse', { cx: EX, cy: EY + 22, rx: 22, ry: 30, fill: '#2a0e22' }, body);
  el('ellipse', { cx: EX, cy: EY + 36, rx: 12, ry: 9, fill: '#ff5a7a', opacity: .8 }, body);
  const cracks = [
    `M${EX - 60} ${EY - 160} l 18 22 l -10 18 l 22 14`,
    `M${EX + 96} ${EY - 90} l -24 16 l 8 20 l -22 10 l 6 20`,
    `M${EX - 128} ${EY + 30} l 40 -6 l 16 18 l 36 -10 l 22 16 l 40 -14 l 30 10 l 36 -8 l 30 6 l 36 -6`,
  ].map((d) => el('path', { d, stroke: '#c6ff3a', 'stroke-width': 4, fill: 'none', 'stroke-linejoin': 'round', opacity: 0 }, body));

  const heroWrap = el('g', { opacity: 0 }, art);
  const hero = buildHero(heroWrap, { scale: 3 });

  const SPR = { lime: sprite('rgba(198,255,58,.9)', 64, .1), spark: sprite('rgba(255,250,220,1)', 32, .3) };
  const sparks = new Particles(120);
  const s = { hits: 0, flinch: 0, kx: 0, hatchT: -1, look: { x: EX, y: EY - 300 }, cur: { x: 0, y: 0 }, blinkAt: 2, blink: 0 };

  section.addEventListener('pointermove', (e) => { s.look = st.toArt(e.clientX, e.clientY); st.kick(); });
  st.clicks.push((p) => {
    if (s.hatchT >= 0) return true;
    const onEgg = Math.hypot((p.x - EX) / 130, (p.y - (EY - 20)) / 170) < 1;
    if (!onEgg) { s.look = p; return true; }
    s.hits++; s.flinch = 1; s.kx = p.x < EX ? 1 : -1;
    for (let i = 0; i < 14; i++) sparks.add({ x: p.x, y: p.y, vx: rand(-200, 200), vy: rand(-260, 0), life: rand(.4, .8), size: rand(3, 6) });
    if (s.hits >= 3) s.hatchT = 0;
    return true;
  });

  const L = st.light;
  const draw = (img, x, y, size, a) => { L.globalAlpha = a; L.drawImage(img, x - size / 2, y - size / 2, size, size); };

  st.frames.push((t, dt) => {
    st.toArtT(L);
    hero.setCape(t, 1.3);
    // neon flicker: mostly steady, occasional stutter
    tubes.forEach((tube, i) => tube.setAttribute('opacity', (Math.sin(t * 37 + i * 9) > .96 || (t + i * 3.3) % 7 < .12) ? .25 : .95));

    // gaze
    const dx = s.look.x - EX, dy = s.look.y - (EY - 70), d = Math.hypot(dx, dy) || 1;
    const k = clamp(d / 200, 0, 1);
    s.cur.x = lerp(s.cur.x, dx / d * 12 * k, 1 - Math.pow(.001, dt));
    s.cur.y = lerp(s.cur.y, dy / d * 14 * k, 1 - Math.pow(.001, dt));
    eyes.forEach((e) => e.iris.setAttribute('transform', `translate(${f1(s.cur.x)} ${f1(s.cur.y)})`));

    // blink
    if (t > s.blinkAt) { s.blink = 1; s.blinkAt = t + rand(2.5, 5); }
    s.blink = Math.max(0, s.blink - dt * 7);
    const lid = Math.max(s.blink > .5 ? 2 - s.blink * 2 : s.blink * 2, s.flinch * .55);
    eyes.forEach((e) => e.lid.setAttribute('height', f1(lid * 76)));

    // flinch + idle wobble
    s.flinch = Math.max(0, s.flinch - dt * 1.8);
    const wob = Math.sin(t * 1.6) * 2 + s.flinch * Math.sin(t * 40) * 6 * s.kx;
    const squash = 1 - s.flinch * .06;
    const ty = 0;
    if (s.hatchT >= 0) {
      s.hatchT += dt;
      if (s.hatchT > .6 && s.hatchT - dt <= .6) for (let i = 0; i < 50; i++) sparks.add({ x: EX + rand(-60, 60), y: EY - 150, vx: rand(-300, 300), vy: rand(-500, -100), life: rand(.7, 1.4), size: rand(4, 9), lime: true });
      const hk = clamp((s.hatchT - .6) / 2.4, 0, 1);
      heroWrap.setAttribute('opacity', hk > 0 && hk < 1 ? 1 : 0);
      heroWrap.setAttribute('transform', `translate(${f1(EX + hk * 900)} ${f1(EY - 160 - hk * 700 - Math.sin(hk * Math.PI) * 60)}) scale(${f2(backOut(Math.min(1, hk * 5)))}) rotate(${f1(20)})`);
      if (s.hatchT > 5) { s.hatchT = -1; s.hits = 0; }
    }
    body.setAttribute('transform', `rotate(${f2(wob)} ${EX} ${EY + 140}) translate(0 ${EY + 140 + ty}) scale(1 ${f2(squash)}) translate(0 ${-(EY + 140)})`);
    browL.setAttribute('transform', `translate(0 ${f1(-s.flinch * 10)})`);
    browR.setAttribute('transform', `translate(0 ${f1(-s.flinch * 10)})`);
    mouth.setAttribute('ry', f1(30 + s.flinch * 10));
    cracks.forEach((c, i) => c.setAttribute('opacity', s.hits > i || (s.hatchT >= 0 && i === 2) ? .95 : 0));
    if (s.hits > 0) draw(SPR.lime, EX, EY - 80, 320, .12 * s.hits + s.flinch * .2);

    L.globalCompositeOperation = 'lighter';
    sparks.step(dt, (q, k2) => { q.vy += 600 * dt; q.x += q.vx * dt; q.y += q.vy * dt; draw(q.lime ? SPR.lime : SPR.spark, q.x, q.y, q.size, 1 - k2); });
    L.globalCompositeOperation = 'source-over';
    L.globalAlpha = 1;
  });

  if (reduced) st.renderOnce();
  return st;
}
