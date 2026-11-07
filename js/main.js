import { renderLayout, ARROW } from './layout.js?v=10';
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
  const split = window.SplitText ? new window.SplitText(title, { type: 'lines,words,chars', mask: 'lines', linesClass: 'line', charsClass: 'char' }) : null;
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

// the hero paragraph runs as wide as the headline's longest line (CSS can't shrink a wrapped heading's box to its text)
function fitLead() {
  const title = document.querySelector('.hero__title');
  const lead = document.querySelector('.hero__lead');
  lead.style.maxWidth = '';
  const range = document.createRange();
  range.selectNodeContents(title);
  const rects = [...range.getClientRects()].filter((r) => r.width);
  if (!rects.length) return;
  const width = Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left));
  lead.style.maxWidth = `${width}px`;
  pyramid(lead, width * 0.99);
}

// breaks the paragraph into a pyramid: each line longer than the one above, the last one the full width.
// Words are measured in place, then the breaks that best follow a ramp from 55% to 100% of the width win
// (tried with the fewest lines that fit and one or two more).
function pyramid(lead, width) {
  const words = (lead.dataset.text ||= lead.textContent.trim()).split(/\s+/);
  lead.innerHTML = words.map((w) => `<span>${w}</span>`).join(' ');
  const sizes = [...lead.children].map((s) => s.getBoundingClientRect().width);
  const gap = document.createElement('span');
  gap.style.whiteSpace = 'pre'; gap.textContent = ' ';
  lead.append(gap);
  const space = gap.getBoundingClientRect().width;
  const N = words.length;
  const line = (s, e) => sizes.slice(s, e).reduce((a, b) => a + b, 0) + space * (e - s - 1);
  const total = line(0, N);
  let best = null;
  for (let n = Math.max(1, Math.ceil(total / width)); n <= Math.ceil(total / width) + 2; n++) {
    const target = (i) => width * (n === 1 ? 1 : 0.55 + 0.45 * i / (n - 1));
    // cost[i][e]: the best way to set words 0..e in i lines; from[i][e]: where the last of those lines starts
    const cost = Array.from({ length: n + 1 }, () => new Array(N + 1).fill(Infinity));
    const from = Array.from({ length: n + 1 }, () => new Array(N + 1).fill(0));
    cost[0][0] = 0;
    for (let i = 1; i <= n; i++) {
      for (let e = 1; e <= N; e++) {
        for (let s = e - 1; s >= 0; s--) {
          const w = line(s, e);
          if (w > width) break;
          // a line that ends on a comma or a full stop reads better; one that ends on "את" leaves a word hanging
          const last = words[e - 1];
          const nudge = e === N ? 0 : /[,.?!:]$/.test(last) ? -((width * 0.12) ** 2) : last.length <= 2 ? (width * 0.12) ** 2 : 0;
          const c = cost[i - 1][s] + (w - target(i - 1)) ** 2 + nudge;
          if (c < cost[i][e]) { cost[i][e] = c; from[i][e] = s; }
        }
      }
    }
    if (cost[n][N] === Infinity) continue;
    const score = cost[n][N] / n;
    if (!best || score < best.score) {
      const breaks = [];
      for (let i = n, e = N; i > 0; e = from[i][e], i--) breaks.unshift([from[i][e], e]);
      best = { score, breaks };
    }
  }
  const lines = best ? best.breaks.map(([s, e]) => words.slice(s, e).join(' ')) : [words.join(' ')];
  lead.innerHTML = lines.join('<br>');
}

// wait for the fonts so the name and the hero lines measure right
(document.fonts?.ready || Promise.resolve()).then(() => {
  fitLead();
  window.addEventListener('resize', fitLead);
  playIntro();
  const process = document.querySelector('.process');
  initParticles({ section: process, stages: [...process.querySelectorAll('.stage')] });
});
