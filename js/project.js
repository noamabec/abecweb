import { renderLayout, ARROW } from './layout.js?v=3';
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
    <div class="p-hero__mock" data-reveal>${mockMarkup(p, base, { eager: true })}</div>
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

  <section class="p-full" aria-label="העמוד המלא">
    <div class="p-full__sticky">
      <div class="browser">
        <div class="browser__bar" aria-hidden="true">
          <span class="browser__dots"><i></i><i></i><i></i></span>
          <span class="browser__url" dir="ltr">${p.urlLabel}</span>
        </div>
        <div class="browser__view">
          <picture>
            <source media="(max-width: 767px)" srcset="${base}assets/img/scroll-${p.slug}-mob.webp">
            <img class="browser__page" src="${base}assets/img/page-${p.slug}.webp" alt="צילום מסך של העמוד המלא באתר ${p.name}" width="1440" height="9000" loading="lazy" decoding="async">
          </picture>
        </div>
      </div>
      <p class="p-full__hint mono" aria-hidden="true">גללו כדי לעבור על כל העמוד</p>
    </div>
  </section>

  <section class="p-phones" aria-labelledby="phones-title">
    <h2 class="sec-title" id="phones-title" data-edge>ככה זה נראה בנייד<span class="dot">.</span></h2>
    <div class="p-phones__row">
      ${[1, 2, 3].map((n, i) => `
        <figure class="phone" style="--i:${i}">
          <img src="${base}assets/img/phone-${p.slug}-${n}.webp" alt="${p.name} במסך נייד, חלק ${n}" width="780" height="1688" loading="lazy" decoding="async">
        </figure>`).join('')}
    </div>
  </section>

  <section class="p-highs" aria-labelledby="highs-title">
    <h2 class="sec-title" id="highs-title" data-edge>שלושה רגעים מהאתר<span class="dot">.</span></h2>
    <ol class="p-highs__list">
      ${p.highlights.map(([t, d], i) => `
        <li class="p-high" data-reveal>
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
initCommon();
initMock(main.querySelector('.p-hero__mock .mock'), p);

// the full-page screenshot scrolls inside the browser frame as the section passes
if (!reducedMotion && gsap && ScrollTrigger) {
  const page = main.querySelector('.browser__page');
  const view = main.querySelector('.browser__view');
  const setup = () => {
    gsap.to(page, {
      y: () => -Math.max(0, page.getBoundingClientRect().height - view.clientHeight),
      ease: 'none',
      scrollTrigger: { trigger: '.p-full', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
    });
  };
  if (page.complete) setup(); else page.addEventListener('load', setup, { once: true });
  // phones drift at different speeds (desktop only; on phones they sit in a swipe row)
  if (window.matchMedia('(min-width: 768px)').matches) {
    gsap.utils.toArray('.phone').forEach((ph, i) => {
      gsap.fromTo(ph, { y: 40 + i * 50 }, { y: -20 - i * 30, ease: 'none', scrollTrigger: { trigger: '.p-phones', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    });
  }
} else {
  main.querySelector('.p-full')?.classList.add('is-static');
}
