// ===== Pure utilities (unit-tested in tests/utils.test.mjs) =====

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

export function getContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function prefersReducedMotion(matchMediaFn = (q) => window.matchMedia(q)) {
  return matchMediaFn('(prefers-reduced-motion: reduce)').matches;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function throttleRAF(fn, rafFn = (cb) => requestAnimationFrame(cb)) {
  let scheduled = false;
  let lastArgs = null;
  return (...args) => {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    rafFn(() => {
      scheduled = false;
      fn(...lastArgs);
    });
  };
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getStaggerDelay(index, baseDelayMs = 80) {
  return index * baseDelayMs;
}

export function shouldEnableCustomCursor(matchMediaFn = (q) => window.matchMedia(q)) {
  const isFinePointer = matchMediaFn('(pointer: fine)').matches;
  const isWideViewport = matchMediaFn('(min-width: 1024px)').matches;
  const reducedMotion = matchMediaFn('(prefers-reduced-motion: reduce)').matches;
  return isFinePointer && isWideViewport && !reducedMotion;
}

// ===== DOM wiring (manual verification only — see plan Task 4 Step 5) =====
if (typeof document !== 'undefined') {
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
      setTimeout(() => loader.remove(), 400);
    };
    if (prefersReducedMotion()) {
      dismissLoader();
    } else {
      window.addEventListener('load', () => setTimeout(dismissLoader, 700));
    }
  }
}
