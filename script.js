// ===== Pure utilities =====

function hexToRgb(hex) {
  const sanitized = hex.replace('#', '');
  const value = parseInt(sanitized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function channelLuminance(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function getContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function throttleRAF(fn) {
  let scheduled = false;
  let lastArgs = null;
  return (...args) => {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fn(...lastArgs);
    });
  };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function shouldEnableCustomCursor() {
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const isWideViewport = window.matchMedia('(min-width: 1024px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return isFinePointer && isWideViewport && !reducedMotion;
}

function initRevealOnScroll() {
  const elements = document.querySelectorAll('[data-reveal], .zone, .card');
  if (!('IntersectionObserver' in window) || elements.length === 0) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  elements.forEach((el) => observer.observe(el));
}

// ===== DOM wiring =====

const nav = document.querySelector('[data-nav]');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--solid', window.scrollY > 80);
  }, { passive: true });
}

const loader = document.querySelector('[data-loader]');
if (loader) {
  const dismissLoader = () => {
    loader.classList.add('loader--hidden');
    setTimeout(() => loader.remove(), 900);
  };
  if (prefersReducedMotion()) {
    dismissLoader();
  } else {
    window.addEventListener('load', () => setTimeout(dismissLoader, 900));
  }
}

initRevealOnScroll();

const glow = document.querySelector('[data-ambient-glow]');
if (glow && !prefersReducedMotion()) {
  const updateGlow = throttleRAF(() => {
    const scrollFraction = clamp(
      window.scrollY / (document.documentElement.scrollHeight - window.innerHeight),
      0,
      1
    );
    glow.style.setProperty('--scroll-glow-y', `${scrollFraction * 100}%`);
  });
  window.addEventListener('scroll', updateGlow, { passive: true });
}

const emailForm = document.querySelector('[data-email-form]');
const emailFeedback = document.querySelector('[data-email-feedback]');
if (emailForm && emailFeedback) {
  emailForm.addEventListener('submit', (event) => {
    const input = emailForm.querySelector('input[type="email"]');
    if (!isValidEmail(input.value)) {
      event.preventDefault();
      emailFeedback.textContent = 'Please enter a valid email address.';
      return;
    }
    emailFeedback.textContent = '';
  });
}

const previewTrack = document.querySelector('[data-preview-track]');
const previewDots = document.querySelectorAll('[data-preview-dots] .preview__dot');
if (previewTrack && previewDots.length) {
  const updateDots = throttleRAF(() => {
    const slide = previewTrack.querySelector('.preview__slide');
    const slideWidth = slide ? slide.offsetWidth + 24 : 1;
    const index = Math.min(Math.round(previewTrack.scrollLeft / slideWidth), previewDots.length - 1);
    previewDots.forEach((dot, i) => dot.classList.toggle('preview__dot--active', i === index));
  });
  previewTrack.addEventListener('scroll', updateDots, { passive: true });

  let isDragging = false, startX = 0, startScroll = 0;
  previewTrack.addEventListener('mousedown', (e) => { isDragging = true; startX = e.pageX; startScroll = previewTrack.scrollLeft; });
  window.addEventListener('mousemove', (e) => { if (!isDragging) return; previewTrack.scrollLeft = startScroll - (e.pageX - startX); });
  window.addEventListener('mouseup', () => { isDragging = false; });
}

const cursorGlow = document.querySelector('[data-cursor-glow]');
if (cursorGlow && shouldEnableCustomCursor()) {
  cursorGlow.classList.add('cursor-glow--active');
  window.addEventListener('mousemove', (event) => {
    cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  });
}
