import { renderLayout, ARROW } from './layout.js?v=9';
import { PROJECTS } from './projects.js';
import { mockMarkup, initMock } from './screens.js';
import { initCommon, reducedMotion } from './common.js';

const { gsap, ScrollTrigger } = window;
const base = '../';
const slug = document.body.dataset.project;
const index = Math.max(0, PROJECTS.findIndex((p) => p.slug === slug));
const p = PROJECTS[index];
const next = PROJECTS[(index + 1) % PROJECTS.length];
const two = (n) => String(n).padStart(2, '0');
const EXPAND = '<svg class="ico-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 15v5h-5M4 4l6 6m10 10-6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

document.title = `${p.name} · עבודות · נועם אבקסיס`;
const main = document.querySelector('main');
main.innerHTML = `
  <section class="p-hero" aria-labelledby="p-title">
    <a class="p-back" href="${base}index.html#work"><span class="p-back__arrow">${ARROW}</span> לכל העבודות</a>
    <div class="p-hero__head">
      <p class="p-hero__count mono">(${two(index + 1)}/${two(PROJECTS.length)})</p>
      <h1 class="p-hero__title" id="p-title" data-edge>${p.name}</h1>
      <p class="p-hero__tagline">${p.tagline}</p>
    </div>
    <dl class="p-meta">
      <div><dt>סוג הנכס</dt><dd>${p.type}</dd></div>
      <div><dt>תחום</dt><dd>${p.field}</dd></div>
      <div><dt>מה עשיתי</dt><dd>אפיון · עיצוב · פיתוח</dd></div>
      <div><dt>שנה</dt><dd><bdi>2026</bdi></dd></div>
    </dl>
    <div class="p-phones__row" role="group" aria-label="ככה זה נראה בנייד">
      ${[1, 2, 3].map((n, i) => `
        <figure class="phone" style="--i:${i}">
          <div class="phone__body">
            <img src="${base}assets/img/phone-${p.slug}-${n}.webp" alt="${p.name} במסך נייד, חלק ${n}" width="780" height="1688" loading="eager" decoding="async">
          </div>
        </figure>`).join('')}
    </div>
    <div class="p-phones__cta">
      <button class="btn btn--primary" type="button" data-view-open="mob" aria-haspopup="dialog">ככה זה נראה בנייד ${EXPAND}</button>
    </div>
  </section>

  <section class="p-story" aria-label="על הפרויקט">
    <div class="p-story__col" data-reveal>
      <h2 class="p-label">הבריף</h2>
      <p>${p.brief}</p>
    </div>
    <div class="p-story__col" data-reveal>
      <h2 class="p-label">מה בניתי</h2>
      <p>${p.built}</p>
      <a class="btn btn--ghost" href="${p.url}" target="_blank" rel="noopener">לאתר החי ↗</a>
    </div>
  </section>

  <section class="p-desk" aria-labelledby="desk-title">
    <h2 class="sec-title" id="desk-title" data-edge>וגם במחשב<span class="dot">.</span></h2>
    <div class="p-desk__mock" data-reveal>${mockMarkup(p, base)}</div>
    <div class="p-desk__cta">
      <button class="btn btn--primary" type="button" data-view-open="desk" aria-haspopup="dialog">ככה זה נראה במחשב ${EXPAND}</button>
    </div>
  </section>

  <dialog class="p-view" aria-labelledby="view-title">
    <div class="p-view__bar">
      <h2 class="p-view__title" id="view-title">${p.name}</h2>
      <span class="p-view__url mono" dir="ltr">${p.urlLabel}</span>
      <button class="p-view__close" type="button" data-view-close aria-label="סגירת התצוגה"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    </div>
    <div class="p-view__scroll" data-lenis-prevent tabindex="0" aria-label="העמוד המלא, אפשר לגלול">
      <img class="p-view__page" data-mode="desk" src="${base}assets/img/page-${p.slug}.webp" alt="צילום מסך של העמוד המלא באתר ${p.name} במחשב" width="1440" height="9000" loading="lazy" decoding="async">
      <img class="p-view__page" data-mode="mob" src="${base}assets/img/scroll-${p.slug}-mob.webp" alt="צילום מסך של העמוד המלא באתר ${p.name} בנייד" width="390" height="5064" loading="lazy" decoding="async">
    </div>
  </dialog>

  <section class="p-highs" aria-labelledby="highs-title">
    <h2 class="sec-title" id="highs-title" data-edge>שלושה רגעים מהאתר<span class="dot">.</span></h2>
    <ol class="p-highs__list">
      ${p.highlights.map(([t, d], i) => `
        <li class="p-high" data-reveal>
          <div class="p-high__media">
            <img src="${base}assets/clips/${p.slug}-${i + 1}.jpg" data-clip="${base}assets/clips/${p.slug}-${i + 1}.webp" alt="${t}, ככה זה נראה באתר" width="490" height="325" loading="lazy" decoding="async">
            <span class="p-high__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg></span>
          </div>
          <span class="p-high__num mono">${two(i + 1)}</span>
          <h3 class="p-high__title">${t}</h3>
          <p>${d}</p>
        </li>`).join('')}
    </ol>
  </section>

  <section class="p-next" aria-label="הפרויקט הבא">
    <a class="p-next__link" href="${next.slug}.html">
      <span class="p-next__label mono">הפרויקט הבא</span>
      <span class="p-next__name">${next.name}<span class="p-next__go">${ARROW}</span></span>
      <img class="p-next__img" src="${base}assets/img/mock-${next.slug}.webp" alt="" width="1600" height="1195" loading="lazy">
    </a>
  </section>`;

