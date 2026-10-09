// Shared engine for the code-drawn "Nocturne" scenes.
// Layer stack per scene (back to front):
//   svg.bg (static, heavy filters) -> canvas fog back -> svg.art (subjects)
//   -> canvas fxDark (smoke, normal blend) -> canvas fxLight (glow, screen blend)
//   -> canvas fog front -> grain -> vignette
// Everything is drawn in artwork units (the scene's W x H); canvases are mapped
// to the current viewBox every frame so they stay registered with the SVG.

export const NS = 'http://www.w3.org/2000/svg';
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
export const easeIn = (t) => Math.pow(clamp(t, 0, 1), 3);
export const easeInOut = (t) => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const backOut = (t) => { t = clamp(t, 0, 1); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const f1 = (v) => v.toFixed(1);
export const f2 = (v) => v.toFixed(2);

export function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
export function svgFrom(markup, parent) {
  const tmp = document.createElementNS(NS, 'svg');
  tmp.innerHTML = markup;
  const nodes = [...tmp.childNodes];
  nodes.forEach((n) => parent.appendChild(n));
  return nodes.find((n) => n.nodeType === 1);
}

/* ---------- noise smoke (periodic value noise, tileable) ---------- */
function noiseTile(size, cell, octaves, seed, color, gamma) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const grids = [];
  for (let o = 0; o < octaves; o++) {
    const n = cell << o, g = new Float32Array(n * n);
    for (let i = 0; i < g.length; i++) g[i] = rnd();
    grids.push({ n, g });
  }
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const sm = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let v = 0, amp = 1, tot = 0;
    for (const { n, g } of grids) {
      const fx = x / size * n, fy = y / size * n;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = sm(fx - x0), ty = sm(fy - y0);
      const x1 = (x0 + 1) % n, y1 = (y0 + 1) % n;
      v += amp * lerp(lerp(g[y0 * n + x0], g[y0 * n + x1], tx), lerp(g[y1 * n + x0], g[y1 * n + x1], tx), ty);
      tot += amp; amp *= 0.5;
    }
    v = Math.pow(clamp((v / tot - 0.35) / 0.5, 0, 1), gamma);
    const i = (y * size + x) * 4;
    img.data[i] = color[0]; img.data[i + 1] = color[1]; img.data[i + 2] = color[2]; img.data[i + 3] = v * 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
let tiles = null;
const smokeTiles = () => (tiles ||= {
  light: noiseTile(128, 4, 4, 1234, [96, 82, 140], 1.6),
  dark: noiseTile(128, 3, 4, 777, [2, 1, 12], 1.1),
});

// Soft round sprite for glows, flames and smoke puffs (drawn once, scaled on use).
export function sprite(color, size = 64, hard = 0) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, color);
  grd.addColorStop(hard, color);
  grd.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

