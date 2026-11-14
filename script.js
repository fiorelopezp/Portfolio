// =========================================================
// Portfolio animations
// 1. Language switch (EN / ES)   2. Typing effect in the hero
// 3. Reveal on scroll            4. Header hides on scroll down
// 5. Floating contact button     6. "View case" cursor on projects
// =========================================================

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- 1. Language ----------
// Texts live in index.html as data-lang="en" / data-lang="es" pairs.
const titles = {
  en: 'Fiorella López Piraino · Senior Product Designer',
  es: 'Fiorella López Piraino · Senior Product Designer',
};
function setLang(lang) {
  root.lang = lang;
  document.title = titles[lang];
  document.querySelectorAll('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)));
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
    el.style.transitionDelay = (el.matches('.service, .project') ? (i % 4) * 0.08 : 0) + 's';
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
  header.classList.toggle('is-hidden', y > lastY && y > 140);
  floatBtn.classList.toggle('is-visible', y > 600);
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
