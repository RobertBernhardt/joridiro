// Hero scene: a rocket on a night cloud bank, a glowing egg, planets.
// Clicks: rocket -> countdown, lift-off, comes back and lands
//         egg    -> cracks, the caped hero hatches and flies off
//         ringed planet -> ring spins up, the moon swings by
//         sky    -> shooting star (every third time a UFO pays a visit)
import { createStage, el, svgFrom, sprite, Particles, buildHero, clamp, lerp, rand, easeOut, easeIn, easeInOut, backOut, reduced, f1, f2 } from './engine.js';

const W = 1600, H = 900;
const RX = 1135, RY = 708;        // rocket nozzle (bottom centre) at rest
const EX = 900, EY = 700;         // egg bottom centre
const PX = 770, PY = 170;         // ringed planet
const BX = 175, BY = 200, BR = 160; // big striped planet

export function launchScene(section) {
  const st = createStage(section, { W, H, focus: [840, 210, 520, 560], frontMask: [0.68, 0.5] });
  const { bg, art } = st;

  /* ---------- background (static, filtered once) ---------- */
  svgFrom(`<defs>
    <linearGradient id="lSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#03031a"/><stop offset=".55" stop-color="#0b0330"/><stop offset="1" stop-color="#1b0738"/>
    </linearGradient>
    <radialGradient id="lBlue"><stop offset="0" stop-color="#3658e2" stop-opacity=".75"/><stop offset=".45" stop-color="#2546c8" stop-opacity=".28"/><stop offset="1" stop-color="#2546c8" stop-opacity="0"/></radialGradient>
    <radialGradient id="lAcid"><stop offset="0" stop-color="#ebed04" stop-opacity=".85"/><stop offset=".25" stop-color="#b8c41a" stop-opacity=".45"/><stop offset=".55" stop-color="#4c5a3a" stop-opacity=".22"/><stop offset="1" stop-color="#1b0738" stop-opacity="0"/></radialGradient>
    <radialGradient id="lMag"><stop offset="0" stop-color="#ff3fe0" stop-opacity=".45"/><stop offset="1" stop-color="#ff3fe0" stop-opacity="0"/></radialGradient>
    <filter id="lSmoke" x="-25%" y="-25%" width="150%" height="150%">
      <feTurbulence type="fractalNoise" baseFrequency=".007 .012" numOctaves="3" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="70" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="4"/>
    </filter>
    <filter id="lHaze" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".0045 .007" numOctaves="3" seed="11"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .08  0 0 0 0 .06  0 0 0 0 .18  0 0 0 1.6 -.62"/>
    </filter>
    <filter id="lBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="lNeon" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect x="-200" y="-200" width="2000" height="1300" fill="url(#lSky)"/>
  <ellipse cx="300" cy="120" rx="700" ry="460" fill="url(#lBlue)"/>
  <ellipse cx="1135" cy="740" rx="820" ry="460" fill="url(#lAcid)"/>
  <ellipse cx="1560" cy="420" rx="420" ry="320" fill="url(#lMag)"/>
  <g id="lStars"></g>
  <circle cx="${BX}" cy="${BY}" r="${BR + 16}" fill="#3658e2" opacity=".4" filter="url(#lBlur)"/>
  <path id="lOrbit" d="M-60 520 C 300 300 900 140 1700 210" fill="none" stroke="#ff3fe0" stroke-width="2" opacity=".55" filter="url(#lNeon)"/>
  <path d="M-60 560 C 380 380 980 250 1700 300" fill="none" stroke="#3658e2" stroke-width="1.5" opacity=".5" filter="url(#lNeon)"/>
  <g filter="url(#lSmoke)" fill="#02010c" opacity=".9">
    <path d="M-100 -100 H 700 C 560 -10 420 40 260 30 C 120 20 40 90 -100 160 Z"/>
    <path d="M1700 -100 H 1150 C 1260 -20 1380 10 1460 70 C 1540 130 1600 220 1700 260 Z"/>
    <path d="M-100 380 C 20 420 60 520 20 640 C -20 760 -60 820 -100 900 Z"/>
  </g>
  <rect x="-200" y="-200" width="2000" height="1300" filter="url(#lHaze)"/>`, bg);
  const starsBg = bg.querySelector('#lStars');
  let seed = 9;
  const srnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 160; i++) {
    const x = srnd() * W, y = srnd() * 620;
    el('circle', { cx: f1(x), cy: f1(y), r: f2(srnd() * 1.3 + .3), fill: srnd() < .15 ? '#c6ff3a' : '#fff', opacity: f2(srnd() * .6 + .2) }, starsBg);
  }
  st.finishBg();
  // Light travelling along the orbit: animated, so it must not live in the filtered background.
  svgFrom('<path class="flow" d="M-60 520 C 300 300 900 140 1700 210" stroke="#ffd2f6" stroke-width="2.4"/>', art);

  /* ---------- art defs ---------- */
  svgFrom(`<defs>
    <clipPath id="lBigClip"><circle cx="${BX}" cy="${BY}" r="${BR}"/></clipPath>
    <radialGradient id="lBigShade" cx="${BX - 70}" cy="${BY - 80}" r="${BR * 1.9}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#7f9cff" stop-opacity=".35"/><stop offset=".4" stop-color="#05031a" stop-opacity="0"/><stop offset=".62" stop-color="#05031a" stop-opacity=".25"/><stop offset=".85" stop-color="#05031a" stop-opacity=".8"/>
    </radialGradient>
    <radialGradient id="lRingBody" cx="${PX - 18}" cy="${PY - 20}" r="70" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8a6ad8"/><stop offset=".5" stop-color="#3a2080"/><stop offset="1" stop-color="#0c0524"/>
    </radialGradient>
    <linearGradient id="lBody" x1="-62" y1="0" x2="62" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#241534"/><stop offset=".3" stop-color="#6e5d78"/><stop offset=".68" stop-color="#e2d6c6"/><stop offset=".9" stop-color="#fbf3cf"/><stop offset="1" stop-color="#e5ea7a"/>
    </linearGradient>
    <linearGradient id="lRed" x1="-60" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4a0d10"/><stop offset=".45" stop-color="#b8270b"/><stop offset=".85" stop-color="#ff5a1f"/><stop offset="1" stop-color="#ffb04a"/>
    </linearGradient>
    <linearGradient id="lMetal" x1="0" y1="-26" x2="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1c1828"/><stop offset="1" stop-color="#6a5a70"/>
    </linearGradient>
    <radialGradient id="lGlass" cx="-8" cy="-186" r="30" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#3a5ad8"/><stop offset=".6" stop-color="#0d1650"/><stop offset="1" stop-color="#03051a"/>
    </radialGradient>
    <radialGradient id="lEgg" cx="${EX - 14}" cy="${EY - 66}" r="80" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fffbe9"/><stop offset=".45" stop-color="#e9ddbd"/><stop offset=".8" stop-color="#8f7b8c"/><stop offset="1" stop-color="#3a2a48"/>
    </radialGradient>
    <radialGradient id="lEggGlow"><stop offset="0" stop-color="#c6ff3a" stop-opacity=".9"/><stop offset=".4" stop-color="#b6f534" stop-opacity=".3"/><stop offset="1" stop-color="#9c88cc" stop-opacity="0"/></radialGradient>
    <radialGradient id="lRim" cx="${RX}" cy="${RY + 40}" r="760" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffe27a"/><stop offset=".25" stop-color="#e3a76a"/><stop offset=".55" stop-color="#9c78c8"/><stop offset="1" stop-color="#4d3a8a"/>
    </radialGradient>
    <radialGradient id="lRimDim" cx="${RX}" cy="${RY + 40}" r="760" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#d9965e"/><stop offset=".3" stop-color="#8a5a90"/><stop offset=".7" stop-color="#4a3388"/><stop offset="1" stop-color="#2c1d5e"/>
    </radialGradient>
    <linearGradient id="lBodyBack" x1="0" y1="500" x2="0" y2="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6a4aa8"/><stop offset=".45" stop-color="#3a2072"/><stop offset="1" stop-color="#160834"/></linearGradient>
    <linearGradient id="lBodyMid" x1="0" y1="610" x2="0" y2="860" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4c2e88"/><stop offset=".5" stop-color="#26114e"/><stop offset="1" stop-color="#0c0422"/></linearGradient>
    <linearGradient id="lBodyFront" x1="0" y1="720" x2="0" y2="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2c1658"/><stop offset=".5" stop-color="#150834"/><stop offset="1" stop-color="#05010f"/></linearGradient>
    <radialGradient id="lBillow" cx=".5" cy=".35" r=".5"><stop offset="0" stop-color="#c8b0ff" stop-opacity=".55"/><stop offset="1" stop-color="#c8b0ff" stop-opacity="0"/></radialGradient>
    <filter id="lSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="lGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`, art);

  // twinkling stars
  const tw = el('g', { class: 'twinkle' }, art);
  for (let i = 0; i < 26; i++) {
    const x = rand(20, W - 20), y = rand(20, 560), r = rand(1.2, 2.4);
    const s = el('g', { transform: `translate(${f1(x)} ${f1(y)})`, style: `animation-delay:${f2(rand(0, 4))}s;animation-duration:${f2(rand(2.5, 5))}s` }, tw);
    el('path', { d: `M0 ${-r * 3}L${r * .5} 0L0 ${r * 3}L${-r * .5} 0Z`, fill: '#fff' }, s);
    el('path', { d: `M${-r * 3} 0L0 ${r * .5}L${r * 3} 0L0 ${-r * .5}Z`, fill: '#fff' }, s);
  }

  /* ---------- big striped planet ---------- */
  const bigG = el('g', { 'clip-path': 'url(#lBigClip)' }, art);
  el('rect', { x: BX - BR, y: BY - BR, width: BR * 2, height: BR * 2, fill: '#5a0c5e' }, bigG);
  const bands = el('g', {}, bigG);
  const bandCols = ['#7a1468', '#a41f6c', '#cf345e', '#ee5a4a', '#ff8a52', '#d23a5e', '#8e1a6a', '#ff9e5e'];
  const P = 160; // wave period, bands loop seamlessly by shifting one period
  bandCols.forEach((c, i) => {
    const y0 = BY - BR + 18 + i * 40, amp = 10 + (i % 3) * 5;
    let d = `M${BX - BR - P * 2} ${y0}`;
    for (let x = BX - BR - P * 2; x < BX + BR + P; x += P) d += ` q ${P / 4} ${-amp} ${P / 2} 0 t ${P / 2} 0`;
    d += ` V ${y0 + 26} H ${BX - BR - P * 2} Z`;
    el('path', { d, fill: c, opacity: .92 }, bands);
  });
  el('circle', { cx: BX, cy: BY, r: BR, fill: 'url(#lBigShade)' }, bigG);
  el('path', { d: `M${BX - BR * .92} ${BY - BR * .35} A ${BR} ${BR} 0 0 1 ${BX + BR * .2} ${BY - BR * .98}`, stroke: '#8fb0ff', 'stroke-width': 3, fill: 'none', opacity: .8, filter: 'url(#lGlow)', 'stroke-linecap': 'round' }, art);

  /* ---------- small far planet ---------- */
  svgFrom(`<g opacity=".9"><circle cx="1490" cy="150" r="78" fill="#2a0a1a"/>
    <path d="M1412 150 a78 78 0 0 1 156 0" fill="none" stroke="#ff5028" stroke-width="2.5" opacity=".7" filter="url(#lGlow)"/>
    <path d="M1420 130 q 70 -16 140 0 M1414 160 q 76 -12 152 0" stroke="#5a1424" stroke-width="10" fill="none" opacity=".8"/></g>`, art);

  /* ---------- ringed planet + moon ---------- */
  const ringBack = el('g', { transform: `rotate(-16 ${PX} ${PY})` }, art);
  const moonBack = el('g', {}, art);
  const planetG = el('g', {}, art);
  el('circle', { cx: PX, cy: PY, r: 46, fill: 'url(#lRingBody)' }, planetG);
  el('path', { d: `M${PX - 44} ${PY - 8} q 44 -12 88 0 M${PX - 42} ${PY + 14} q 42 -10 84 0`, stroke: '#2a1460', 'stroke-width': 7, fill: 'none', opacity: .7 }, planetG);
  el('path', { d: `M${PX - 40} ${PY - 22} a46 46 0 0 1 60 -20`, stroke: '#c6ff3a', 'stroke-width': 2, fill: 'none', opacity: .7, 'stroke-linecap': 'round' }, planetG);
  const ringFront = el('g', { transform: `rotate(-16 ${PX} ${PY})` }, art);
  const ringPath = (half) => `M${PX - 108} ${PY} A 108 25 0 0 ${half} ${PX + 108} ${PY}`;
  const rings = [];
  for (const [g, half] of [[ringBack, 1], [ringFront, 0]]) {
    el('path', { d: ringPath(half), stroke: '#ffcf70', 'stroke-width': 11, fill: 'none', opacity: .35 }, g);
    rings.push(el('path', { d: ringPath(half), stroke: '#ffe9b0', 'stroke-width': 4, fill: 'none', 'stroke-dasharray': '18 7 4 9', opacity: .85 }, g));
  }
  const moonFront = el('g', {}, art);
  const moonMk = (parent) => svgFrom(`<g><circle r="9" fill="#cfc6ea"/><circle r="9" fill="#120a2a" opacity=".55" transform="translate(4 3)"/></g>`, parent);
  const moonA = moonMk(moonBack), moonB = moonMk(moonFront);

  /* ---------- clouds ---------- */
  // Cloud banks: puffs share one body gradient so they merge into a single mass;
  // a copy shifted upwards in the rim colour gives the lit top edge, and soft
  // translucent blobs inside suggest billows.
  function cloudLayer(layer, baseY, { step, rMin, rMax, seedN, amp, body, rim, rimOff = 8, billow = .3 }) {
    let s2 = seedN;
    const r2 = () => ((s2 = (s2 * 16807) % 2147483647) / 2147483647);
    const g = el('g', {}, layer);
    const rimG = el('g', { fill: rim }, g);
    const bodyG = el('g', { fill: body }, g);
    const billowG = el('g', { fill: 'url(#lBillow)', opacity: billow }, g);
    for (let x = -140; x < W + 180; x += step * (0.6 + r2() * 0.6)) {
      const r = rMin + r2() * (rMax - rMin), cy = baseY + Math.sin(x / 230 + seedN) * amp + r2() * 24 + r * .3;
      el('circle', { cx: f1(x), cy: f1(cy - rimOff), r: f1(r) }, rimG);
      el('circle', { cx: f1(x), cy: f1(cy), r: f1(r) }, bodyG);
      el('circle', { cx: f1(x + r * .12), cy: f1(cy + r * .05), r: f1(r * .72) }, billowG);
    }
    el('rect', { x: -200, y: baseY + 40, width: W + 400, height: H, fill: body }, bodyG);
    return g;
  }
  const cloudsBack = cloudLayer(art, 645, { step: 105, rMin: 70, rMax: 140, seedN: 31, amp: 18, body: 'url(#lBodyBack)', rim: 'url(#lRim)', rimOff: 9, billow: .35 });

  /* ---------- egg ---------- */
  const actors = st.addArt();
  const crackD = `M${EX - 37} ${EY - 42} L${EX - 24} ${EY - 50} L${EX - 14} ${EY - 40} L${EX - 2} ${EY - 54} L${EX + 10} ${EY - 42} L${EX + 22} ${EY - 52} L${EX + 37} ${EY - 44}`;
  const eggG = el('g', {}, actors);
  const eggAura = el('ellipse', { cx: EX, cy: EY - 46, rx: 150, ry: 160, fill: 'url(#lEggGlow)', opacity: .8 }, eggG);
  const eggBody = el('g', {}, eggG);
  const eggBottom = el('path', { d: `${crackD} C${EX + 38} ${EY - 36} ${EX + 38} ${EY - 32} ${EX + 38} ${EY - 30} C${EX + 38} ${EY - 10} ${EX + 22} ${EY} ${EX} ${EY} C${EX - 22} ${EY} ${EX - 38} ${EY - 10} ${EX - 38} ${EY - 30} C${EX - 38} ${EY - 34} ${EX - 38} ${EY - 38} ${EX - 37} ${EY - 42} Z`, fill: 'url(#lEgg)' }, eggBody);
  const eggTop = el('path', { d: `${crackD} C${EX + 36} ${EY - 62} ${EX + 26} ${EY - 92} ${EX} ${EY - 92} C${EX - 26} ${EY - 92} ${EX - 36} ${EY - 62} ${EX - 37} ${EY - 42} Z`, fill: 'url(#lEgg)' }, eggBody);
  el('path', { d: `M${EX - 34} ${EY - 50} C${EX - 34} ${EY - 76} ${EX - 18} ${EY - 90} ${EX - 4} ${EY - 91}`, stroke: '#c6ff3a', 'stroke-width': 2, fill: 'none', opacity: .7, 'stroke-linecap': 'round' }, eggBody);
  const crack = el('path', { d: crackD, stroke: '#c6ff3a', 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round', filter: 'url(#lGlow)', 'stroke-dasharray': 120, 'stroke-dashoffset': 120 }, eggBody);
  const shellTopG = el('g', {}, eggG);

  /* ---------- rocket ---------- */
  const rocketG = el('g', {}, actors);
  const rocketShake = el('g', {}, rocketG);
  svgFrom(`<g>
    <path d="M-56 -120 C -88 -100 -102 -58 -100 -8 L -60 -38 Z" fill="url(#lRed)"/>
    <path d="M56 -120 C 88 -100 102 -58 100 -8 L 60 -38 Z" fill="url(#lRed)"/>
    <path d="M-30 -26 L30 -26 L38 0 L-38 0 Z" fill="url(#lMetal)"/>
    <path d="M0 -330 C 34 -300 58 -232 60 -150 L 56 -62 C 54 -42 46 -31 40 -26 L -40 -26 C -46 -31 -54 -42 -56 -62 L -60 -150 C -58 -232 -34 -300 0 -330 Z" fill="url(#lBody)"/>
    <path d="M0 -330 C 26 -307 44 -278 51 -250 L -51 -250 C -44 -278 -26 -307 0 -330 Z" fill="url(#lRed)"/>
    <path d="M-52 -250 H 52 L 54 -240 H -54 Z" fill="#2a0a12" opacity=".7"/>
    <path d="M-57 -84 H 57 L 56.5 -76 H -56.5 Z" fill="url(#lRed)"/>
    <path d="M-5 -70 L 5 -70 L 8 -6 L -8 -6 Z" fill="url(#lRed)"/>
    <path d="M58 -150 C 57 -100 56 -70 52 -50" stroke="#e8f04a" stroke-width="3" fill="none" opacity=".75" stroke-linecap="round"/>
    <path d="M30 -300 C 46 -270 57 -220 59 -170" stroke="#fff3b0" stroke-width="2.5" fill="none" opacity=".7" stroke-linecap="round"/>
    <path d="M-58 -160 C -56 -230 -36 -295 -8 -326" stroke="#ff3fe0" stroke-width="2.5" fill="none" opacity=".55" stroke-linecap="round"/>
    <circle cx="0" cy="-178" r="27" fill="#2a2338"/>
    <circle cx="0" cy="-178" r="27" fill="none" stroke="#a89cb8" stroke-width="2" opacity=".6"/>
    <circle cx="0" cy="-178" r="20" fill="url(#lGlass)"/>
    <circle class="cabin" cx="0" cy="-178" r="20" fill="#ffcf70" opacity=".25"/>
    <path d="M-12 -188 a 15 15 0 0 1 14 -8" stroke="#bfe6ff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
  </g>`, rocketShake);
  const cabin = rocketShake.querySelector('.cabin');

  const heroWrap = el('g', { opacity: 0 }, actors);
  const hero = buildHero(heroWrap, { scale: 2.3, id: 'lHero' });

  const ufoG = el('g', { opacity: 0 }, actors);
  svgFrom(`<g>
    <ellipse cx="0" cy="-6" rx="21" ry="17" fill="#7fe0ff" opacity=".35"/>
    <circle cx="0" cy="-9" r="6" fill="#7cff6a"/><circle cx="-2" cy="-10" r="1.6" fill="#03051a"/><circle cx="3" cy="-10" r="1.6" fill="#03051a"/>
    <ellipse cx="0" cy="4" rx="50" ry="13" fill="#3a3a52"/>
    <ellipse cx="0" cy="1" rx="46" ry="9" fill="#8a8eb0"/>
    <ellipse cx="0" cy="8" rx="30" ry="5" fill="#15142a"/>
  </g>`, ufoG);
  const ufoLights = [...Array(10)].map((_, i) => el('circle', { cx: f1(Math.cos(i / 10 * Math.PI * 2) * 44), cy: f1(4 + Math.sin(i / 10 * Math.PI * 2) * 9), r: 2.4, fill: '#ffcf70' }, ufoG));

  // puffs that seat the egg and hide the rocket's nozzle
  const nest = el('g', {}, actors);
  const nestPuffs = [[EX - 52, EY + 10, 34], [EX + 46, EY + 12, 38], [EX, EY + 26, 40], [RX - 92, RY + 28, 58], [RX + 96, RY + 24, 62], [RX, RY + 48, 66]];
  for (const [x, y, r] of nestPuffs) el('circle', { cx: x, cy: y - 8, r, fill: 'url(#lRim)' }, nest);
  for (const [x, y, r] of nestPuffs) el('circle', { cx: x, cy: y, r, fill: 'url(#lBodyBack)' }, nest);
  for (const [x, y, r] of nestPuffs) el('circle', { cx: x + r * .1, cy: y, r: r * .7, fill: 'url(#lBillow)', opacity: .4 }, nest);
  const cloudsMid = cloudLayer(actors, 740, { step: 120, rMin: 60, rMax: 120, seedN: 77, amp: 22, body: 'url(#lBodyMid)', rim: 'url(#lRimDim)', rimOff: 7, billow: .25 });
  const cloudsFront = cloudLayer(st.addArt('drift-a'), 835, { step: 140, rMin: 70, rMax: 130, seedN: 5, amp: 26, body: 'url(#lBodyFront)', rim: '#4a3388', rimOff: 5, billow: .15 });

  /* ---------- canvas sprites ---------- */
  const SPR = {
    core: sprite('rgba(255,246,200,1)', 64, .2),
    orange: sprite('rgba(255,130,40,1)', 64, .1),
    red: sprite('rgba(210,50,30,1)', 64, 0),
    glowWarm: sprite('rgba(255,190,90,.9)', 128, 0),
    lime: sprite('rgba(198,255,58,.9)', 128, 0),
    green: sprite('rgba(124,255,106,.9)', 64, 0),
    white: sprite('rgba(255,255,255,1)', 32, .3),
    smoke: sprite('rgba(96,78,128,.9)', 96, .25),
    smokeLit: sprite('rgba(255,178,104,.75)', 96, .1),
    pink: sprite('rgba(255,90,220,1)', 32, .2),
  };
  const flame = new Particles(420), smoke = new Particles(170), sparks = new Particles(260), trail = [];

  /* ---------- state ---------- */
  const rocket = { state: reduced ? 'idle' : 'landing', t: 0, y: 0, x: 0, intensity: .25 };
  const egg = { state: 'idle', t: 0 };
  const heroS = { active: false, x: 0, y: 0, vx: 0, vy: 0, wp: [], t: 0, scale: 0 };
  const ring = { boost: 0, offset: 0, angle: 0.8 };
  const ufo = { active: false, t: 0, x: 0, y: 0 };
  const stars = [];
  let bandOffset = 0, bigBoost = 0, skyClicks = 0, nextStar = 6, flash = 0;

  /* ---------- clicks ---------- */
  st.clicks.push((p) => {
    const rTop = RY + rocket.y - 340;
    if (egg.state === 'idle' && Math.hypot((p.x - EX) / 52, (p.y - (EY - 46)) / 62) < 1) { egg.state = 'wobble'; egg.t = 0; return true; }
    if (rocket.state === 'idle' && Math.abs(p.x - RX) < 95 && p.y > rTop && p.y < RY + 20) { rocket.state = 'countdown'; rocket.t = 0; return true; }
    const dx = p.x - PX, dy = p.y - PY, a = 16 * Math.PI / 180;
    const rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a);
    if (Math.hypot(dx, dy) < 60 || (Math.abs(rx) < 118 && Math.abs(ry) < 30)) { ring.boost = 1; return true; }
    if (Math.hypot(p.x - BX, p.y - BY) < BR) { bigBoost = 1; return true; }
    if (p.y < 640) {
      skyClicks++;
      if (!ufo.active && (skyClicks % 3 === 0)) { ufo.active = true; ufo.t = 0; }
      else shootingStar(p.x, p.y);
      return true;
    }
    return false;
  });

  function shootingStar(x, y) {
    const ang = rand(2.55, 2.85); // heading down-left
    stars.push({ x: x + 220, y: y - 120, vx: Math.cos(ang) * 1300, vy: Math.sin(ang) * 1300, t: 0, life: rand(.8, 1.1) });
  }

  /* ---------- per-frame ---------- */
  const L = st.light, D = st.dark;
  const draw = (ctx, img, x, y, size, alpha) => { ctx.globalAlpha = alpha; ctx.drawImage(img, x - size / 2, y - size / 2, size, size); };

  st.frames.push((t, dt) => {
    st.toArtT(L); st.toArtT(D);
    flash *= Math.pow(0.02, dt);

    // planets
    bigBoost *= Math.pow(0.35, dt);
    bandOffset = (bandOffset + dt * (14 + bigBoost * 160)) % P;
    bands.setAttribute('transform', `translate(${f1(bandOffset)} 0)`);
    ring.boost *= Math.pow(0.4, dt);
    ring.offset -= dt * (8 + ring.boost * 220);
    rings.forEach((r) => r.setAttribute('stroke-dashoffset', f1(ring.offset)));
    ring.angle += dt * (0.35 + ring.boost * 7);
    const orbit = 1 + ring.boost * 1.4;
    const mx = Math.cos(ring.angle) * 150 * orbit, my = Math.sin(ring.angle) * 38 * orbit;
    const a16 = -16 * Math.PI / 180;
    const mX = PX + mx * Math.cos(a16) - my * Math.sin(a16), mY = PY + mx * Math.sin(a16) + my * Math.cos(a16);
    const front = Math.sin(ring.angle) > 0;
    moonA.setAttribute('transform', `translate(${f1(mX)} ${f1(mY)})`);
    moonB.setAttribute('transform', `translate(${f1(mX)} ${f1(mY)})`);
    moonA.style.display = front ? 'none' : '';
    moonB.style.display = front ? '' : 'none';
    planetG.setAttribute('transform', `rotate(${f2(Math.sin(t * 20) * ring.boost * 4)} ${PX} ${PY})`);
    trail.push({ x: mX, y: mY });
    if (trail.length > 26) trail.shift();
    if (ring.boost > .05) trail.forEach((q, i) => draw(L, SPR.pink, q.x, q.y, 10 + i, (i / trail.length) * ring.boost * .8));

    // rocket
    rocket.t += dt;
    let shake = 0;
    if (rocket.state === 'idle') {
      rocket.y = Math.sin(t * 1.3) * 3;
      rocket.intensity = .22 + Math.sin(t * 17) * .03;
    } else if (rocket.state === 'countdown') {
      shake = rocket.t * 2.5;
      rocket.intensity = lerp(.22, .75, rocket.t);
      if (Math.random() < .5) sparks.add({ x: RX + rand(-30, 30), y: RY + rocket.y, vx: rand(-160, 160), vy: rand(-220, -60), life: rand(.4, .8), img: SPR.core, size: rand(3, 6) });
      if (rocket.t > 1) { rocket.state = 'liftoff'; rocket.t = 0; flash = .6; }
    } else if (rocket.state === 'liftoff') {
      shake = Math.max(0, 2.5 - rocket.t * 2);
      rocket.y = -0.5 * 380 * rocket.t * rocket.t - 20 * rocket.t;
      rocket.intensity = 1;
      if (rocket.y < -1400) { rocket.state = 'gone'; rocket.t = 0; }
    } else if (rocket.state === 'gone') {
      rocket.intensity = 0;
      if (rocket.t > 2.6) { rocket.state = 'landing'; rocket.t = 0; }
    } else if (rocket.state === 'landing') {
      const k = easeOut(rocket.t / 2.6);
      rocket.y = lerp(-1150, 0, k);
      rocket.intensity = lerp(.95, .35, k);
      if (rocket.t >= 2.6) {
        rocket.state = 'idle'; rocket.t = 0;
        for (let i = 0; i < 26; i++) smoke.add({ x: RX + rand(-20, 20), y: RY - 10, vx: rand(-1, 1) * rand(120, 300), vy: rand(-30, -5), life: rand(2.5, 4.5), s0: 40, s1: rand(130, 200) });
      }
    }
    const sx = shake ? rand(-shake, shake) : 0;
    rocketG.setAttribute('transform', `translate(${f1(RX + sx)} ${f1(RY + rocket.y)})`);
    cabin.setAttribute('opacity', f2(.18 + Math.max(0, Math.sin(t * 7) * Math.sin(t * 3.1)) * .25 + rocket.intensity * .2));

    // exhaust, glow, smoke
    const nx = RX + sx, ny = RY + rocket.y;
    if (rocket.intensity > 0.01) {
      // While the nozzle sits in the clouds only its glow shows; flames appear once it clears them.
      const n = ny < RY - 30 || rocket.state === 'landing' ? Math.floor(rocket.intensity * 260 * dt + Math.random()) : 0;
      for (let i = 0; i < n; i++) flame.add({ x: nx + rand(-14, 14) * rocket.intensity, y: ny, vx: rand(-40, 40), vy: rand(300, 520) * (0.4 + rocket.intensity), life: rand(.18, .45) * (0.5 + rocket.intensity), size: rand(18, 34) * (0.45 + rocket.intensity * .7) });
      const nearGround = ny > RY - 260;
      if (nearGround && rocket.intensity > .6 && Math.random() < rocket.intensity * dt * 40) {
        smoke.add({ x: RX + rand(-30, 30), y: RY - rand(0, 20), vx: rand(-1, 1) * rand(80, 320), vy: rand(-40, -5), life: rand(3, 6), s0: 50, s1: rand(140, 260) });
      }
      const gs = 260 + rocket.intensity * 420;
      draw(L, SPR.glowWarm, nx, ny + 20, gs, (nearGround ? .55 : .35) * rocket.intensity);
      if (nearGround) draw(L, SPR.glowWarm, RX, RY + 30, 900, .35 * rocket.intensity * clamp(1 - (RY - ny) / 260, 0, 1));
    }
    L.globalCompositeOperation = 'lighter';
    flame.step(dt, (q, k) => {
      q.x += q.vx * dt; q.y += q.vy * dt;
      const img = k < .25 ? SPR.core : k < .6 ? SPR.orange : SPR.red;
      draw(L, img, q.x, q.y, q.size * (1 + k * 1.4), (1 - k) * .85);
    });
    L.globalCompositeOperation = 'source-over';
    smoke.step(dt, (q, k) => {
      q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= Math.pow(.5, dt); q.vy -= 4 * dt;
      const s = lerp(q.s0, q.s1, easeOut(k));
      const a = Math.sin(Math.PI * Math.min(1, k * 1.6 + .1)) * .5 * (1 - k);
      draw(D, SPR.smoke, q.x, q.y, s, a);
      // lit from below by the flame while it burns
      const lit = clamp(1 - Math.abs(q.y - (RY + rocket.y)) / 300, 0, 1) * rocket.intensity;
      if (lit > .05) draw(D, SPR.smokeLit, q.x, q.y + s * .1, s * .8, a * lit * 1.2);
    });

    // egg
    egg.t += dt;
    const pulse = .55 + Math.sin(t * 2.2) * .15;
    if (egg.state === 'idle') {
      eggAura.setAttribute('opacity', f2(pulse));
      eggBody.setAttribute('transform', '');
      draw(L, SPR.lime, EX, EY - 46, 340, .38 * pulse);
      draw(L, SPR.lime, EX, EY + 10, 300, .25 * pulse);
    } else if (egg.state === 'wobble') {
      const k = egg.t;
      eggBody.setAttribute('transform', `rotate(${f2(Math.sin(k * 26) * 9 * (1 - k * .3))} ${EX} ${EY})`);
      crack.setAttribute('stroke-dashoffset', f1(120 * (1 - clamp((k - .25) / .8, 0, 1))));
      eggAura.setAttribute('opacity', f2(.7 + k * .3));
      draw(L, SPR.lime, EX, EY - 46, 280 + k * 120, .35 + k * .3);
      if (k > 1.1) {
        egg.state = 'burst'; egg.t = 0; flash = 1;
        eggBody.setAttribute('transform', '');
        eggTop.remove(); shellTopG.appendChild(eggTop);
        for (let i = 0; i < 60; i++) sparks.add({ x: EX + rand(-30, 30), y: EY - 50, vx: rand(-260, 260), vy: rand(-520, -120), life: rand(.7, 1.4), img: i % 2 ? SPR.lime : SPR.core, size: rand(4, 9), g: 600 });
        heroS.active = true; heroS.t = 0; heroS.x = EX; heroS.y = EY - 40; heroS.vx = 0; heroS.vy = 0; heroS.scale = 0;
        heroS.wp = [{ x: EX + 40, y: EY - 230 }, { x: 1020, y: 330 }, { x: 1290, y: 210 }, { x: 1420, y: 320 }, { x: 1250, y: 120 }, { x: 1750, y: -160 }];
      }
    } else if (egg.state === 'burst') {
      const k = egg.t;
      shellTopG.setAttribute('transform', `translate(${f1(-160 * k)} ${f1(-420 * k + 520 * k * k)}) rotate(${f1(-200 * k)} ${EX} ${EY - 60})`);
      shellTopG.setAttribute('opacity', f2(clamp(1.6 - k, 0, 1)));
      eggAura.setAttribute('opacity', f2(clamp(1 - k * .5, .15, 1)));
      draw(L, SPR.lime, EX, EY - 46, 300, clamp(.5 - k * .4, .1, 1));
      if (k > 9) { egg.state = 'regrow'; egg.t = 0; }
    } else if (egg.state === 'regrow') {
      const k = clamp(egg.t / 1.2, 0, 1);
      if (!eggTop.parentNode || eggTop.parentNode !== eggBody) { eggBody.insertBefore(eggTop, crack); shellTopG.removeAttribute('transform'); }
      crack.setAttribute('stroke-dashoffset', 120);
      eggBody.setAttribute('transform', `translate(${EX} ${EY}) scale(${f2(backOut(k))}) translate(${-EX} ${-EY})`);
      eggAura.setAttribute('opacity', f2(pulse * k));
      if (k >= 1) { egg.state = 'idle'; eggBody.removeAttribute('transform'); }
    }

    // hero flight: steer through waypoints; chases the rocket when it is flying
    if (heroS.active) {
      heroS.t += dt;
      hero.setCape(t, 1.4);
      if (heroS.t < .7) {
        heroS.scale = backOut(heroS.t / .7);
        heroS.y = EY - 40 - easeOut(heroS.t / .7) * 50;
        heroWrap.setAttribute('transform', `translate(${f1(heroS.x)} ${f1(heroS.y)}) scale(${f2(heroS.scale)}) rotate(-25)`);
      } else {
        let target = heroS.wp[0];
        if (rocket.state === 'liftoff' && rocket.y > -1100) target = { x: RX + 90, y: RY + rocket.y - 260 };
        if (target) {
          const dx = target.x - heroS.x, dy = target.y - heroS.y, d = Math.hypot(dx, dy) || 1;
          heroS.vx += dx / d * 2400 * dt; heroS.vy += dy / d * 2400 * dt;
          const v = Math.hypot(heroS.vx, heroS.vy), max = 720;
          if (v > max) { heroS.vx *= max / v; heroS.vy *= max / v; }
          if (d < 70 && target === heroS.wp[0]) heroS.wp.shift();
        }
        heroS.x += heroS.vx * dt; heroS.y += heroS.vy * dt;
        const dirX = heroS.vx < 0 ? -1 : 1;
        const ang = Math.atan2(heroS.vy, Math.abs(heroS.vx)) * 180 / Math.PI + 56;
        heroWrap.setAttribute('transform', `translate(${f1(heroS.x)} ${f1(heroS.y)}) scale(${dirX} 1) rotate(${f1(ang)})`);
        if (Math.random() < .6) sparks.add({ x: heroS.x - heroS.vx * .03, y: heroS.y - heroS.vy * .03, vx: rand(-20, 20), vy: rand(-20, 20), life: .5, img: SPR.lime, size: 5 });
        if (!heroS.wp.length || heroS.y < -200 || heroS.x > W + 200) heroS.active = false;
      }
      heroWrap.setAttribute('opacity', heroS.active ? 1 : 0);
    }

    // UFO: swoop in, beam the rocket (or the egg), zip away
    if (ufo.active) {
      ufo.t += dt;
      const tgt = rocket.state === 'idle' ? { x: RX, y: RY + rocket.y - 330 } : { x: EX, y: EY - 92 };
      const hover = { x: tgt.x, y: Math.max(90, tgt.y - 190) };
      let x, y, s = 1;
      if (ufo.t < 1.3) { const k = easeInOut(ufo.t / 1.3); x = lerp(W + 140, hover.x, k); y = lerp(80, hover.y, k) - Math.sin(k * Math.PI) * 120; s = lerp(.4, 1, k); }
      else if (ufo.t < 4.1) {
        x = hover.x + Math.sin(ufo.t * 2.4) * 8; y = hover.y + Math.sin(ufo.t * 3.1) * 6;
        const bk = clamp((ufo.t - 1.5) / .3, 0, 1) * clamp((4 - ufo.t) / .3, 0, 1);
        L.globalAlpha = bk * .55;
        const grd = L.createLinearGradient(0, y + 10, 0, tgt.y + 10);
        grd.addColorStop(0, 'rgba(124,255,106,.9)'); grd.addColorStop(1, 'rgba(124,255,106,0)');
        L.fillStyle = grd;
        L.beginPath(); L.moveTo(x - 16, y + 8); L.lineTo(x + 16, y + 8); L.lineTo(tgt.x + 70, tgt.y + 40); L.lineTo(tgt.x - 70, tgt.y + 40); L.closePath(); L.fill();
        if (bk > .5 && Math.random() < .5) sparks.add({ x: tgt.x + rand(-50, 50), y: tgt.y + rand(0, 40), vx: 0, vy: -rand(60, 140), life: 1, img: SPR.green, size: rand(4, 8) });
        if (rocket.state === 'idle') rocket.y = Math.sin(t * 1.3) * 3 - bk * 14;
      } else {
        const k = easeIn((ufo.t - 4.1) / .8);
        x = lerp(hover.x, -220, k); y = lerp(hover.y, -160, k); s = lerp(1, .5, k);
        if (k >= 1) { ufo.active = false; flash = .5; }
      }
      ufoG.setAttribute('opacity', ufo.active ? 1 : 0);
      ufoG.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${f2(s)}) rotate(${f1(Math.sin(ufo.t * 2) * 4)})`);
      ufoLights.forEach((c, i) => c.setAttribute('fill', (Math.floor(ufo.t * 8) + i) % 3 ? '#ffcf70' : '#ff3fe0'));
      draw(L, SPR.green, x, y + 4, 160, .35);
    }

    // shooting stars
    if (!reduced && t > nextStar) { nextStar = t + rand(7, 13); shootingStar(rand(300, W), rand(40, 260)); }
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt;
      const k = s.t / s.life;
      if (k >= 1) { stars.splice(i, 1); continue; }
      const len = 200, vl = Math.hypot(s.vx, s.vy);
      const tx = s.x - s.vx / vl * len, ty = s.y - s.vy / vl * len;
      const grd = L.createLinearGradient(s.x, s.y, tx, ty);
      grd.addColorStop(0, `rgba(255,255,255,${f2(1 - k)})`); grd.addColorStop(1, 'rgba(255,90,220,0)');
      L.globalAlpha = 1; L.strokeStyle = grd; L.lineWidth = 2.5; L.lineCap = 'round';
      L.beginPath(); L.moveTo(s.x, s.y); L.lineTo(tx, ty); L.stroke();
      draw(L, SPR.white, s.x, s.y, 16, 1 - k);
      if (Math.random() < .7) sparks.add({ x: s.x, y: s.y, vx: rand(-30, 30), vy: rand(0, 40), life: rand(.5, 1), img: SPR.pink, size: rand(3, 6), g: 60 });
    }

    // sparks
    L.globalCompositeOperation = 'lighter';
    sparks.step(dt, (q, k) => {
      q.vy += (q.g || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      draw(L, q.img, q.x, q.y, q.size, 1 - k);
    });
    L.globalCompositeOperation = 'source-over';
    if (flash > .02) { L.setTransform(1, 0, 0, 1, 0, 0); L.globalAlpha = flash * .35; L.fillStyle = '#fff6d0'; L.fillRect(0, 0, st.fxLight.width, st.fxLight.height); }
    L.globalAlpha = 1; D.globalAlpha = 1;
  });

  if (reduced) { rocket.state = 'idle'; st.renderOnce(); }
  return st;
}
