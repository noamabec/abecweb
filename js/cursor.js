// A light trail of fragments behind the mouse, echoing the particles in the process section.
// Desktop with a real mouse only. Two blended layers keep text reading on top:
// on light areas the fragments multiply (ink stays ink), on dark areas they screen (light text stays light).
const DARK = '.about__inner, .site-footer, .work-card, .p-next__link, .p-view, .intro';

export function initCursorTrail() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-motion');
  if (!fine || reduced) return;

  const layer = (mod) => {
    const c = document.createElement('canvas');
    c.className = `cursor-trail cursor-trail--${mod}`;
    c.setAttribute('aria-hidden', 'true');
    document.body.append(c);
    return c;
  };
  const canvases = { light: layer('light'), dark: layer('dark') };
  const ctx = { light: canvases.light.getContext('2d'), dark: canvases.dark.getContext('2d') };
  let dpr = 1, W = 0, H = 0;
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    Object.values(canvases).forEach((c) => { c.width = W * dpr; c.height = H * dpr; });
  };
  resize();
  window.addEventListener('resize', resize);

  const parts = [];
  const MAX = 160;
  let last = null, raf = 0;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const t = e.target instanceof Element ? e.target : null;
    const dark = !!t?.closest(DARK);
    const x = e.clientX, y = e.clientY;
    if (last) {
      const dx = x - last.x, dy = y - last.y;
      const n = Math.min(4, Math.floor(Math.hypot(dx, dy) / 9));
      for (let i = 0; i < n; i++) {
        const k = i / Math.max(1, n);
        parts.push({
          x: last.x + dx * k, y: last.y + dy * k,
          vx: -dx * 0.02 + (Math.random() - 0.5) * 0.9,
          vy: -dy * 0.02 + (Math.random() - 0.5) * 0.9 + 0.15,
          s: 1.4 + Math.random() * 2.2,
          life: 0, max: 520 + Math.random() * 380,
          dark, accent: Math.random() < 0.7,
        });
      }
      if (parts.length > MAX) parts.splice(0, parts.length - MAX);
    }
    last = { x, y };
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { last = null; });

  let prev = 0;
  function tick(now) {
    const dt = prev ? Math.min(40, now - prev) : 16;
    prev = now;
    for (const c of Object.values(ctx)) { c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H); }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      if (p.life >= p.max) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt * 0.06; p.y += p.vy * dt * 0.06;
      p.vx *= 0.985; p.vy *= 0.985;
      const f = 1 - p.life / p.max;
      const c = p.dark ? ctx.dark : ctx.light;
      c.globalAlpha = 0.8 * f * f;
      c.fillStyle = p.accent ? (p.dark ? '#8A93FF' : '#2D3BFF') : (p.dark ? '#F3F2EE' : '#141414');
      const s = p.s * (0.6 + 0.4 * f);
      c.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }
    if (parts.length) raf = requestAnimationFrame(tick);
    else { raf = 0; prev = 0; for (const c of Object.values(ctx)) c.clearRect(0, 0, W, H); }
  }
}
