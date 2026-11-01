// Shared motion: smooth scroll, anchor links, reveals, the "edge" heading wipe, footer reveal.
const { gsap, ScrollTrigger, Lenis } = window;
const root = document.documentElement;

export const reducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('a11y-motion');

export function initCommon() {
  let lenis = null;
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (!reducedMotion && Lenis && gsap) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.__lenis = lenis;

  // same-page anchors through Lenis, with the header height as offset
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = url.hash === '#top' ? document.body : document.querySelector(url.hash);
    if (!target) return;
    e.preventDefault();
    const offset = url.hash === '#contact' ? 0 : -72;
    if (lenis) lenis.scrollTo(url.hash === '#contact' ? document.documentElement.scrollHeight : target, { offset, duration: 1.4 });
    else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', url.hash);
  });

  initFooterReveal();

  // while the page scrolls, cards slide under a cursor that stands still; hover effects wait until it stops,
  // or every card on the way lifts, opens its clip or starts its screen
  // (the wheel comes a moment before the scroll, so no card catches a hover on the first frame)
  let idle = 0;
  const scrolling = () => {
    root.classList.add('is-scrolling');
    clearTimeout(idle);
    idle = setTimeout(() => root.classList.remove('is-scrolling'), 180);
  };
  window.addEventListener('wheel', scrolling, { passive: true });
  window.addEventListener('scroll', scrolling, { passive: true });

  if (reducedMotion || !gsap) { root.classList.add('no-motion'); return { lenis }; }

  // fade-up reveals
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.fromTo(els, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'expo.out', overwrite: true }),
  });
  gsap.set('[data-reveal]', { opacity: 0 });

  // the "edge": a thin line sweeps right to left and uncovers the heading, like the push in the intro
  document.querySelectorAll('[data-edge]').forEach((h) => {
    const line = document.createElement('span');
    line.className = 'edge-line';
    line.setAttribute('aria-hidden', 'true');
    h.append(line);
    const st = { p: 100 };
    const draw = () => {
      h.style.clipPath = `inset(-20% 0 -20% ${st.p}%)`;
      line.style.left = `${st.p}%`;
      line.style.opacity = st.p > 0.5 && st.p < 99.5 ? 1 : 0;
    };
    draw();
    ScrollTrigger.create({
      trigger: h, start: 'top 85%', once: true,
      onEnter: () => gsap.to(st, { p: 0, duration: 1.25, ease: 'expo.inOut', onUpdate: draw, onComplete: () => { h.style.clipPath = ''; } }),
    });
  });

  // stage copy slides in from its own side
  document.querySelectorAll('.stage__copy').forEach((c) => {
    gsap.from(c.children, {
      y: 36, opacity: 0, duration: 1, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: c, start: 'top 80%', once: true },
    });
  });

  // keep pins and triggers honest when late images change the page height
  let t = 0;
  new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 200); }).observe(document.querySelector('main'));
  return { lenis };
}

// the page lifts off a fixed dark footer ("Say Hello.")
function initFooterReveal() {
  const footer = document.querySelector('.site-footer');
  const main = document.querySelector('main');
  if (!footer || !main) return;
  const fit = () => {
    const h = footer.offsetHeight;
    const on = !reducedMotion && h < window.innerHeight - 20 && window.innerWidth >= 768;
    root.classList.toggle('footer-reveal', on);
    main.style.marginBottom = on ? `${h}px` : '';
  };
  fit();
  new ResizeObserver(fit).observe(footer);
  window.addEventListener('resize', fit);
}