renderLayout({ base });
const { lenis } = initCommon();
initMock(main.querySelector('.p-desk__mock .mock'), p);

if (!reducedMotion && gsap && ScrollTrigger) {
  // the phones rise in one after another and stay lined up
  gsap.from('.phone', { y: 70, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out', delay: 0.2 });
}

// each highlight card holds a short clip of that moment on the site: it plays on hover,
// or on touch screens while the card is in view (the still frame stays for reduced motion)
const hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
main.querySelectorAll('.p-high').forEach((card) => {
  const img = card.querySelector('.p-high__media img');
  const still = img.src;
  const play = (on) => {
    if (reducedMotion) return;
    // setting the src again restarts the animation from its first frame
    img.src = on ? img.dataset.clip : still;
    card.classList.toggle('is-playing', on);
  };
  if (hover) {
    card.addEventListener('mouseenter', () => play(true));
    card.addEventListener('mouseleave', () => play(false));
  } else {
    new IntersectionObserver(([e]) => play(e.isIntersecting), { threshold: 0.6 }).observe(card);
  }
});

// the full page on a full screen, as on a computer or on a phone: opens from its button, closes with the X or Esc
const view = main.querySelector('.p-view');
const title = view.querySelector('.p-view__title');
const scroller = view.querySelector('.p-view__scroll');
const animate = !reducedMotion && gsap;
let opener = null;
main.querySelectorAll('[data-view-open]').forEach((btn) => btn.addEventListener('click', () => {
  opener = btn;
  const mode = btn.dataset.viewOpen;
  view.dataset.mode = mode;
  title.textContent = `${p.name} ${mode === 'mob' ? 'בנייד' : 'במחשב'}`;
  view.querySelector(`.p-view__page[data-mode="${mode}"]`).loading = 'eager';
  scroller.scrollTop = 0;
  view.showModal();
  lenis?.stop();
  document.documentElement.classList.add('view-open');
  if (animate) gsap.fromTo(view, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' });
}));
const shut = () => {
  if (!view.open) return;
  const done = () => { view.close(); };
  if (animate) gsap.to(view, { opacity: 0, scale: 0.97, duration: 0.3, ease: 'power2.in', onComplete: done }); else done();
};
view.addEventListener('close', () => {
  gsap?.set(view, { clearProps: 'opacity,transform' });
  document.documentElement.classList.remove('view-open');
  lenis?.start();
  opener?.focus();
});
view.addEventListener('cancel', (e) => { e.preventDefault(); shut(); });
view.querySelector('[data-view-close]').addEventListener('click', shut);
