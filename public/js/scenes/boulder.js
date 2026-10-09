// The problem: a lone seller pushes a huge ball up a hill and keeps slipping back.
// Click: a prize trophy drops onto the crest, the seller gets a surge, pushes the
// ball over the top, and the lights of the buyers' town behind the hill come on.
import { createStage, el, svgFrom, sprite, Particles, clamp, lerp, rand, easeOut, easeIn, easeInOut, backOut, reduced, f1, f2 } from './engine.js';

const W = 1600, H = 800;
const A = { x: 560, y: 760 }, C = { x: 1300, y: 400 };   // slope foot and crest
const LEN = Math.hypot(C.x - A.x, C.y - A.y);
const D = { x: (C.x - A.x) / LEN, y: (C.y - A.y) / LEN };   // uphill direction
const N = { x: D.y, y: -D.x };                              // surface normal (points up)
const SLOPE_DEG = Math.atan2(D.y, D.x) * 180 / Math.PI;
const R = 96;                                               // ball radius

export function boulderScene(section) {
  const st = createStage(section, { W, H, focus: [500, 250, 700, 520], frontMask: [0.62, 0.5], shade: [0.22, 0.5, 0.5, 0.55, 0.75] });
  const { bg, art } = st;

  /* ---------- background ---------- */
  svgFrom(`<defs>
    <linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03031a"/><stop offset=".6" stop-color="#120632"/><stop offset="1" stop-color="#1e0838"/></linearGradient>
    <radialGradient id="bMoonGlow"><stop offset="0" stop-color="#ebed04" stop-opacity=".7"/><stop offset=".25" stop-color="#d8e418" stop-opacity=".3"/><stop offset="1" stop-color="#1e0838" stop-opacity="0"/></radialGradient>
    <radialGradient id="bMoon" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fbffd0"/><stop offset=".6" stop-color="#e2e87a"/><stop offset="1" stop-color="#9aa63a"/></radialGradient>
    <radialGradient id="bBlue"><stop offset="0" stop-color="#3658e2" stop-opacity=".55"/><stop offset="1" stop-color="#3658e2" stop-opacity="0"/></radialGradient>
    <filter id="bSmoke" x="-25%" y="-25%" width="150%" height="150%">
      <feTurbulence type="fractalNoise" baseFrequency=".008 .012" numOctaves="3" seed="13" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="70" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="4"/>
    </filter>
    <filter id="bHaze" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".005 .008" numOctaves="3" seed="5"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .08  0 0 0 0 .06  0 0 0 0 .18  0 0 0 1.5 -.6"/>
    </filter>
  </defs>
  <rect x="-200" y="-200" width="2000" height="1200" fill="url(#bSky)"/>
  <ellipse cx="260" cy="140" rx="600" ry="380" fill="url(#bBlue)"/>
  <circle cx="1330" cy="230" r="430" fill="url(#bMoonGlow)"/>
  <circle cx="1330" cy="230" r="78" fill="url(#bMoon)"/>
  <circle cx="1305" cy="215" r="12" fill="#b8c040" opacity=".5"/><circle cx="1352" cy="252" r="8" fill="#b8c040" opacity=".45"/>
  <g id="bStars"></g>
  <path d="M-200 560 C 100 470 300 520 520 470 C 700 430 860 500 1040 470 C 1250 430 1420 500 1800 450 V 1000 H -200 Z" fill="#1a0a36"/>
  <path d="M-200 640 C 150 580 380 620 600 590 C 800 560 1000 620 1200 590 C 1400 560 1600 610 1800 580 V 1000 H -200 Z" fill="#12062a"/>
  <g filter="url(#bSmoke)" fill="#02010c" opacity=".9">
    <path d="M-100 -100 H 760 C 560 -10 380 40 220 30 C 90 20 10 110 -100 170 Z"/>
    <path d="M1700 -100 H 1500 C 1560 -20 1620 40 1700 120 Z"/>
  </g>
  <rect x="-200" y="-200" width="2000" height="1200" filter="url(#bHaze)"/>`, bg);
  let seed = 17;
  const srnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const stars = bg.querySelector('#bStars');
  for (let i = 0; i < 120; i++) el('circle', { cx: f1(srnd() * W), cy: f1(srnd() * 460), r: f2(srnd() * 1.2 + .3), fill: '#fff', opacity: f2(srnd() * .6 + .15) }, stars);
  st.finishBg();

  /* ---------- static art: the hill and the town behind it ---------- */
  svgFrom(`<defs>
    <linearGradient id="bHill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1250"/><stop offset=".5" stop-color="#170838"/><stop offset="1" stop-color="#07021a"/></linearGradient>
    <clipPath id="bBallClip"><circle r="${R}"/></clipPath>
    <radialGradient id="bBallShade" cx="${R * .45}" cy="${-R * .5}" r="${R * 1.9}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff8c0" stop-opacity=".45"/><stop offset=".35" stop-color="#fff8c0" stop-opacity="0"/><stop offset=".6" stop-color="#05021a" stop-opacity=".35"/><stop offset="1" stop-color="#05021a" stop-opacity=".9"/>
    </radialGradient>
    <linearGradient id="bShirt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a2a5a"/><stop offset="1" stop-color="#3658e2"/></linearGradient>
  </defs>
  <path d="M${A.x - 900} ${A.y + 360 * 1.2} L${A.x} ${A.y} L${C.x} ${C.y} C ${C.x + 60} ${C.y - 18} ${C.x + 130} ${C.y + 10} ${C.x + 220} ${C.y + 90} L 1900 640 V 1100 H -400 Z" fill="url(#bHill)"/>
  <path d="M${A.x - 300} ${A.y + 146} L${A.x} ${A.y} L${C.x} ${C.y} C ${C.x + 60} ${C.y - 18} ${C.x + 130} ${C.y + 10} ${C.x + 220} ${C.y + 90}" fill="none" stroke="#ebed04" stroke-width="2.5" opacity=".55"/>
  <path d="M${A.x - 300} ${A.y + 146} L${A.x} ${A.y} L${C.x} ${C.y}" fill="none" stroke="#9c88cc" stroke-width="10" opacity=".12"/>
  <g id="bTown"></g>`, art);
  const town = art.querySelector('#bTown');
  const windows = [];
  // houses standing on the far side of the hill (ground ~ y 470 at x 1450 down to 520 at x 1600)
  const ground = (x) => (x < C.x + 220 ? C.y + (x - C.x) * .42 : C.y + 90 + (x - C.x - 220) * .39);
  [[1408, 42, 46], [1452, 36, 70], [1494, 50, 44], [1548, 40, 64], [1590, 46, 50]].forEach(([x, w, h]) => {
    const y = ground(x + w / 2) - h + 8;
    el('rect', { x, y, width: w, height: h, fill: '#0c0420' }, town);
    el('path', { d: `M${x - 4} ${y} L${x + w / 2} ${y - w * .45} L${x + w + 4} ${y} Z`, fill: '#0c0420' }, town);
    for (let wy = y + 10; wy < y + h - 10; wy += 16) for (let wx = x + 7; wx < x + w - 8; wx += 14) {
      windows.push(el('rect', { x: wx, y: wy, width: 7, height: 8, fill: '#ffcf70', opacity: 0 }, town));
    }
  });

  /* ---------- actors ---------- */
  const actors = st.addArt();
  const flag = svgFrom(`<g transform="translate(${C.x + 30} ${C.y - 6})">
    <path d="M0 0 V -120" stroke="#b8b0d0" stroke-width="3"/>
    <path d="M0 -120 L 72 -104 L 0 -86 Z" fill="#ea3d09"/>
    <text x="12" y="-100" font-size="12" font-weight="800" fill="#fff" font-family="Catamaran, sans-serif">OPEN</text></g>`, actors);
  const ballG = el('g', {}, actors);
  const ballRot = el('g', { 'clip-path': 'url(#bBallClip)' }, ballG);
  const stripes = ['#ff5028', '#ffcf70', '#c6ff3a', '#20e3b2', '#3658e2', '#b035d0', '#ff3fe0'];
  el('circle', { r: R, fill: '#ff5028' }, ballRot);
  stripes.forEach((c, i) => el('path', { d: `M${-R * 1.5} ${-R + i * 30} C ${-R * .3} ${-R + i * 30 - 40} ${R * .3} ${-R + i * 30 + 40} ${R * 1.5} ${-R + i * 30} v 16 C ${R * .3} ${-R + i * 30 + 56} ${-R * .3} ${-R + i * 30 - 24} ${-R * 1.5} ${-R + i * 30 + 16} Z`, fill: c, opacity: .9 }, ballRot));
  el('circle', { r: R, fill: 'url(#bBallShade)' }, ballG);
  el('path', { d: `M${R * .2} ${-R * .98} A ${R} ${R} 0 0 1 ${R * .98} ${-R * .2}`, stroke: '#f6ff9a', 'stroke-width': 3, fill: 'none', opacity: .8, 'stroke-linecap': 'round' }, ballG);

  // The seller, drawn in a frame aligned with the slope (x uphill, y up = negative).
  const fig = el('g', {}, actors);
  const figBody = el('g', { transform: 'scale(1.25)' }, fig);
  const legB = el('path', { stroke: '#0b0a22', 'stroke-width': 13, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, figBody);
  const legF = el('path', { stroke: '#15143a', 'stroke-width': 13, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, figBody);
  const torso = el('path', { stroke: 'url(#bShirt)', 'stroke-width': 24, fill: 'none', 'stroke-linecap': 'round' }, figBody);
  const armB = el('path', { stroke: '#22336e', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, figBody);
  const head = el('circle', { r: 13, fill: '#2a1a2e' }, figBody);
  const hair = el('path', { fill: '#120a14' }, figBody);
  const armF = el('path', { stroke: '#3658e2', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, figBody);
  const rim = el('path', { stroke: '#ebed04', 'stroke-width': 2, fill: 'none', opacity: .7, 'stroke-linecap': 'round' }, figBody);

  const trophy = svgFrom(`<g opacity="0">
    <path d="M-22 -60 H 22 V -40 C 22 -18 10 -8 0 -8 C -10 -8 -22 -18 -22 -40 Z" fill="#ffcf70"/>
    <path d="M-22 -54 C -40 -54 -40 -30 -18 -28 M 22 -54 C 40 -54 40 -30 18 -28" stroke="#ffcf70" stroke-width="5" fill="none"/>
    <path d="M-4 -8 H 4 V 4 H -4 Z M -16 4 H 16 V 12 H -16 Z" fill="#e0a640"/>
    <path d="M-14 -56 C -14 -40 -8 -24 0 -20" stroke="#fff8d0" stroke-width="3" fill="none" opacity=".8"/>
    <text x="0" y="-32" text-anchor="middle" font-size="15" font-weight="900" fill="#7a3a00" font-family="Catamaran, sans-serif">€</text></g>`, actors);

  /* ---------- state ---------- */
  const SPR = { gold: sprite('rgba(255,207,112,.9)', 128, 0), lime: sprite('rgba(198,255,58,.9)', 64, .1), spark: sprite('rgba(255,250,210,1)', 32, .3), dust: sprite('rgba(90,70,120,.8)', 64, .2), warm: sprite('rgba(255,190,90,.8)', 128, 0) };
  const sparks = new Particles(160), dust = new Particles(60);
  const s = { mode: 'struggle', u: .22, uFig: .22, slip: 0, t: 0, phase: 0, rot: 0, power: 0, ballFree: null, town: 0, trophyT: 0, cheer: 0 };

  st.clicks.push(() => {
    if (s.mode === 'struggle' || s.mode === 'slip') { s.mode = 'prize'; s.t = 0; s.trophyT = 0; return true; }
    return false;
  });

  const onSlope = (u, off = 0) => ({ x: A.x + D.x * LEN * u + N.x * off, y: A.y + D.y * LEN * u + N.y * off });

  /* ---------- per frame ---------- */
  const L = st.light, Dk = st.dark;
  const draw = (ctx, img, x, y, size, a) => { ctx.globalAlpha = a; ctx.drawImage(img, x - size / 2, y - size / 2, size, size); };
  let prevU = s.u;

  st.frames.push((t, dt) => {
    st.toArtT(L); st.toArtT(Dk);
    s.t += dt;
    let speed = 0;                      // seller's stride speed (for leg animation)
    if (s.mode === 'struggle') {
      // grinding uphill, a little surge and stall rhythm
      speed = .012 + Math.max(0, Math.sin(t * 2.2)) * .01;
      s.u += speed * dt;
      if (s.u > .56) { s.mode = 'slip'; s.t = 0; s.slipFrom = s.u; }
    } else if (s.mode === 'slip') {
      // loses grip: ball rolls back, seller skids with it
      const k = easeInOut(clamp(s.t / 1.4, 0, 1));
      s.u = lerp(s.slipFrom, .24, k);
      speed = -.05;
      if (Math.random() < .5) dust.add({ x: onSlope(s.u - .1).x + rand(-10, 10), y: onSlope(s.u - .1).y - 4, vx: rand(-60, -10), vy: rand(-40, -10), life: rand(.8, 1.4), size: rand(20, 50) });
      if (s.t > 1.6) { s.mode = 'struggle'; s.t = 0; }
    } else if (s.mode === 'prize') {
      // trophy drops onto the crest; seller and ball pause, look up
      s.trophyT += dt;
      speed = .004;
      if (s.trophyT > 1.1) { s.mode = 'surge'; s.t = 0; s.power = 1; for (let i = 0; i < 40; i++) sparks.add({ x: C.x - 40, y: C.y - 60, vx: rand(-220, 220), vy: rand(-300, -40), life: rand(.6, 1.2), img: SPR.spark, size: rand(3, 7), g: 500 }); }
    } else if (s.mode === 'surge') {
      speed = .16 + s.t * .1;
      s.u += speed * dt;
      if (Math.random() < .8) sparks.add({ x: onSlope(s.u, R).x - D.x * (R + 70), y: onSlope(s.u, R).y - D.y * (R + 70) - 40, vx: rand(-40, 40), vy: rand(-80, -10), life: .7, img: SPR.lime, size: rand(5, 10), g: 0 });
      if (s.u >= 1) { s.mode = 'over'; s.t = 0; s.ballFree = { x: onSlope(1, R).x, y: onSlope(1, R).y, vx: 260, vy: -60 }; }
    } else if (s.mode === 'over') {
      s.cheer = clamp(s.t / .5, 0, 1);
      s.town = clamp((s.t - .6) / 1.8, 0, 1);
      if (s.t > 8) { s.mode = 'reset'; s.t = 0; }
    } else if (s.mode === 'reset') {
      const k = clamp(s.t / 1.2, 0, 1);
      s.town = 1 - k; s.cheer = 1 - k; s.power = 0;
      if (k >= 1) { s.mode = 'struggle'; s.u = .22; s.ballFree = null; s.trophyT = 0; }
    }
    s.power *= s.mode === 'surge' || s.mode === 'over' ? 1 : Math.pow(.3, dt);

    // ball
    let bx, by;
    if (s.ballFree && (s.mode === 'over')) {
      const b = s.ballFree;
      b.vy += 600 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      const groundY = b.x < C.x + 220 ? C.y + (b.x - C.x) * .4 : 640 - (b.x - (C.x + 220)) * .2;
      if (b.y > groundY - R) { b.y = groundY - R; b.vy = -Math.abs(b.vy) * .35; }
      bx = b.x; by = b.y;
      s.rot += b.vx * dt / R * 57.3;
    } else if (s.mode === 'reset') {
      const p = onSlope(s.u, R); bx = p.x - (1 - easeOut(clamp(s.t / 1.2, 0, 1))) * 900; by = p.y;
    } else {
      const p = onSlope(s.u, R); bx = p.x; by = p.y;
      s.rot += (s.u - prevU) * LEN / R * 57.3;
    }
    prevU = s.u;
    ballG.setAttribute('transform', `translate(${f1(bx)} ${f1(by)})`);
    ballRot.setAttribute('transform', `rotate(${f1(s.rot)})`);
    ballG.setAttribute('opacity', s.mode === 'over' && bx > W + R ? 0 : 1);

    // seller: feet on the slope behind the ball, leaning into it
    const uf = s.mode === 'over' ? 1 - (R + 30) / LEN * .2 : s.mode === 'reset' ? s.u : s.u - (R + 64) / LEN;
    const foot = onSlope(Math.min(uf, .985));
    s.phase += Math.abs(speed) * dt * 1600 + (s.mode === 'struggle' ? dt * 2 : 0);
    const lean = s.mode === 'over' ? lerp(38, -8, s.cheer) : s.mode === 'slip' ? 48 : 38;
    const stride = s.mode === 'prize' || s.mode === 'over' ? .15 : 1;
    const ph = s.phase;
    // local frame: rotate by slope angle; hip at (0,-62)
    const hip = { x: 0, y: -62 };
    const sh = { x: Math.sin(lean * Math.PI / 180) * 48, y: hip.y - Math.cos(lean * Math.PI / 180) * 48 };
    const legPath = (p) => {
      const fx = Math.sin(p) * 26 * stride - 8, fy = 0;
      const kx = (hip.x + fx) / 2 + 10, ky = (hip.y + fy) / 2 - Math.max(0, Math.cos(p)) * 10 * stride;
      return `M${f1(hip.x)} ${hip.y} Q ${f1(kx)} ${f1(ky)} ${f1(fx)} ${fy - Math.max(0, -Math.cos(p)) * 8 * stride}`;
    };
    legB.setAttribute('d', legPath(ph + Math.PI));
    legF.setAttribute('d', legPath(ph));
    torso.setAttribute('d', `M${hip.x} ${hip.y} L${f1(sh.x)} ${f1(sh.y)}`);
    const hx = sh.x + Math.sin(lean * Math.PI / 180) * 16, hy = sh.y - Math.cos(lean * Math.PI / 180) * 16 - 2;
    head.setAttribute('cx', f1(hx)); head.setAttribute('cy', f1(hy));
    hair.setAttribute('d', `M${f1(hx - 13)} ${f1(hy)} a13 13 0 0 1 26 -2 l -6 -4 z`);
    // arms push the ball, or go up in a cheer
    const reach = s.mode === 'over' ? null : { x: ((R + 64) - R * .95) / 1.25, y: -R * .5 / 1.25 }; // figure is drawn at 1.25x
    if (reach) {
      const handY = reach.y + Math.sin(ph) * 2;
      armF.setAttribute('d', `M${f1(sh.x)} ${f1(sh.y)} L${f1((sh.x + reach.x) / 2)} ${f1((sh.y + handY) / 2 + 6)} L${f1(reach.x)} ${f1(handY)}`);
      armB.setAttribute('d', `M${f1(sh.x - 2)} ${f1(sh.y + 2)} L${f1((sh.x + reach.x) / 2 - 4)} ${f1((sh.y + handY) / 2 + 10)} L${f1(reach.x - 4)} ${f1(handY + 8)}`);
    } else {
      const up = s.cheer;
      armF.setAttribute('d', `M${f1(sh.x)} ${f1(sh.y)} L${f1(sh.x + 14)} ${f1(sh.y - 22 * up - 4)} L${f1(sh.x + 18)} ${f1(sh.y - 48 * up)}`);
      armB.setAttribute('d', `M${f1(sh.x)} ${f1(sh.y)} L${f1(sh.x - 12)} ${f1(sh.y - 20 * up - 4)} L${f1(sh.x - 16)} ${f1(sh.y - 46 * up)}`);
    }
    rim.setAttribute('d', `M${f1(sh.x + 8)} ${f1(sh.y - 4)} L${f1(hip.x + 10)} ${f1(hip.y + 2)}`);
    fig.setAttribute('transform', `translate(${f1(foot.x)} ${f1(foot.y)}) rotate(${f1(s.mode === 'over' ? SLOPE_DEG * (1 - s.cheer) : SLOPE_DEG)})`);
    fig.setAttribute('opacity', s.mode === 'reset' ? f2(clamp(s.t / .6, 0, 1)) : 1);

    // trophy
    if (s.mode === 'prize' || s.mode === 'surge' || s.mode === 'over') {
      const k = clamp(s.trophyT / 1.1, 0, 1);
      const ty = lerp(-200, C.y - 26, easeIn(k)) - (k >= 1 ? Math.sin(Math.min(1, (s.trophyT - 1.1) / .4) * Math.PI) * 18 : 0);
      trophy.setAttribute('opacity', 1);
      trophy.setAttribute('transform', `translate(${C.x - 40} ${f1(ty)}) rotate(${f1((1 - k) * 25)})`);
      draw(L, SPR.gold, C.x - 40, ty - 34, 200 + Math.sin(t * 4) * 20, .55);
      if (Math.random() < .3) sparks.add({ x: C.x - 40 + rand(-20, 20), y: ty - 40 + rand(-20, 20), vx: rand(-20, 20), vy: rand(-40, -10), life: .8, img: SPR.spark, size: rand(2, 5), g: 0 });
    } else trophy.setAttribute('opacity', s.mode === 'reset' ? f2(1 - clamp(s.t / .5, 0, 1)) : 0);

    // power aura around the seller during the surge
    if (s.power > .05) draw(L, SPR.lime, foot.x + N.x * 60, foot.y + N.y * 60, 220, .45 * s.power);

    // the town lights up once the ball is over the hill
    windows.forEach((w, i) => w.setAttribute('opacity', f2(clamp(s.town * 1.6 - (i % 7) * .09, 0, 1) * (.75 + .25 * Math.sin(t * 3 + i)))));
    if (s.town > .05) draw(L, SPR.warm, 1490, 580, 520, .45 * s.town);

    L.globalCompositeOperation = 'lighter';
    sparks.step(dt, (q, k) => { q.vy += (q.g || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt; draw(L, q.img, q.x, q.y, q.size, 1 - k); });
    L.globalCompositeOperation = 'source-over';
    dust.step(dt, (q, k) => { q.x += q.vx * dt; q.y += q.vy * dt; draw(Dk, SPR.dust, q.x, q.y, q.size * (1 + k), .4 * (1 - k)); });
    L.globalAlpha = 1; Dk.globalAlpha = 1;
  });

  if (reduced) st.renderOnce();
  return st;
}
