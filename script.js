// =========================================================
// Portfolio animations
// 1. Language switch (EN / ES)   2. Typing effect in the hero
// 3. Reveal on scroll            4. Header hides on scroll down
// 5. Floating contact button     6. "View case" cursor on projects
// =========================================================

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- 1. Language ----------
// Texts live in each page as data-lang="en" / data-lang="es" pairs.
// The page title can change with the language: <title data-en="…" data-es="…">.
const titleEl = document.querySelector('title');
function setLang(lang) {
  root.lang = lang;
  if (titleEl && titleEl.dataset[lang]) document.title = titleEl.dataset[lang];
  document.querySelectorAll('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)));
  document.querySelectorAll('[data-alt-en]').forEach((img) => { img.alt = img.dataset[lang === 'es' ? 'altEs' : 'altEn']; });
  try { localStorage.setItem('lang', lang); } catch (e) { /* storage not available: fine */ }
  restartTyping();
}
document.querySelectorAll('[data-set-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.setLang)));

// ---------- 2. Typing effect ----------
// Edit the phrases here. "\n" is the line break. The hero is always in English.
const phrases = {
  en: ['I make complex\nthings feel simple.', "I'm a product\ndesigner", 'I design for people,\nnot just screens.'],
};
const typedEl = document.querySelector('.typed-text');
const SPEED_TYPE = 55;    // ms per letter when writing
const SPEED_DELETE = 28;  // ms per letter when deleting
const HOLD = 2600;        // ms the full phrase stays on screen
let typingTimer = null;

function restartTyping() {
  clearTimeout(typingTimer);
  if (!typedEl) return; // only the home has the typing effect
  const list = phrases.en; // the hero always stays in English
  if (reduceMotion) { typedEl.textContent = list[0]; return; }
  let i = 0;           // which phrase
  let n = list[0].length; // start with the first phrase already written
  let deleting = false;
  typedEl.textContent = list[0];
  const tick = () => {
    const full = list[i];
    if (!deleting && n === full.length) { deleting = true; typingTimer = setTimeout(tick, HOLD); return; }
    if (deleting && n === 0) { deleting = false; i = (i + 1) % list.length; typingTimer = setTimeout(tick, 350); return; }
    n += deleting ? -1 : 1;
    typedEl.textContent = list[i].slice(0, n);
    typingTimer = setTimeout(tick, deleting ? SPEED_DELETE : SPEED_TYPE);
  };
  typingTimer = setTimeout(tick, 1200);
}
setLang(root.lang === 'es' ? 'es' : 'en');

// ---------- 3. Reveal on scroll ----------
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach((el, i) => {
    // Cards in a row appear one after the other (cascade)
    const stagger = el.matches('.service, .project') ? (i % 4) * 0.08
      : el.closest('.stagger') ? Array.prototype.indexOf.call(el.parentNode.children, el) * 0.09 : 0;
    el.style.transitionDelay = stagger + 's';
    io.observe(el);
  });
} else {
  revealItems.forEach((el) => el.classList.add('is-in'));
}

// ---------- 4 + 5. Header and floating contact ----------
const header = document.querySelector('.site-header');
const floatBtn = document.querySelector('.float-contact');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (header) header.classList.toggle('is-hidden', y > lastY && y > 140);
  if (floatBtn) floatBtn.classList.toggle('is-visible', y > 600);
  lastY = y;
}, { passive: true });

// ---------- 6. Custom cursor over projects (mouse only) ----------
const cursor = document.querySelector('.cursor');
if (cursor && window.matchMedia('(pointer: fine)').matches) {
  const label = cursor.querySelector('span');
  let x = 0, y = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
  const loop = () => {
    cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    requestAnimationFrame(loop);
  };
  loop();
  document.querySelectorAll('.project').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      label.textContent = el.dataset['cursor' + (root.lang === 'es' ? 'Es' : 'En')];
      cursor.classList.add('is-active');
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
  });
} else {
  document.querySelectorAll('.project').forEach((p) => (p.style.cursor = 'pointer'));
}

// ---------- 7. Case study video: plays when it reaches the screen ----------
// Browsers only allow sound after the visitor has clicked or tapped the page.
// So: try with sound; if the browser blocks it, play muted and show "Turn sound on".
const video = document.querySelector('.case-video video');
if (video && 'IntersectionObserver' in window) {
  const soundBtn = document.querySelector('.sound-btn');
  const showSoundBtn = (show) => soundBtn && soundBtn.classList.toggle('is-visible', show);
  const play = () => {
    video.muted = false;
    video.play().then(() => showSoundBtn(false)).catch(() => {
      video.muted = true;
      video.play().catch(() => {});
      showSoundBtn(true);
    });
  };
  if (soundBtn) soundBtn.addEventListener('click', () => { video.muted = false; video.play(); showSoundBtn(false); });
  video.addEventListener('volumechange', () => { if (!video.muted) showSoundBtn(false); });
  new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) play(); else video.pause(); });
  }, { threshold: 0.5 }).observe(video);
}

// ---------- 8. Numbers that count up when they reach the screen ----------
// Any <strong class="count"> like "+8000", "55%", "U$D 635k" or "+18.5k":
// the number grows from 0 to its value; the symbols around it stay fixed.
const counters = document.querySelectorAll('.count');
if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
  const DURATION = 1800; // ms
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const run = (el) => {
    const m = el.dataset.final.match(/^(\D*)([\d.,]+)(.*)$/);
    if (!m) return;
    const [, before, num, after] = m;
    const target = parseFloat(num.replace(',', '.'));
    const decimals = (num.split(/[.,]/)[1] || '').length;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / DURATION, 1);
      el.textContent = before + (target * easeOut(t)).toFixed(decimals) + after;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const co = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } });
  }, { threshold: 0.6 });
  counters.forEach((el) => {
    el.dataset.final = el.textContent.trim();
    // Start at 0 (keeping the symbols) so the number is never seen before it counts
    el.textContent = el.dataset.final.replace(/[\d.,]+/, (n) => (0).toFixed((n.split(/[.,]/)[1] || '').length));
    co.observe(el);
  });
}

// ---------- 9. Icons (Google Material Symbols) appear once their font has loaded ----------
if (document.querySelector('.ms') && document.fonts) {
  document.fonts.load('24px "Material Symbols Outlined"').then(() => root.classList.add('icons-ready')).catch(() => {});
}
