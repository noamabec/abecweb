// Shared header, mobile menu, footer (contact), floating WhatsApp and accessibility widget.
import { CONTACT, waLink } from './config.js';
import { initCursorTrail } from './cursor.js';

const ARROW = '<svg class="ico-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m0 0 6-6m-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export { ARROW };

const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.24-1.37A9.9 9.9 0 1 0 12.04 2Zm0 18.1c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.1.82.83-3.03-.2-.31a8.2 8.2 0 1 1 7.02 3.86Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-1.97-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.16 1.75 2.67 4.24 3.75.6.25 1.05.4 1.41.52.6.19 1.13.16 1.56.1.47-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>';
const A11Y_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.2" r="2" fill="currentColor"/><path d="M4.5 8.2c2.5.7 5 1 7.5 1s5-.3 7.5-1M12 9.2v5.3m0 0-3.2 6.3m3.2-6.3 3.2 6.3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';

const SOCIAL_LABEL = { instagram: 'אינסטגרם', facebook: 'פייסבוק', linkedin: 'לינקדאין' };

export function logoMarkup(tag = 'a', base = '') {
  const inner = `<img class="logo__img" src="${base}assets/img/logo.svg?v=3" alt="Noam Abecassis" width="476" height="70">`;
  return tag === 'a'
    ? `<a class="logo" href="${base}index.html" aria-label="נועם אבקסיס, לדף הבית">${inner}</a>`
    : `<span class="logo">${inner}</span>`;
}

