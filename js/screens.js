// Live device screens inside the mockup photos.
// The photo has a transparent hole where the screen is; under it sits the real screenshot,
// mapped onto the screen's 4 corners with a CSS matrix3d (perspective homography).
import { MOCK_W, MOCK_H } from './projects.js';

const gsap = window.gsap;
const hoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-motion');

// unit square -> quad (Heckbert), scaled to a w x h element
function quadMatrix(w, h, p) {
  const [x0, y0] = p[0], [x1, y1] = p[1], [x2, y2] = p[2], [x3, y3] = p[3];
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let a, b, c, d, e, f, g, hh;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    a = x1 - x0; b = x2 - x1; c = x0; d = y1 - y0; e = y2 - y1; f = y0; g = 0; hh = 0;
  } else {
    const det = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / det;
    hh = (dx1 * dy3 - dx3 * dy1) / det;
    a = x1 - x0 + g * x1; b = x3 - x0 + hh * x3; c = x0;
    d = y1 - y0 + g * y1; e = y3 - y0 + hh * y3; f = y0;
  }
  a /= w; d /= w; g /= w; b /= h; e /= h; hh /= h;
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
}

export function mockMarkup(p, base = '', { eager = false } = {}) {
  const mob = p.device === 'phone';
  const scrollSrc = `${base}assets/img/scroll-${p.slug}${mob ? '-mob' : ''}.webp`;
  const scrollH = mob ? 5064 : 9000;
  const loading = eager ? 'eager' : 'lazy';
  return `
    <div class="mock" data-mock="${p.slug}">
      <img class="mock__base" src="${base}assets/img/mock-${p.slug}.webp" alt="" width="1600" height="1195" loading="${loading}" decoding="async">
      <div class="mock__screen" style="width:${p.shot.w}px;height:${p.shot.h}px">
        <img class="mock__scroll" src="${scrollSrc}" alt="" width="${p.shot.w}" height="${Math.round((scrollH * p.shot.w) / (mob ? 390 : 1440))}" loading="${loading}" decoding="async">
      </div>
      <img class="mock__frame" src="${base}assets/img/mock-${p.slug}-frame.webp" alt="האתר ${p.name} על ${mob ? 'מסך טלפון' : 'מסך מחשב'}" width="1600" height="1195" loading="${loading}" decoding="async">
    </div>`;
}

export function initMock(el, p, { hoverTarget = el, autoplay = !hoverFine } = {}) {
  const screen = el.querySelector('.mock__screen');
  const img = el.querySelector('.mock__scroll');
  const place = () => {
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const sx = r.width / MOCK_W, sy = r.height / MOCK_H;
    const s = p.screen;
    const pts = [s.tl, s.tr, s.br, s.bl].map(([x, y]) => [x * sx, y * sy]);
    screen.style.transform = quadMatrix(p.shot.w, p.shot.h, pts);
  };
  place();
  new ResizeObserver(place).observe(el);

  if (reduced || !gsap) return;
  let tween = null;
  const travel = () => {
    const h = img.naturalHeight ? (img.naturalHeight * p.shot.w) / img.naturalWidth : img.height;
    return Math.max(0, h - p.shot.h);
  };
  const run = () => {
    const dist = travel();
    tween?.kill();
    tween = gsap.to(img, { y: -dist, duration: Math.max(6, dist / (p.device === 'phone' ? 260 : 520)), ease: 'none' });
  };
  const back = () => {
    tween?.kill();
    tween = gsap.to(img, { y: 0, duration: 1.2, ease: 'power3.out' });
  };

  if (!autoplay) {
    hoverTarget.addEventListener('mouseenter', run);
    hoverTarget.addEventListener('mouseleave', back);
    hoverTarget.addEventListener('focusin', run);
    hoverTarget.addEventListener('focusout', back);
  } else {
    // touch screens: the page scrolls by itself while the card is on screen
    let loop = null;
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting) {
        if (!loop) {
          const dist = travel();
          loop = gsap.to(img, { y: -dist, duration: Math.max(8, dist / (p.device === 'phone' ? 200 : 380)), ease: 'sine.inOut', repeat: -1, yoyo: true, repeatDelay: 1.2, delay: 0.6 });
        } else loop.play();
      } else loop?.pause();
    }, { threshold: 0.55 }).observe(el);
  }
}
