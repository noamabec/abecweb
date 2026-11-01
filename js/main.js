import { renderLayout, ARROW } from './layout.js?v=9';
import { PROJECTS } from './projects.js';
import { mockMarkup, initMock } from './screens.js';
import { initParticles } from './particles.js?v=5';
import { initCommon, reducedMotion } from './common.js?v=3';
import { initHeroSketch } from './hero-sketch.js?v=2';

const { gsap } = window;
const root = document.documentElement;

renderLayout({ home: true });
renderWork();
const { lenis } = initCommon();
const heroSketch = initHeroSketch({ reduced: reducedMotion });

function renderWork() {
  const grid = document.querySelector('[data-work-grid]');
  grid.innerHTML = PROJECTS.map((p, i) => `
    <a class="work-card" href="work/${p.slug}.html" data-reveal style="--i:${i % 2}">
      <div class="work-card__media">${mockMarkup(p)}</div>
      <div class="work-card__meta">
        <div class="work-card__name">
          <h3 class="work-card__title">${p.name}</h3>
          <p class="work-card__sub">${p.tagline}</p>
        </div>
        <ul class="work-card__tags">${p.tags.map((t) => `<li>${t}</li>`).join('')}</ul>
      </div>
      <span class="work-card__go" aria-hidden="true">${ARROW}</span>
    </a>`).join('');
  grid.querySelectorAll('.work-card').forEach((card, i) => initMock(card.querySelector('.mock'), PROJECTS[i], { hoverTarget: card }));
}

// ---------- hero reveal ----------
function heroIn(delay = 0) {
  const title = document.querySelector('.hero__title');
  if (reducedMotion || !gsap) { root.classList.add('hero-ready'); return; }
  const tl = gsap.timeline({ delay, onStart: () => root.classList.add('hero-ready') });
  // the headline is sketched like the photo: letters rise as a blue outline, then get inked right to left,
  // and the blue dot lands last, like the pen leaving the paper
  const dot = title.querySelector('.dot');
  const split = window.SplitText ? new window.SplitText(title, { type: 'lines,chars', mask: 'lines', linesClass: 'line', charsClass: 'char' }) : null;
  if (split) {
    const chars = split.chars.filter((c) => !c.closest('.dot'));
    title.classList.add('is-sketching');
    tl.from(chars, { yPercent: 110, rotate: 8, duration: 0.9, stagger: 0.035, ease: 'expo.out' })
      .to(chars, { color: 'rgba(20, 20, 20, 1)', webkitTextStrokeColor: 'rgba(45, 59, 255, 0)', duration: 0.55, stagger: 0.03, ease: 'power2.inOut' }, 1)
      .add(() => title.classList.remove('is-sketching'))
      .fromTo(dot, { yPercent: -260, scale: 0.4, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'bounce.out' }, '-=0.35');
  } else tl.from(title, { y: 40, opacity: 0, duration: 1, ease: 'expo.out' });
  tl.from('.hero__lead', { y: 18, opacity: 0, duration: 0.8, ease: 'power3.out' }, '<0.1')
    .from('.hero__actions .btn', { y: 16, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, '<0.1')
    .from('.hero__foot > *', { opacity: 0, duration: 0.8, stagger: 0.1 }, '<0.6');
  // the photo is drawn in by the sketch
  heroSketch.playIn(delay + 0.1);
}

// ---------- intro: Noam pushes the dark away ----------
function playIntro() {
  const intro = document.querySelector('.intro');
  if (!root.classList.contains('intro-on') || !gsap) { intro?.remove(); heroIn(0.1); return; }
  try { sessionStorage.setItem('abec-intro', '1'); } catch {}
  // the intro always lands on the hero, even after a reload mid-page
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  lenis?.scrollTo(0, { immediate: true });
  lenis?.stop();

  const dark = intro.querySelector('.intro__dark');
  const pusher = intro.querySelector('.intro__pusher');
  const frames = [...pusher.querySelectorAll('img')];
  const name = intro.querySelector('.intro__name');
  const skip = intro.querySelector('.intro__skip');
  const W = () => window.innerWidth;
  const state = { edge: W() + 40 };
  let frame = 0, lastSwap = 0;
  const order = [2, 1, 0, 3];

  const render = (now = performance.now()) => {
    const e = state.edge;
    dark.style.clipPath = `inset(0 ${Math.max(0, W() - Math.max(0, e))}px 0 0)`;
    pusher.style.transform = `translate3d(${e}px,0,0)`;
    if (now - lastSwap > 120) {
      lastSwap = now;
      frame = (frame + 1) % order.length;
      frames.forEach((f, i) => (f.style.opacity = i === order[frame] ? 1 : 0));
    }
  };
  render();

  const finish = () => {
    const logo = document.querySelector('.site-header .logo');
    const a = name.getBoundingClientRect(), b = logo.getBoundingClientRect();
    const s = b.height / a.height;
    const tl = gsap.timeline({ onComplete: () => { intro.remove(); root.classList.remove('intro-on'); lenis?.start(); } });
    tl.to(name, { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), scale: s, duration: 1, ease: 'expo.inOut' })
      .add(() => root.classList.add('intro-done'), 0.75)
      .to(intro, { opacity: 0, duration: 0.35, ease: 'none' }, 0.92);
    heroIn(0.55);
  };

  const push = gsap.timeline({ onUpdate: () => render(), onComplete: finish });
  push.to(state, { edge: W() * 0.62, duration: 0.95, ease: 'power1.in' }, 0.35)
    .to(state, { edge: -pusher.offsetWidth - 40, duration: 1.15, ease: 'power2.in' })
    .to({}, { duration: 0.35 });

  const onSkip = () => { if (push.progress() < 1) push.progress(1); };
  skip.addEventListener('click', onSkip);
  window.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { onSkip(); window.removeEventListener('keydown', k); } });
}

// wait for the fonts so the name and the hero lines measure right
(document.fonts?.ready || Promise.resolve()).then(() => {
  playIntro();
  const process = document.querySelector('.process');
  initParticles({ section: process, stages: [...process.querySelectorAll('.stage')] });
});