export function renderLayout({ base = '', home = false } = {}) {
  const link = (hash) => (home ? hash : `${base}index.html${hash}`);
  const nav = [
    ['#work', 'עבודות'],
    ['#process', 'איך זה עובד'],
    ['#about', 'עליי'],
    ['#contact', 'צור קשר'],
  ];
  const navHtml = nav.map(([h, t]) => `<a href="${h === '#contact' ? '#contact' : link(h)}">${t}</a>`).join('');
  const wa = waLink('היי נועם, הגעתי מהאתר שלך ואשמח לדבר על אתר לעסק שלי');

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <a class="skip-link" href="#main">דילוג לתוכן</a>
    <div class="site-header__inner">
      ${logoMarkup('a', base)}
      <nav class="nav" aria-label="ניווט ראשי">${navHtml}</nav>
      <div class="site-header__actions">
        <a class="btn btn--primary btn--sm header-cta" href="${wa}" target="_blank" rel="noopener">לשיחה בוואטסאפ</a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu"><span class="menu-btn__lines" aria-hidden="true"></span><span class="menu-btn__label">תפריט</span></button>
      </div>
    </div>`;
  document.body.prepend(header);

  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'mobile-menu';
  menu.hidden = true;
  menu.innerHTML = `
    <nav class="mobile-menu__nav" aria-label="ניווט בנייד">${navHtml}</nav>
    <a class="btn btn--primary btn--block" href="${wa}" target="_blank" rel="noopener">לשיחה בוואטסאפ ${ARROW}</a>`;
  header.after(menu);

  const socials = Object.entries(CONTACT.social).filter(([, u]) => u);
  const year = new Date().getFullYear();
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.id = 'contact';
  footer.innerHTML = `
    <div class="footer__inner">
      <div class="footer__head">
        <h2 class="footer__title">בואו נדבר<span class="dot">.</span></h2>
        <p class="footer__lead">השאירו פרטים ואחזור אליכם לשיחה קצרה בטלפון. נבין יחד מה העסק צריך, ואיך אתר יכול לקדם אותו.</p>
      </div>
      <div class="footer__grid">
        <form class="lead-form" novalidate>
          <div class="field">
            <label for="f-name">שם מלא</label>
            <input id="f-name" name="name" type="text" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="f-phone">טלפון</label>
            <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" required>
          </div>
          <div class="field field--wide">
            <label for="f-biz">שם העסק או קישור לאינסטגרם <span class="opt">(לא חובה)</span></label>
            <input id="f-biz" name="biz" type="text">
          </div>
          <fieldset class="field field--wide chips">
            <legend>מה אתם צריכים?</legend>
            ${['אתר תדמית', 'חנות אונליין', 'דף נחיתה', 'עוד לא בטוח'].map((v, i) => `<label class="chip"><input type="radio" name="need" value="${v}" ${i === 3 ? 'checked' : ''}><span>${v}</span></label>`).join('')}
          </fieldset>
          <div class="field--wide lead-form__actions">
            <button class="btn btn--primary" type="submit">שליחת הפרטים ${ARROW}</button>
            <p class="lead-form__alt">או <a href="${wa}" target="_blank" rel="noopener">כתבו לי ישר בוואטסאפ</a></p>
          </div>
          <p class="lead-form__error" role="alert" hidden></p>
          <div class="lead-form__done" role="status" hidden>
            <p class="lead-form__done-title">תודה, קיבלתי.</p>
            <p>נפתחה לכם הודעת וואטסאפ עם הפרטים. שלחו אותה, ואחזור אליכם לשיחה קצרה.</p>
          </div>
        </form>
        <div class="footer__side">
          <p class="footer__label">ישר אליי</p>
          <ul class="footer__links">
            <li><a href="${wa}" target="_blank" rel="noopener">וואטסאפ <bdi>${CONTACT.phoneDisplay}</bdi></a></li>
            <li><a href="mailto:${CONTACT.email}"><bdi>${CONTACT.email}</bdi></a></li>
            ${socials.map(([k, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${SOCIAL_LABEL[k]}</a></li>`).join('')}
          </ul>
          <p class="footer__label">באתר</p>
          <ul class="footer__links footer__links--nav">${nav.slice(0, 3).map(([h, t]) => `<li><a href="${link(h)}">${t}</a></li>`).join('')}</ul>
          <p class="footer__clock"><span>ישראל</span> <span class="mono" data-clock>--:--</span></p>
        </div>
      </div>
      <div class="footer__legal">
        <span>© <bdi>${year}</bdi> נועם אבקסיס</span>
        <a href="${base}accessibility.html">הצהרת נגישות</a>
        <a href="${base}privacy.html">מדיניות פרטיות</a>
        <span>האתר נבנה ע"י נועם אבקסיס · <a href="https://www.abecweb.com" target="_blank" rel="noopener"><bdi>www.abecweb.com</bdi></a></span>
      </div>
    </div>`;
  document.querySelector('main').after(footer);

  const fab = document.createElement('div');
  fab.innerHTML = `
    <a class="fab fab--wa" href="${wa}" target="_blank" rel="noopener" aria-label="שליחת הודעה בוואטסאפ">${WA_ICON}</a>
    <button class="fab fab--a11y" type="button" aria-label="תפריט נגישות" aria-expanded="false" aria-controls="a11y-panel">${A11Y_ICON}</button>
    <div class="a11y-panel" id="a11y-panel" role="dialog" aria-label="הגדרות נגישות" hidden>
      <p class="a11y-panel__title">נגישות</p>
      <button type="button" data-a11y="text">הגדלת טקסט</button>
      <button type="button" data-a11y="contrast">ניגודיות גבוהה</button>
      <button type="button" data-a11y="motion">עצירת אנימציות</button>
      <button type="button" data-a11y="links">הדגשת קישורים</button>
      <button type="button" data-a11y="reset">איפוס</button>
      <a href="${base}accessibility.html">הצהרת נגישות</a>
    </div>`;
  document.body.append(...fab.children);

  initHeader(header, menu);
  initForm(footer.querySelector('.lead-form'));
  initClock(footer.querySelector('[data-clock]'));
  initA11y();
  initCursorTrail();
  return { header, footer };
}

// On scroll the logo folds into the blue line and the N: the name dissolves letter by letter back
// into the N, then the N glides to the edge. Scrolling back up plays it in reverse.
function initLogoFold(header) {
  const logo = header.querySelector('.logo');
  const { gsap } = window;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.classList.contains('a11y-motion');
  let tl, ready = false;
  setTimeout(() => { ready = true; }, 0);
  return (fold, toggle) => {
    tl?.kill();
    // hold the current width and mask before the class flips the CSS width (a reversal mid-way continues from there)
    const from = logo.getBoundingClientRect().width;
    const cs = getComputedStyle(logo);
    const midKeep = cs.getPropertyValue('--keep').includes('px') ? cs.getPropertyValue('--keep').trim() : null;
    const midSoft = cs.getPropertyValue('--soft').trim();
    toggle();
    if (!ready || !gsap || reduced()) { gsap?.set(logo, { clearProps: 'width,--keep,--soft' }); return; }
    const h = parseFloat(getComputedStyle(header).getPropertyValue('--logo-h')) || 30;
    const full = h * 476 / 70, mark = h;
    // the mask stays opaque up to --keep and fades out over --soft; the box width does the glide
    const soft = `${(h * 1.6).toFixed(1)}px`;
    gsap.set(logo, { width: from });
    tl = gsap.timeline({ onComplete: () => gsap.set(logo, { clearProps: 'width,--keep,--soft' }) });
    if (fold) {
      tl.fromTo(logo, { '--keep': midKeep || `${full}px`, '--soft': midKeep ? midSoft : '0px' }, { '--keep': `${mark}px`, '--soft': soft, duration: 0.7, ease: 'power2.inOut' })
        .to(logo, { width: mark, duration: 0.85, ease: 'expo.inOut' }, 0.3);
    } else {
      tl.set(logo, { '--keep': midKeep || `${mark}px`, '--soft': midKeep ? midSoft : soft })
        .to(logo, { width: full, duration: 0.85, ease: 'expo.inOut' })
        .to(logo, { '--keep': `${full}px`, '--soft': '0px', duration: 0.75, ease: 'power2.inOut' }, 0.3);
    }
  };
}

function initHeader(header, menu) {
  const foldLogo = initLogoFold(header);
  const onScroll = () => {
    const scrolled = window.scrollY > 24;
    if (scrolled === header.classList.contains('is-scrolled')) return;
    foldLogo(scrolled, () => header.classList.toggle('is-scrolled', scrolled));
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  const btn = header.querySelector('.menu-btn');
  const close = () => {
    btn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-open');
    setTimeout(() => { if (btn.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 400);
  };
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => document.documentElement.classList.add('menu-open'));
      btn.setAttribute('aria-expanded', 'true');
    } else close();
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { close(); btn.focus(); } });
}

function initForm(form) {
  const err = form.querySelector('.lead-form__error');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const name = String(d.get('name') || '').trim();
    const phone = String(d.get('phone') || '').trim();
    const missing = [];
    if (!name) missing.push('שם');
    if (phone.replace(/\D/g, '').length < 9) missing.push('טלפון תקין');
    form.querySelectorAll('input[required]').forEach((i) => i.setAttribute('aria-invalid', String(!i.value.trim())));
    if (missing.length) {
      err.textContent = `חסר ${missing.join(' ו')}.`;
      err.hidden = false;
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    err.hidden = true;
    const biz = String(d.get('biz') || '').trim();
    const msg = [`היי נועם, הגעתי מהאתר.`, `שם: ${name}`, `טלפון: ${phone}`, biz && `העסק: ${biz}`, `מה צריך: ${d.get('need')}`].filter(Boolean).join('\n');
    window.open(waLink(msg), '_blank', 'noopener');
    form.classList.add('is-done');
    form.querySelector('.lead-form__done').hidden = false;
  });
}

function initClock(el) {
  const fmt = new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem', hour12: false });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 20000);
}

function initA11y() {
  const KEY = 'abec-a11y';
  const root = document.documentElement;
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch {}
  const apply = () => {
    root.classList.toggle('a11y-text', !!state.text);
    root.classList.toggle('a11y-contrast', !!state.contrast);
    root.classList.toggle('a11y-motion', !!state.motion);
    root.classList.toggle('a11y-links', !!state.links);
    document.querySelectorAll('[data-a11y]').forEach((b) => b.setAttribute('aria-pressed', String(!!state[b.dataset.a11y])));
  };
  apply();
  const btn = document.querySelector('.fab--a11y');
  const panel = document.getElementById('a11y-panel');
  btn.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a11y]');
    if (!b) return;
    const k = b.dataset.a11y;
    if (k === 'reset') state = {}; else state[k] = !state[k];
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    apply();
    if (k === 'motion' || k === 'reset') location.reload();
  });
}
