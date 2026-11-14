// =========================================================
// Portfolio animations
// 1. Reveal on scroll   2. Header hides on scroll down
// 3. Floating contact   4. "View case" cursor on projects
// =========================================================

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Reveal: elements with class "reveal" fade up when they enter the screen
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach((el, i) => {
    // small stagger for cards that sit side by side
    el.style.transitionDelay = (el.matches('.service, .project') ? (i % 4) * 0.08 : 0) + 's';
    io.observe(el);
  });
} else {
  revealItems.forEach((el) => el.classList.add('is-in'));
}

// 2 + 3. Header hides when scrolling down; floating "Contact me" appears after the hero
const header = document.querySelector('.site-header');
const floatBtn = document.querySelector('.float-contact');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const goingDown = y > lastY;
  header.classList.toggle('is-hidden', goingDown && y > 140);
  floatBtn.classList.toggle('is-visible', y > 600 && (goingDown || y > 600));
  if (y < 600) floatBtn.classList.remove('is-visible');
  lastY = y;
}, { passive: true });

// 4. Custom cursor with label over project cards (only on devices with a mouse)
const cursor = document.querySelector('.cursor');
if (cursor && window.matchMedia('(pointer: fine)').matches) {
  const label = cursor.querySelector('span');
  let x = 0, y = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
  const loop = () => {
    cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;  // smooth follow
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    requestAnimationFrame(loop);
  };
  loop();
  document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => { label.textContent = el.dataset.cursor; cursor.classList.add('is-active'); });
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
  });
} else {
  document.querySelectorAll('.project').forEach((p) => (p.style.cursor = 'pointer'));
}
