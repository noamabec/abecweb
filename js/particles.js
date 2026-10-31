// Portrait-to-portrait particle stream for the process section (raw WebGL, no library).
// Sampling, seeded stagger and eased travel adapted from React Bits "ParticleText".
// At rest every portrait is the real, sharp photo; particles exist only while scrolling between stages.

const VS = `
attribute vec2 aUvA; attribute vec2 aUvB; attribute vec3 aColA; attribute vec3 aColB; attribute float aSeed;
uniform vec4 uRectA; uniform vec4 uRectB; uniform vec2 uRes; uniform float uT; uniform float uTime;
uniform float uSize; uniform float uDpr; uniform vec3 uAccent; uniform float uSwirl;
varying vec3 vCol;
float ease(float t){ return t < .5 ? 4.*t*t*t : 1. - pow(-2.*t + 2., 3.) / 2.; }
void main(){
  vec2 pA = uRectA.xy + aUvA * uRectA.zw;
  vec2 pB = uRectB.xy + aUvB * uRectB.zw;
  float delay = aUvB.y * .4 + aSeed * .18;            // the head lands first
  float l = clamp((uT - delay) / .42, 0., 1.);
  float e = ease(l);
  float arc = sin(l * 3.14159265);
  vec2 d = pB - pA; float len = length(d) + 1.; vec2 n = vec2(-d.y, d.x) / len;
  vec2 p = mix(pA, pB, e);
  p += n * (aSeed - .5) * len * uSwirl * arc;
  p += vec2(sin(aSeed * 91.7 + uTime * 1.3), cos(aSeed * 57.3 + uTime * 1.1)) * 22. * arc;
  vec2 clip = (p / uRes) * 2. - 1.; clip.y = -clip.y;
  gl_Position = vec4(clip, 0., 1.);
  gl_PointSize = uSize * uDpr * (1. + .6 * arc);
  vCol = mix(mix(aColA, aColB, e), uAccent, arc * .6);
}`;
const FS = `
precision mediump float;
varying vec3 vCol; uniform float uAlpha;
void main(){
  float r = length(gl_PointCoord - .5);
  float a = uAlpha * (1. - smoothstep(.36, .5, r));
  gl_FragColor = vec4(vCol * a, a);
}`;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// where the photo is actually painted inside its box (object-fit: contain + object-position),
// so the particles land exactly on the picture and the photo takes over without a jump
function paintedRect(img) {
  const b = img.getBoundingClientRect();
  const ir = img.naturalWidth / img.naturalHeight || b.width / b.height;
  const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
  let w = b.width, h = b.height;
  if (b.width / b.height > ir) w = h * ir; else h = w / ir;
  return { left: b.left + (b.width - w) * (isNaN(px) ? 0.5 : px), top: b.top + (b.height - h) * (isNaN(py) ? 0.5 : py), width: w, height: h };
}

async function samplePortrait(img, cols, rows) {
  if (!img.complete || !img.naturalWidth) await new Promise((r) => img.addEventListener('load', r, { once: true }));
  try { await img.decode(); } catch {}
  const c = document.createElement('canvas');
  c.width = cols; c.height = rows;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;
  const pts = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = (y * cols + x) * 4;
    if (data[i + 3] > 170) pts.push([(x + 0.5) / cols, (y + 0.5) / rows, data[i] / 255, data[i + 1] / 255, data[i + 2] / 255]);
  }
  return pts;
}

