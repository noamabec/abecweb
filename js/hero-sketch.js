// The blue line sketches Noam first, then the photo fills in; afterwards the sketch peeks under the mouse.
const { gsap } = window;

const lerp = (a, b, t) => a + (b - a) * t;

export function initHeroSketch({ reduced }) {
  const hero = document.querySelector('.hero');
  const fig = hero.querySelector('.hero__figure');
  const photo = fig.querySelector('.hero__photo');
  const sketch = fig.querySelector('.hv4');
  const pen = fig.querySelector('.hv4-pen');
  const peek = fig.querySelector('.hv4-peek');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- peek lens (desktop mouse only) ----------
  if (fine && !reduced) {
    const ptr = { x: -999, y: -999, has: false };
    window.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { ptr.x = e.clientX; ptr.y = e.clientY; ptr.has = true; } }, { passive: true });
    let visible = true, on = 0;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(hero);
    const tick = () => {
      requestAnimationFrame(tick);
      if (!visible) return;
      const r = fig.getBoundingClientRect();
      const inside = ptr.has && ptr.x > r.left && ptr.x < r.right && ptr.y > r.top && ptr.y < r.bottom;
      on = lerp(on, inside ? 1 : 0, 0.12);
      peek.style.setProperty('--mx', `${ptr.x - r.left}px`);
      peek.style.setProperty('--my', `${ptr.y - r.top}px`);
      peek.style.opacity = on.toFixed(3);
    };
    requestAnimationFrame(tick);
  }

  // ---------- the edge line: rests on the background grid line right next to the photo ----------
  const edge = fig.querySelector('.hero__edge');
  const mobile = window.matchMedia('(max-width: 767px)');
  const placeEdge = () => {
    if (mobile.matches) return;
    const main = document.querySelector('main');
    const m = main.getBoundingClientRect();
    const g = parseFloat(getComputedStyle(hero).paddingLeft);
    const col = (m.width - 2 * g) / 6;
    const r = fig.getBoundingClientRect();
    // the first grid line past the photo's outer edge (the figure box has a little air around Noam)
    const min = r.right - r.width * 0.06 - m.left;
    const k = Math.max(0, Math.ceil((min - g) / col));
    fig.style.setProperty('--edge-x', `${(g + k * col + m.left - r.left).toFixed(1)}px`);
  };
  placeEdge();
  window.addEventListener('resize', placeEdge);

  // ---------- entrance: the line drops, its tip becomes the pen, the sketch then the photo ----------
  function playIn(delay = 0) {
    if (reduced || !gsap) return;
    const st = { q: 0 };
    gsap.set(photo, { clipPath: 'inset(0 0 100% 0)' });
    gsap.set(sketch, { opacity: 1, clipPath: 'inset(0 0 100% 0)' });
    // the drop: from above the hero down to the top of the head, where the drawing starts
    gsap.set(edge, { display: 'block', left: '50%', top: mobile.matches ? '-6%' : '-40vh', bottom: '92%', scaleY: 0, opacity: 0.9 });
    gsap.set(pen, { top: '8%', left: '50%', opacity: 0 });
    gsap.timeline({ delay })
      .to(edge, { scaleY: 1, duration: 0.75, ease: 'expo.in' })
      .set(pen, { opacity: 1 })
      .to(edge, { scaleY: 0, duration: 0.5, ease: 'power2.in' })
      .to(st, {
        q: 1, duration: 1.7, ease: 'power1.inOut',
        onUpdate: () => {
          sketch.style.clipPath = `inset(0 0 ${(100 - st.q * 100).toFixed(2)}% 0)`;
          pen.style.top = `${(8 + st.q * 92).toFixed(2)}%`;
          pen.style.left = `${(50 + Math.sin(st.q * Math.PI * 9) * 24).toFixed(2)}%`;
          pen.style.opacity = st.q < 0.98 ? 1 : 0;
        },
      }, '<')
      .to(photo, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'expo.inOut' }, '-=0.5')
      .to(sketch, { opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.3')
      .set(photo, { clearProps: 'clipPath' })
      // the line comes back to rest on the grid, beside the finished photo (desktop only)
      .set(edge, { clearProps: 'left,top,bottom,display', scaleY: 0 }, '-=0.6')
      .add(placeEdge, '<')
      .to(edge, { scaleY: mobile.matches ? 0 : 1, duration: 1.2, ease: 'expo.inOut' }, '<');
  }

  return { playIn };
}