/* ---------- stage ---------- */
// section: element with a .scene child (absolutely positioned) and an optional .content child.
// focus: [x, y, w, h] in art units that must stay visible.
export function createStage(section, { W, H, focus = [0, 0, W, H], fogFront = true, fogBack = false, frontMask = [0.5, 0.5], shade = [0.24, 0.56, 0.52, 0.5, 0.72] }) {
  const scene = section.querySelector('.scene');
  const content = section.querySelector('.content');
  scene.innerHTML = '';
  const bg = el('svg', { class: 'bg', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }, scene);
  const mk = (cls) => { const c = document.createElement('canvas'); c.className = cls; scene.append(c); return c; };
  const fogB = fogBack ? mk('fog back') : null;
  const art = el('svg', { class: 'art', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }, scene);
  const fxLight = mk('fx light');
  // Smoke is drawn into the front fog canvas (normal blend) to save a full-screen layer.
  const fxDark = mk('fog front');
  scene.insertAdjacentHTML('beforeend', '<div class="artfade"></div>');
  // Film grain lives inside the static background, so it costs nothing per frame.
  bg.insertAdjacentHTML('beforeend', `<filter id="grain-${section.id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`);
  const grainRect = el('rect', { x: -400, y: -400, width: W + 800, height: H + 800, filter: `url(#grain-${section.id})`, opacity: .14, style: 'mix-blend-mode:overlay' });
  const fogF = fogFront ? fxDark : null;

  const arts = [art];
  const stage = {
    W, H, bg, art, arts, fxDark, fxLight, section, scene,
    vb: [0, 0, W, H], scale: 1, px: 1, portrait: false,
    dark: fxDark.getContext('2d'), light: fxLight.getContext('2d'),
    frames: [], clicks: [], visible: false, onVisible: null,
  };

  function frame() {
    const box = scene.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const sw = box.width, sh = box.height, a = sw / sh;
    const [fx, fy, fw, fh] = focus;
    const portrait = a < 0.9;
    section.classList.toggle('portrait', portrait);
    let vb;
    if (portrait && content) {
      // Phones: fit the focus box into the space above the headline/CTA.
      const ui = content.getBoundingClientRect().height + 24;
      const areaPx = Math.max(sh * 0.42, sh - ui);
      let s = Math.min(areaPx / fh, sw / (fw * 0.85)); // crop the subject by 15% at most
      s = Math.max(s, sw / W);                         // never run out of artwork at the sides
      const w = sw / s, h = sh / s, areaH = areaPx / s;
      vb = [clamp(fx + fw / 2 - w / 2, 0, W - w), clamp(fy + fh / 2 - areaH / 2, Math.min(0, H - h), H - areaH), w, h];
      scene.style.setProperty('--art-bottom', `${(H - vb[1]) * s}px`);
    } else if (a < W / H) {
      const w = H * a;
      vb = [clamp(fx + fw / 2 - w / 2, 0, W - w), 0, w, H];
    } else {
      const h = W / a;
      vb = [0, clamp(fy + fh / 2 - h / 2, 0, H - h), W, h];
    }
    stage.vb = vb;
    stage.cssW = sw;
    stage.portrait = portrait;
    stage.scale = sw / vb[2];
    [bg, ...arts].forEach((s) => s.setAttribute('viewBox', vb.map((v) => v.toFixed(1)).join(' ')));
    // Effect canvases hold soft light and smoke: 0.75x of the CSS size is plenty. Fog at half size.
    const dpr = 0.75;
    fxLight.width = Math.round(sw * dpr); fxLight.height = Math.round(sh * dpr);
    for (const c of [fogB, fxDark]) if (c) { c.width = Math.max(2, Math.round(sw / 2)); c.height = Math.max(2, Math.round(sh / 2)); }
    if (fogF) { buildMask(fogF.width, fogF.height); buildOverlay(fogF.width, fogF.height); }
  }

  // Map art units onto a canvas context.
  stage.toArtT = (ctx) => {
    const s = stage.scale * (ctx.canvas.width / stage.cssW);
    ctx.setTransform(s, 0, 0, s, -stage.vb[0] * s, -stage.vb[1] * s);
  };
  stage.toArt = (cx, cy) => {
    const r = scene.getBoundingClientRect();
    return { x: stage.vb[0] + (cx - r.left) / stage.scale, y: stage.vb[1] + (cy - r.top) / stage.scale };
  };

  // Fog
  let mask = null;
  const fbCtx = fogB?.getContext('2d'), ffCtx = fogF?.getContext('2d');
  function buildMask(w, h) {
    mask = document.createElement('canvas'); mask.width = w; mask.height = h;
    const m = mask.getContext('2d');
    const g = m.createRadialGradient(w * frontMask[0], h * frontMask[1], h * .3, w * .5, h * .5, Math.max(w, h) * .72);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.55, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,1)');
    m.fillStyle = g; m.fillRect(0, 0, w, h);
    const b = m.createLinearGradient(0, h * .78, 0, h);
    b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(1, 'rgba(0,0,0,.6)');
    m.fillStyle = b; m.fillRect(0, 0, w, h);
  }
  let pats = null;
  const ensurePats = () => {
    if (pats) return;
    const t = smokeTiles();
    pats = { light: (fbCtx || ffCtx).createPattern(t.light, 'repeat'), dark: (ffCtx || fbCtx).createPattern(t.dark, 'repeat'), light2: (ffCtx || fbCtx).createPattern(t.light, 'repeat') };
  };
  const drawPattern = (ctx, pat, scale, ox, oy, alpha, w, h) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.setTransform(scale, 0, 0, scale, ox % (128 * scale), oy % (128 * scale));
    ctx.fillStyle = pat;
    ctx.fillRect(-128, -128, w / scale + 256, h / scale + 256);
    ctx.restore();
  };
  let fogTick = 0;
  function drawFog(t) {
    if (!pats) { ffCtx?.clearRect(0, 0, fxDark.width, fxDark.height); if (ffCtx && overlay) ffCtx.drawImage(overlay, 0, 0); return; }
    // The back fog drifts a few pixels per second: redrawing it every third frame is invisible
    // and halves the canvas uploads.
    if (fbCtx && fogTick++ % 3 === 0) {
      const { width: w, height: h } = fogB, k = w / 350;
      fbCtx.clearRect(0, 0, w, h);
      drawPattern(fbCtx, pats.light, 2.6 * k, t * 9, -t * 4, .5, w, h);
      drawPattern(fbCtx, pats.light, 1.7 * k, -t * 6 + 90, t * 3 + 40, .3, w, h);
    }
    if (ffCtx && mask) {
      const { width: w, height: h } = fogF, k = w / 350;
      ffCtx.clearRect(0, 0, w, h);
      drawPattern(ffCtx, pats.dark, 2.2 * k, -t * 7, t * 2, .95, w, h);
      drawPattern(ffCtx, pats.dark, 3.4 * k, t * 5 + 60, -t * 3, .8, w, h);
      drawPattern(ffCtx, pats.light2, 2.4 * k, t * 11 + 30, -t * 5, .22, w, h);
      ffCtx.globalCompositeOperation = 'destination-in';
      ffCtx.drawImage(mask, 0, 0);
      ffCtx.globalCompositeOperation = 'source-over';
    }
    if (ffCtx && overlay) ffCtx.drawImage(overlay, 0, 0);
  }
  // Vignette and the darkening behind the headline, painted into the front canvas
  // instead of living in extra full-screen layers.
  let overlay = null;
  function buildOverlay(w, h) {
    overlay = document.createElement('canvas'); overlay.width = w; overlay.height = h;
    const o = overlay.getContext('2d');
    const v = o.createRadialGradient(w * (stage.portrait ? .5 : .62), h * .45, Math.min(w, h) * .35, w * .55, h * .5, Math.hypot(w, h) * .6);
    v.addColorStop(0, 'rgba(2,1,12,0)'); v.addColorStop(.6, 'rgba(2,1,12,.45)'); v.addColorStop(1, 'rgba(1,0,8,.92)');
    o.fillStyle = v; o.fillRect(0, 0, w, h);
    if (shade && !stage.portrait) {
      const [cx, cy, rx, ry, a] = shade;
      o.save(); o.translate(w * cx, h * cy); o.scale(1, (h * ry) / (w * rx));
      const g = o.createRadialGradient(0, 0, 0, 0, 0, w * rx);
      g.addColorStop(0, `rgba(3,2,18,${a})`); g.addColorStop(.6, `rgba(3,2,18,${a * .42})`); g.addColorStop(1, 'rgba(3,2,18,0)');
      o.fillStyle = g; o.fillRect(-w, -w, w * 2, w * 2); o.restore();
    }
  }
  (window.requestIdleCallback || ((f) => setTimeout(f, 250)))(() => { ensurePats(); drawFog(0); }, { timeout: 1500 });

  // Loop: runs only while the section is on screen and the tab is visible.
  let raf = 0, last = 0;
  const t0 = performance.now();
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    const t = (now - t0) / 1000;
    stage.light.setTransform(1, 0, 0, 1, 0, 0);
    stage.light.clearRect(0, 0, fxLight.width, fxLight.height);
    stage.dark.setTransform(1, 0, 0, 1, 0, 0);
    if (fogF) drawFog(reduced ? 0 : t); else stage.dark.clearRect(0, 0, fxDark.width, fxDark.height);
    for (const fn of stage.frames) fn(t, dt, now);
    if (stage.visible && !document.hidden && !reduced) raf = requestAnimationFrame(tick);
  }
  stage.kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
  stage.renderOnce = () => requestAnimationFrame(tick);

  new IntersectionObserver(([e]) => {
    // isIntersecting is also true when the section merely touches the viewport edge
    stage.visible = e.isIntersecting && e.intersectionRatio > 0;
    if (stage.visible) { stage.kick(); stage.onVisible?.(e.intersectionRatio); }
  }, { threshold: [0, 0.35, 0.6] }).observe(section);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && stage.visible) stage.kick(); });

  section.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button, input, textarea, select')) return;
    const p = stage.toArt(e.clientX, e.clientY);
    for (const fn of stage.clicks) if (fn(p, e) === true) break;
    stage.kick();
    if (reduced) stage.renderOnce();
  });

  // Extra art layers stacked above the previous ones (below the effect canvases).
  // Give static, slowly drifting content (cloud banks) its own layer: moving the
  // whole layer with a CSS transform costs nothing, repainting it every frame does.
  stage.addArt = (cls = '') => {
    const s = el('svg', { class: `art ${cls}`, viewBox: stage.vb.join(' '), preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' });
    scene.insertBefore(s, fxLight);
    arts.push(s);
    return s;
  };

  stage.finishBg = () => bg.appendChild(grainRect); // call after a scene has drawn its background
  frame();
  new ResizeObserver(() => { frame(); if (reduced || !raf) stage.renderOnce(); }).observe(scene);
  return stage;
}

/* ---------- particles on canvas (art units) ---------- */
export class Particles {
  constructor(max) { this.list = []; this.max = max; }
  add(p) { if (this.list.length < this.max) this.list.push({ age: 0, ...p }); }
  step(dt, fn) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.age += dt;
      if (p.age >= p.life) { this.list.splice(i, 1); continue; }
      fn(p, p.age / p.life);
    }
  }
}