export async function initParticles({ section, stages, accent = [0.176, 0.231, 1] }) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-motion');
  const imgs = stages.map((s) => s.querySelector('img'));
  const boxes = stages.map((s) => s.querySelector('.stage__frame'));
  const show = (i, v) => { imgs[i].style.opacity = v; };
  if (reduced) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'particles';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return;
  section.appendChild(canvas);

  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const cols = mobile ? 120 : 170, rows = Math.round(cols * 1.5);
  const maxN = mobile ? 7000 : 15000;

  const sets = await Promise.all(imgs.map((im) => samplePortrait(im, cols, rows)));
  const N = Math.min(maxN, ...sets.map((s) => s.length));
  // same particle count everywhere; sort top-to-bottom so heads map onto heads
  const stagesData = sets.map((pts, si) => {
    const r = rand(1234 + si * 77);
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
    const pick = pts.slice(0, N).map((p) => [...p, p[1] + (r() - 0.5) * 0.03]);
    pick.sort((a, b) => a[5] - b[5]);
    const uv = new Float32Array(N * 2), col = new Float32Array(N * 3);
    pick.forEach((p, i) => { uv[i * 2] = p[0]; uv[i * 2 + 1] = p[1]; col[i * 3] = p[2]; col[i * 3 + 1] = p[3]; col[i * 3 + 2] = p[4]; });
    return { uv, col };
  });
  // a loose cloud the first portrait gathers from
  const r0 = rand(99);
  const scatterUv = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) { scatterUv[i * 2] = r0(); scatterUv[i * 2 + 1] = stagesData[0].uv[i * 2 + 1] * 0.6 + r0() * 0.4; }
  const seeds = new Float32Array(N);
  const rs = rand(7);
  for (let i = 0; i < N; i++) seeds[i] = rs();

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);
  const buf = (arr) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW); return b; };
  const B = {
    uv: stagesData.map((s) => buf(s.uv)),
    col: stagesData.map((s) => buf(s.col)),
    scatter: buf(scatterUv),
    seed: buf(seeds),
  };
  const loc = (n) => gl.getAttribLocation(prog, n);
  const A = { uvA: loc('aUvA'), uvB: loc('aUvB'), colA: loc('aColA'), colB: loc('aColB'), seed: loc('aSeed') };
  const U = {};
  ['uRectA', 'uRectB', 'uRes', 'uT', 'uTime', 'uSize', 'uDpr', 'uAccent', 'uAlpha', 'uSwirl'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
  const attr = (l, b, size) => { gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0); };
  attr(A.seed, B.seed, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.uniform3fv(U.uAccent, accent);

  let dpr = 1, W = 0, H = 0;
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    // the visible area without the scrollbar, the same box the canvas covers
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener('resize', resize);

  let active = false;
  new IntersectionObserver(([e]) => { active = e.isIntersecting; }, { rootMargin: '20% 0px' }).observe(section);
  let cleared = true;

  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!active) return;
    const cy = boxes.map((b) => { const r = b.getBoundingClientRect(); return r.top + r.height / 2; });
    const rects = imgs.map(paintedRect);
    const mid = H * 0.5;
    // scroll progress of each segment: gather -> 0, 0 -> 1, 1 -> 2
    // HOLD keeps each photo sharp for a stretch of scroll around its resting point
    const HOLD = 0.2;
    const tg = clamp01((H * 1.05 - cy[0]) / (H * 0.45));
    const ts = [];
    for (let k = 0; k < rects.length - 1; k++) ts.push(clamp01(((mid - cy[k]) / (cy[k + 1] - cy[k]) - HOLD) / (1 - 2 * HOLD)));
    // crisp photos at rest
    for (let i = 0; i < imgs.length; i++) {
      const inF = i === 0 ? smooth(0.9, 1, tg) : smooth(0.9, 1, ts[i - 1]);
      const outF = i < ts.length ? 1 - smooth(0, 0.06, ts[i]) : 1;
      show(i, (inF * outF).toFixed(3));
    }
    let seg = -2, t = 0;
    if (tg > 0 && tg < 1) { seg = -1; t = tg; }
    ts.forEach((v, k) => { if (v > 0 && v < 1) { seg = k; t = v; } });
    if (seg === -2) {
      if (!cleared) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); cleared = true; }
      return;
    }
    cleared = false;
    let rA, rB;
    if (seg === -1) {
      rB = rects[0];
      rA = { left: rB.left - rB.width * 0.6, top: rB.top - rB.height * 0.35, width: rB.width * 2.2, height: rB.height * 1.5 };
      attr(A.uvA, B.scatter, 2); attr(A.colA, B.col[0], 3);
      attr(A.uvB, B.uv[0], 2); attr(A.colB, B.col[0], 3);
      gl.uniform1f(U.uSwirl, 0.15);
    } else {
      rA = rects[seg]; rB = rects[seg + 1];
      attr(A.uvA, B.uv[seg], 2); attr(A.colA, B.col[seg], 3);
      attr(A.uvB, B.uv[seg + 1], 2); attr(A.colB, B.col[seg + 1], 3);
      gl.uniform1f(U.uSwirl, 0.32);
    }
    const alpha = seg === -1 ? smooth(0, 0.15, t) * (1 - smooth(0.94, 1, t)) : smooth(0, 0.04, t) * (1 - smooth(0.94, 1, t));
    gl.uniform4f(U.uRectA, rA.left, rA.top, rA.width, rA.height);
    gl.uniform4f(U.uRectB, rB.left, rB.top, rB.width, rB.height);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uT, t);
    gl.uniform1f(U.uTime, now / 1000);
    gl.uniform1f(U.uSize, Math.max(1.6, (rB.width / cols) * 1.35));
    gl.uniform1f(U.uDpr, dpr);
    gl.uniform1f(U.uAlpha, alpha);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, N);
  };
  requestAnimationFrame(frame);
  section.classList.add('has-particles');
}