// Shared hero figure (same as the logo mark): flying pose, origin at the waist.
// Returns { g, cape, setCape(t, speed) } – the cape waves while flying.
export function buildHero(parent, { scale = 1, id = 'hero' } = {}) {
  const g = el('g', { class: 'hero' }, parent);
  const inner = el('g', { transform: `scale(${scale})` }, g);
  const cape = el('path', { fill: `url(#${id}Cape)` }, inner);
  svgFrom(`<defs>
      <linearGradient id="${id}Cape" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff6a2a"/><stop offset=".55" stop-color="#ea3d09"/><stop offset="1" stop-color="#6e1405"/>
      </linearGradient>
      <linearGradient id="${id}Suit" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3a2050"/><stop offset=".6" stop-color="#140b22"/><stop offset="1" stop-color="#05030c"/>
      </linearGradient>
    </defs>
    <g stroke-linecap="round" fill="none">
      <path d="M0 0 L-9 13" stroke="url(#${id}Suit)" stroke-width="7"/>
      <path d="M0 0 L4 14" stroke="url(#${id}Suit)" stroke-width="7"/>
      <path d="M0 0 L10 -17" stroke="url(#${id}Suit)" stroke-width="9"/>
      <path class="arm" d="M10 -17 L19 -28" stroke="url(#${id}Suit)" stroke-width="6"/>
      <path d="M10 -17 L-1 -12" stroke="url(#${id}Suit)" stroke-width="6"/>
      <path d="M11 -16 L18 -27" stroke="#c6ff3a" stroke-width="1.2" opacity=".55"/>
      <path d="M2 -1 L11 -16" stroke="#c6ff3a" stroke-width="1.1" opacity=".45" transform="translate(3 1)"/>
    </g>
    <circle cx="14.5" cy="-23.5" r="5.2" fill="#140b22"/>
    <path d="M17 -27a5.2 5.2 0 0 1 2.5 4" stroke="#c6ff3a" stroke-width="1.2" fill="none" opacity=".7"/>
    <circle cx="20" cy="-29" r="2.6" fill="#140b22"/>`, inner);
  inner.insertBefore(cape, inner.querySelector('g'));
  const setCape = (t, speed = 1) => {
    const w1 = Math.sin(t * 9 * speed) * 4, w2 = Math.sin(t * 9 * speed + 1.7) * 6;
    cape.setAttribute('d', `M9 -16 C 2 -12 -8 ${f1(-4 + w1)} -22 ${f1(4 + w2)} C -16 ${f1(8 + w2 * .5)} -10 ${f1(6 + w1 * .5)} -4 4 C 0 0 5 -8 9 -16 Z`);
  };
  setCape(0);
  return { g, inner, cape, setCape };
}
