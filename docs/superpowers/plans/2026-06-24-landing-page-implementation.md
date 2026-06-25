# Mieruka Studio Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the production-ready, single-page mieruka.studio site exactly as specified in `docs/superpowers/specs/2026-06-24-landing-page-design.md`: a calm, editorial, typography-led brand page that frames the $24 workbook as "Release 01" of a software company, not an Etsy storefront — with tested design tokens, a loading animation, scroll-driven ambient lighting, a restrained custom cursor, and a multi-page-ready CSS architecture.

**Architecture:** Three static files — `index.html`, `styles.css`, `script.js` (loaded as an ES module) — plus `assets/`. All non-trivial logic (contrast-ratio math, throttling, email validation, feature-detection for the cursor) is extracted into small pure functions exported from `script.js` and unit-tested with Node's built-in test runner (`node --test`, no external dependencies). A minimal `package.json` (`{"name": "mieruka-studio", "private": true, "type": "module", "scripts": {"test": "node --test tests/"}}`) is required so Node resolves `script.js` as an ES module when the test files `import` from it — `.mjs` test-file extensions alone are not sufficient, since Node resolves the imported file's own module type independently. This `package.json` has no `build` script and no dependencies, so it does not trigger Vercel's build-detection or interfere with Netlify drag-and-drop deploy — both still serve the project as a static site. DOM wiring (scroll listeners, IntersectionObserver, cursor follower) lives in a `document`-gated block at the bottom of `script.js` and is verified manually in-browser per task, since there is no browser-test runner in scope.

**Tech Stack:** Vanilla HTML5, CSS3 (custom properties), vanilla JS (ES modules), Node.js built-in test runner (dev-only, not deployed), Google Fonts (Cormorant Garamond, Jost, Noto Serif JP).

## Global Constraints

- No build step, no bundler, no JS/CSS frameworks or libraries — only the three files (`index.html`, `styles.css`, `script.js`) plus `assets/` are deployed. A `package.json` exists at the repo root for test-runner module resolution only (`{"private": true, "type": "module", "scripts": {"test": "..."}}`, no `build` script, no dependencies) — it does not trigger Vercel build-detection and is irrelevant to Netlify drag-and-drop, which only reads the deployed folder's static files.
- `script.js` is loaded via `<script type="module" src="script.js">` so it can use `export`.
- Color tokens (exact): `--color-noir:#181614; --color-moss:#8B7B6A; --color-moss-text:#A89A87; --color-sand:#C8BA9E; --color-clouds:#EDE8DF; --color-divider:#2E2B28; --color-card:#1E1C1A;`
- Font tokens: `--font-display: 'Cormorant Garamond', serif; --font-body: 'Jost', sans-serif; --font-kanji: 'Noto Serif JP', serif;` all loaded from Google Fonts with `<link rel="preconnect">` and `font-display: swap`.
- Spacing tokens: `--space-1:4px; --space-2:8px; --space-3:16px; --space-4:24px; --space-5:40px; --space-6:64px; --space-7:96px; --space-8:160px;`
- Motion tokens: `--ease-default: cubic-bezier(0.16, 1, 0.3, 1); --duration-fade: 0.9s; --duration-hover: 0.2s; --duration-press: 0.1s;`
- Shape tokens: `--radius-sm: 2px; --radius-md: 4px;` (per approved "minimal radius" decision).
- Every animation/transition must be neutralized under `@media (prefers-reduced-motion: reduce)` (instant state, no transform/movement).
- `--color-moss` is decorative-only (icons, large display text). Any body-size text on `--color-noir` must use `--color-moss-text`, never `--color-moss`.
- "Etsy" never appears in headline, button, or bold copy — only in fine print or as the literal `href` value.
- The workbook is always referred to as "Release 01 · The Clarity System," never just "the workbook" in headings.
- No fabricated testimonials or social proof.
- The custom cursor must never hide the native OS cursor; scoped to `@media (pointer: fine) and (min-width: 1024px)`, disabled on touch and under reduced motion.
- CSS is organized in `styles.css` under comment headers in this exact order: `Tokens`, `Base`, `Layout`, `Components`, `Sections`, `Motion`, `Utilities` — this is the convention future pages must follow.
- Styling is class-based only — no ID-based CSS selectors anywhere (IDs are reserved for anchor targets like `#buy`).

---

## File Structure

```
mieruka.studio/
├── index.html
├── styles.css
├── script.js
├── package.json          (private, type: module, no build script — test-runner config only)
├── assets/
│   └── favicon.svg
├── tests/
│   └── utils.test.mjs
├── README.md
├── LICENSE
├── .gitignore
└── docs/superpowers/{specs,plans}/...   (already exists)
```

---

### Task 1: Project scaffolding, SEO/meta skeleton, README, LICENSE

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `script.js`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `README.md`
- Test: `tests/seo.test.mjs`

**Interfaces:**
- Produces: `index.html` with `<head>` meta/SEO block and empty semantic landmarks (`<nav>`, `<main>`, `<footer>`) that later tasks fill in. Produces empty `styles.css` and `script.js` (ES module) that later tasks append to.

- [ ] **Step 1: Write the failing SEO test**

```js
// tests/seo.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('has a title tag', () => {
  assert.match(html, /<title>.*Mieruka.*<\/title>/i);
});

test('has a meta description', () => {
  assert.match(html, /<meta\s+name="description"\s+content="[^"]+"/i);
});

test('has Open Graph and Twitter Card tags', () => {
  assert.match(html, /<meta\s+property="og:title"/i);
  assert.match(html, /<meta\s+property="og:description"/i);
  assert.match(html, /<meta\s+name="twitter:card"/i);
});

test('preconnects to Google Fonts', () => {
  assert.match(html, /<link[^>]+rel="preconnect"[^>]+fonts\.googleapis\.com/i);
});

test('script is loaded as an ES module', () => {
  assert.match(html, /<script[^>]+type="module"[^>]+src="script\.js"/i);
});
```

Note: the "exactly one h1" check is intentionally NOT part of this test file
yet — no section has an `<h1>` until Task 5 adds the hero headline. Task 5
appends that assertion to this same file once the h1 exists. Adding it here
would make this task's own test fail against its own deliverable.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/seo.test.mjs`
Expected: FAIL — `index.html` does not exist yet (ENOENT).

- [ ] **Step 3: Create `index.html` with the meta skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mieruka Studio — Clarity, Designed</title>
  <meta name="description" content="Mieruka is a premium clarity studio inspired by Japanese philosophy. Release 01, The Clarity System, is a 12-page interactive workbook for the quietly overwhelmed." />

  <meta property="og:title" content="Mieruka Studio — Clarity, Designed" />
  <meta property="og:description" content="A premium clarity studio inspired by Japanese philosophy. Release 01: The Clarity System." />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="/assets/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Jost:wght@300&family=Noto+Serif+JP:wght@200&display=swap" rel="stylesheet" />

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mieruka Studio",
    "url": "https://mieruka.studio",
    "description": "A premium clarity studio inspired by Japanese philosophy."
  }
  </script>

  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <div class="loader" data-loader aria-hidden="true"></div>

  <nav class="nav" data-nav></nav>

  <main id="main"></main>

  <footer class="footer"></footer>

  <script type="module" src="script.js"></script>
</body>
</html>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/seo.test.mjs`
Expected: PASS (5 tests)

- [ ] **Step 5: Create empty `styles.css` and `script.js`**

```css
/* styles.css */
/* ===== Tokens ===== */
/* ===== Base ===== */
/* ===== Layout ===== */
/* ===== Components ===== */
/* ===== Sections ===== */
/* ===== Motion ===== */
/* ===== Utilities ===== */
```

```js
// script.js
```

- [ ] **Step 6: Create `.gitignore`, `LICENSE`, `README.md`**

```
# .gitignore
.DS_Store
node_modules/
```

`LICENSE` — use the MIT License text with copyright holder "Mieruka Studio" and year 2026.

```markdown
# Mieruka Studio — Landing Page

The first public page for [mieruka.studio](https://mieruka.studio), a premium
clarity studio inspired by Japanese philosophy. Release 01 is *The Clarity
System*, a 12-page interactive workbook.

## Stack

Static HTML/CSS/vanilla JS. No framework, no bundler, no build step.
`script.js` is loaded as an ES module so it can export testable pure
functions.

## Local development

Open `index.html` directly in a browser, or serve the folder with any static
file server (e.g. `npx serve .`).

## Running tests

```bash
node --test tests/
```

Tests cover SEO/meta requirements and pure utility functions (contrast
ratio, email validation, reduced-motion/cursor feature detection). DOM-driven
behavior (scroll effects, loader, custom cursor, IntersectionObserver
reveals) is verified manually in-browser — see
`docs/superpowers/plans/2026-06-24-landing-page-implementation.md` for the
exact manual verification steps used during development.

## Design system

All design tokens (color, typography, spacing, motion) live in the `Tokens`
section at the top of `styles.css`. Future pages should reuse these tokens
unchanged and follow the same section ordering (`Tokens → Base → Layout →
Components → Sections → Motion → Utilities`) and class-only styling
convention (no ID-based CSS).

## Pre-launch checklist

- [ ] Replace the Etsy placeholder link (`https://etsy.com`) with the real listing URL.
- [ ] Replace the email capture form's placeholder `action` with a real provider endpoint.
- [ ] Replace `assets/og-image.png` placeholder with a real social preview image.
- [ ] Decide on an analytics script (Plausible recommended over GA).

## License

MIT — see `LICENSE`.
```

- [ ] **Step 7: Commit**

```bash
git add index.html styles.css script.js .gitignore LICENSE README.md tests/seo.test.mjs
git commit -m "Scaffold project: SEO meta skeleton, empty styles/script, README, LICENSE"
```

---

### Task 2: Design tokens, base styles, font loading

**Files:**
- Modify: `styles.css` (`Tokens` and `Base` sections)
- Test: none new (visual/manual)

**Interfaces:**
- Produces: all CSS custom properties listed in Global Constraints, available to every later task.

- [ ] **Step 1: Add tokens to `styles.css`**

```css
/* ===== Tokens ===== */
:root {
  --color-noir: #181614;
  --color-moss: #8B7B6A;
  --color-moss-text: #A89A87;
  --color-sand: #C8BA9E;
  --color-clouds: #EDE8DF;
  --color-divider: #2E2B28;
  --color-card: #1E1C1A;

  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Jost', sans-serif;
  --font-kanji: 'Noto Serif JP', serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 40px;
  --space-6: 64px;
  --space-7: 96px;
  --space-8: 160px;

  --ease-default: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fade: 0.9s;
  --duration-hover: 0.2s;
  --duration-press: 0.1s;

  --radius-sm: 2px;
  --radius-md: 4px;
}
```

- [ ] **Step 2: Add base reset and typography defaults**

```css
/* ===== Base ===== */
*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--color-noir);
  color: var(--color-moss-text);
  font-family: var(--font-body), system-ui, sans-serif;
  font-weight: 300;
  line-height: 1.6;
}

h1, h2, h3 {
  font-family: var(--font-display), Georgia, serif;
  font-weight: 300;
  color: var(--color-clouds);
  margin: 0;
}

.skip-link {
  position: absolute;
  left: -999px;
  top: 0;
  background: var(--color-sand);
  color: var(--color-noir);
  padding: var(--space-2) var(--space-3);
  z-index: 1000;
}

.skip-link:focus {
  left: var(--space-2);
  top: var(--space-2);
}

a:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--color-sand);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 3: Manually verify**

Open `index.html` in a browser. Confirm: dark background, no console errors, Tab key moves focus to the skip link first with a visible Sand-colored focus box.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "Add design tokens and base styles"
```

---

### Task 3: JS utilities module (tested pure functions)

**Files:**
- Modify: `script.js` (add exported pure functions above the DOM-wiring section)
- Test: `tests/utils.test.mjs`

**Interfaces:**
- Produces: `getContrastRatio(hex1, hex2): number`, `prefersReducedMotion(matchMediaFn?): boolean`, `clamp(value, min, max): number`, `throttleRAF(fn): Function`, `isValidEmail(value): boolean`, `getStaggerDelay(index, baseDelayMs?): number`, `shouldEnableCustomCursor(matchMediaFn?): boolean` — all named exports from `script.js`, consumed by Tasks 4–9.

- [ ] **Step 1: Write the failing tests**

```js
// tests/utils.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getContrastRatio,
  prefersReducedMotion,
  clamp,
  throttleRAF,
  isValidEmail,
  getStaggerDelay,
  shouldEnableCustomCursor,
} from '../script.js';

test('getContrastRatio: moss-text on noir meets WCAG AA (>=4.5)', () => {
  assert.ok(getContrastRatio('#A89A87', '#181614') >= 4.5);
});

test('getContrastRatio: clouds on noir meets WCAG AA (>=4.5)', () => {
  assert.ok(getContrastRatio('#EDE8DF', '#181614') >= 4.5);
});

test('getContrastRatio: decorative moss on noir fails AA (<4.5, confirming it is decorative-only)', () => {
  assert.ok(getContrastRatio('#8B7B6A', '#181614') < 4.5);
});

test('clamp: clamps below min', () => {
  assert.equal(clamp(-10, 0, 100), 0);
});

test('clamp: clamps above max', () => {
  assert.equal(clamp(150, 0, 100), 100);
});

test('clamp: passes through in-range values', () => {
  assert.equal(clamp(42, 0, 100), 42);
});

test('isValidEmail: accepts a normal address', () => {
  assert.equal(isValidEmail('hello@mieruka.studio'), true);
});

test('isValidEmail: rejects missing @', () => {
  assert.equal(isValidEmail('hello.mieruka.studio'), false);
});

test('isValidEmail: rejects missing domain', () => {
  assert.equal(isValidEmail('hello@'), false);
});

test('getStaggerDelay: increases linearly by index', () => {
  assert.equal(getStaggerDelay(0), 0);
  assert.equal(getStaggerDelay(2), 160);
  assert.equal(getStaggerDelay(2, 50), 100);
});

test('prefersReducedMotion: true when media query matches', () => {
  const fakeMatchMedia = () => ({ matches: true });
  assert.equal(prefersReducedMotion(fakeMatchMedia), true);
});

test('prefersReducedMotion: false when media query does not match', () => {
  const fakeMatchMedia = () => ({ matches: false });
  assert.equal(prefersReducedMotion(fakeMatchMedia), false);
});

test('throttleRAF: only invokes once per animation frame', () => {
  let rafCallback;
  const fakeRaf = (cb) => { rafCallback = cb; return 1; };
  const calls = [];
  const throttled = throttleRAF((value) => calls.push(value), fakeRaf);
  throttled('a');
  throttled('b');
  throttled('c');
  assert.equal(calls.length, 0, 'should not call synchronously');
  rafCallback();
  assert.deepEqual(calls, ['c'], 'should call once with the latest args');
});

test('shouldEnableCustomCursor: true on desktop fine-pointer without reduced motion', () => {
  const fakeMatchMedia = (query) => ({
    matches: query === '(pointer: fine)' || query === '(min-width: 1024px)',
  });
  assert.equal(shouldEnableCustomCursor(fakeMatchMedia), true);
});

test('shouldEnableCustomCursor: false on touch devices', () => {
  const fakeMatchMedia = (query) => ({
    matches: query === '(min-width: 1024px)',
  });
  assert.equal(shouldEnableCustomCursor(fakeMatchMedia), false);
});

test('shouldEnableCustomCursor: false under reduced motion', () => {
  const fakeMatchMedia = (query) => ({
    matches: query !== '(prefers-reduced-motion: reduce)' ? true : true,
  });
  assert.equal(shouldEnableCustomCursor(fakeMatchMedia), false);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/utils.test.mjs`
Expected: FAIL — none of the named exports exist in `script.js` yet.

- [ ] **Step 3: Implement the utilities in `script.js`**

```js
// script.js

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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/utils.test.mjs`
Expected: PASS (16 tests)

- [ ] **Step 5: Commit**

```bash
git add script.js tests/utils.test.mjs
git commit -m "Add tested pure utility functions: contrast ratio, throttleRAF, email validation, cursor/motion feature detection"
```

---

### Task 4: Nav, skip link wiring, and loading animation

**Files:**
- Modify: `index.html` (`<nav>` content)
- Modify: `styles.css` (`Components`, `Sections`, `Motion`)
- Modify: `script.js` (DOM-wiring section)

**Interfaces:**
- Consumes: `prefersReducedMotion()` from Task 3.
- Produces: `.nav--solid` class toggling on scroll (consumed visually only); loader removes itself from the DOM after animating — no later task depends on its internals.

- [ ] **Step 1: Add nav markup to `index.html`**

```html
<nav class="nav" data-nav>
  <span class="nav__logo">MIERUKA <span class="nav__kanji">見える化</span></span>
  <a class="nav__link" href="#buy">The Workbook →</a>
</nav>
```

- [ ] **Step 2: Style the nav and loader in `styles.css`**

```css
/* ===== Components ===== */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background var(--duration-hover) var(--ease-default),
              border-color var(--duration-hover) var(--ease-default);
}

.nav--solid {
  background: var(--color-noir);
  border-bottom-color: var(--color-divider);
}

.nav__logo {
  font-family: var(--font-display);
  color: var(--color-sand);
  letter-spacing: 0.05em;
}

.nav__kanji {
  font-family: var(--font-kanji);
}

.nav__link {
  color: var(--color-clouds);
  text-decoration: none;
  font-family: var(--font-body);
  font-size: 14px;
}

.nav__link:hover {
  color: var(--color-sand);
}

/* ===== Motion ===== */
.loader {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-noir);
  font-family: var(--font-kanji);
  font-size: 96px;
  color: var(--color-sand);
  opacity: 1;
  transition: opacity 0.4s var(--ease-default);
}

.loader__mark {
  opacity: 0;
  transform: scale(0.85);
  animation: loader-reveal 0.7s var(--ease-default) forwards;
}

.loader--hidden {
  opacity: 0;
  pointer-events: none;
}

@keyframes loader-reveal {
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .loader { display: none; }
  .loader__mark { animation: none; opacity: 1; transform: none; }
}
```

- [ ] **Step 3: Add the loader's kanji mark to `index.html`**

```html
<div class="loader" data-loader aria-hidden="true">
  <span class="loader__mark">見</span>
</div>
```

- [ ] **Step 4: Wire nav scroll-solidify and loader dismissal in `script.js`**

```js
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
```

- [ ] **Step 5: Manually verify in-browser**

Open `index.html`. Confirm: loader shows the kanji 見 fading/scaling in, then the whole overlay fades out after ~0.7s revealing the page underneath. Scroll down past 80px — nav background becomes solid Noir with a visible bottom divider; scroll back up — it returns to transparent. In Chrome DevTools, set Rendering → "Emulate CSS prefers-reduced-motion: reduce", reload — loader should not render at all (instant content).

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css script.js
git commit -m "Add nav scroll-solidify behavior and loading animation"
```

---

### Task 5: Hero section

**Files:**
- Modify: `index.html` (`<main>` — hero markup)
- Modify: `styles.css` (`Sections`, `Components`)

**Interfaces:**
- Consumes: `.btn`, `.btn--primary` classes defined in this task, reused by Tasks 6–9.

- [ ] **Step 1: Add hero markup inside `<main>`**

```html
<main id="main">
  <section class="hero">
    <span class="watermark watermark--hero" aria-hidden="true">見</span>
    <div class="hero__content">
      <h1 class="hero__headline"><em>Clarity is not found.<br />It is designed.</em></h1>
      <p class="hero__subtext">
        A 12-page interactive workbook built on Japanese philosophy.
        For those who are overwhelmed by everything and clear about nothing.
      </p>
      <a class="btn btn--primary" href="#buy">Begin the practice →</a>
    </div>
  </section>
</main>
```

- [ ] **Step 2: Style hero and the shared button component**

```css
/* ===== Sections ===== */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: var(--space-5);
}

.watermark {
  position: absolute;
  font-family: var(--font-kanji);
  color: var(--color-sand);
  opacity: 0.04;
  pointer-events: none;
  user-select: none;
}

.watermark--hero {
  font-size: 600px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hero__content {
  position: relative;
  max-width: 640px;
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  animation: hero-rise var(--duration-fade) var(--ease-default) forwards;
  animation-delay: 0.9s;
}

.hero__headline {
  font-size: 72px;
  font-style: italic;
  line-height: 1.15;
}

.hero__subtext {
  margin-top: var(--space-4);
  color: var(--color-moss-text);
  font-size: 16px;
}

@keyframes hero-rise {
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .hero__content { animation: none; opacity: 1; transform: none; }
}

@media (max-width: 768px) {
  .hero__headline { font-size: 40px; }
  .watermark--hero { font-size: 320px; }
}

/* ===== Components ===== */
.btn {
  display: inline-block;
  margin-top: var(--space-5);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: transform var(--duration-hover) var(--ease-default),
              background var(--duration-hover) var(--ease-default);
}

.btn--primary {
  background: var(--color-sand);
  color: var(--color-noir);
}

.btn--primary:hover {
  background: #d4c7ad;
  transform: scale(1.02);
}

.btn--primary:active {
  transform: scale(0.97);
  transition-duration: var(--duration-press);
}

@media (prefers-reduced-motion: reduce) {
  .btn--primary:hover,
  .btn--primary:active { transform: none; }
}
```

- [ ] **Step 3: Append the deferred h1 test to `tests/seo.test.mjs`**

Task 1 deliberately left this assertion out because no `<h1>` existed yet.
This task's hero markup adds the page's only `<h1>`, so the check belongs
here. Append to the end of `tests/seo.test.mjs`:

```js
test('has exactly one h1', () => {
  const matches = html.match(/<h1[\s>]/gi) || [];
  assert.equal(matches.length, 1);
});
```

- [ ] **Step 4: Run the full SEO test file to verify it passes**

Run: `node --test tests/seo.test.mjs`
Expected: PASS (6 tests)

- [ ] **Step 5: Manually verify in-browser**

Reload `index.html`. Confirm: hero fills the viewport, faint 見 watermark is centered behind the text, headline/subtext fade+rise in shortly after the loader clears, "Begin the practice →" button scrolls to the (currently empty) `#buy` anchor, button visibly lightens and scales up slightly on hover and presses down on click. Resize to a mobile width (<768px) — headline shrinks to 40px.

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css tests/seo.test.mjs
git commit -m "Add hero section with kanji watermark, fade-rise animation, and shared button component"
```

---

### Task 6: Philosophy strip and Product (#product) section

**Files:**
- Modify: `index.html`
- Modify: `styles.css` (`Sections`, `Components`)
- Modify: `script.js` (reveal-on-scroll wiring, first use)

**Interfaces:**
- Consumes: `getStaggerDelay(index)` from Task 3.
- Produces: `initRevealOnScroll()` function in `script.js`, reused by Tasks 7 and 8 via the shared `[data-reveal]` attribute convention.

- [ ] **Step 1: Add philosophy strip and product markup**

```html
<section class="philosophy">
  <ul class="philosophy__list">
    <li class="philosophy-item"><span class="philosophy-item__kanji">見える化</span><span class="philosophy-item__romaji">Mieruka</span><span class="philosophy-item__meaning">Visibility</span></li>
    <li class="philosophy-item"><span class="philosophy-item__kanji">侘寂</span><span class="philosophy-item__romaji">Wabi-sabi</span><span class="philosophy-item__meaning">Impermanence</span></li>
    <li class="philosophy-item"><span class="philosophy-item__kanji">生き甲斐</span><span class="philosophy-item__romaji">Ikigai</span><span class="philosophy-item__meaning">Purpose</span></li>
    <li class="philosophy-item"><span class="philosophy-item__kanji">間</span><span class="philosophy-item__romaji">Ma</span><span class="philosophy-item__meaning">Space</span></li>
    <li class="philosophy-item"><span class="philosophy-item__kanji">簡素</span><span class="philosophy-item__romaji">Kanso</span><span class="philosophy-item__meaning">Simplicity</span></li>
  </ul>
</section>

<section class="product" id="product">
  <div class="product__grid" data-reveal>
    <div class="product__copy">
      <p class="product__label">Release 01 · The Clarity System</p>
      <h2>One workbook. Four zones.<br />Total clarity.</h2>
      <p>Most people don't lack ambition. They lack a system to see themselves
      clearly. Mieruka is a 12-page interactive digital workbook — built on
      the Japanese principle of making the invisible visible. You open it in
      your browser. You fill it in. Your life becomes legible.</p>
    </div>
    <div class="product__mockup" aria-hidden="true"></div>
  </div>
  <div class="product__zones">
    <div class="zone" data-reveal style="--delay: 0ms"><span class="zone__label">Zone 01</span><span class="zone__name">Where You Are</span><p>Current reality check</p></div>
    <div class="zone" data-reveal style="--delay: 80ms"><span class="zone__label">Zone 02</span><span class="zone__name">Where You're Going</span><p>Vision + values</p></div>
    <div class="zone" data-reveal style="--delay: 160ms"><span class="zone__label">Zone 03</span><span class="zone__name">How You Decide</span><p>Decision filters</p></div>
    <div class="zone" data-reveal style="--delay: 240ms"><span class="zone__label">Zone 04</span><span class="zone__name">How You Operate</span><p>Rituals + weekly system</p></div>
  </div>
</section>
```

- [ ] **Step 2: Style both sections**

```css
/* ===== Sections ===== */
.philosophy__list {
  display: flex;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  padding: var(--space-6) var(--space-5);
  border-top: 1px solid var(--color-sand);
  border-bottom: 1px solid var(--color-divider);
  overflow-x: auto;
  gap: var(--space-4);
}

/* ===== Components ===== */
.philosophy-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 var(--space-4);
  border-right: 1px solid var(--color-divider);
  flex: 1 0 auto;
}

.philosophy-item:last-child { border-right: none; }

.philosophy-item__kanji {
  font-family: var(--font-kanji);
  font-size: 32px;
  color: var(--color-sand);
}

.philosophy-item__romaji {
  font-family: var(--font-body);
  font-size: 14px;
  margin-top: var(--space-2);
}

.philosophy-item__meaning {
  font-size: 12px;
  color: var(--color-divider);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: var(--space-1);
}

/* ===== Sections (product) ===== */
.product {
  padding: var(--space-8) var(--space-5);
}

.product__grid {
  display: grid;
  grid-template-columns: 55% 45%;
  gap: var(--space-6);
  max-width: 1100px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--duration-fade) var(--ease-default),
              transform var(--duration-fade) var(--ease-default);
}

.product__grid.is-visible { opacity: 1; transform: translateY(0); }

.product__label {
  color: var(--color-sand);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product__mockup {
  background: var(--color-card);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
  min-height: 320px;
}

.product__zones {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  max-width: 1100px;
  margin: var(--space-6) auto 0;
}

.zone {
  padding: var(--space-4);
  border-top: 2px solid var(--color-sand);
  background: var(--color-card);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--duration-fade) var(--ease-default) var(--delay, 0ms),
              transform var(--duration-fade) var(--ease-default) var(--delay, 0ms);
}

.zone.is-visible { opacity: 1; transform: translateY(0); }

.zone__label { color: var(--color-sand); font-size: 12px; display: block; }
.zone__name { color: var(--color-clouds); font-family: var(--font-display); font-size: 20px; display: block; margin-top: var(--space-1); }

@media (max-width: 768px) {
  .product__grid, .product__zones { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Implement `initRevealOnScroll` in `script.js`**

```js
export function initRevealOnScroll(root = document) {
  const elements = root.querySelectorAll('[data-reveal], .zone');
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
```

Add the call inside the existing `if (typeof document !== 'undefined')` block, after the nav/loader wiring:

```js
  initRevealOnScroll();
```

- [ ] **Step 4: Manually verify in-browser**

Reload and scroll to the philosophy strip — confirm 5 kanji/romaji/meaning columns with dividers between them (horizontal scroll if you narrow the window below ~700px). Continue scrolling to `#product` — confirm the two-column layout fades+rises in once it enters the viewport, followed by the 4 zone cards rising in with a visible stagger (each ~80ms after the previous). Confirm columns collapse to one on mobile width.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css script.js
git commit -m "Add philosophy strip, Release 01 product section, and shared reveal-on-scroll utility"
```

---

### Task 7: Features and "Who it's for" (#for) sections

**Files:**
- Modify: `index.html`
- Modify: `styles.css` (`Sections`, `Components`)

**Interfaces:**
- Consumes: `.card`, `[data-reveal]`/`initRevealOnScroll()` from Task 6.

- [ ] **Step 1: Add markup**

```html
<section class="features">
  <div class="features__grid">
    <div class="card" data-reveal style="--delay: 0ms"><span class="card__icon">🌸</span><h3>Interactive Life Wheel</h3><p>Rate 8 areas of your life visually.</p></div>
    <div class="card" data-reveal style="--delay: 80ms"><span class="card__icon">🎋</span><h3>Bonsai Dashboard</h3><p>Your weekly plan grows like a bonsai as you fill it.</p></div>
    <div class="card" data-reveal style="--delay: 160ms"><span class="card__icon card__icon--kanji">書</span><h3>Kanji per page</h3><p>Each page anchored to a Japanese philosophy concept.</p></div>
    <div class="card" data-reveal style="--delay: 240ms"><span class="card__icon">✦</span><h3>PDF Export</h3><p>Print your clarity, keep it forever.</p></div>
  </div>
</section>

<section class="for">
  <h2>Made for the quietly overwhelmed.</h2>
  <div class="for__personas">
    <p>"You have goals. You're just not sure which ones are yours."</p>
    <p>"You're productive. But you don't feel like you're going anywhere."</p>
    <p>"You want stillness. You just don't know where to start."</p>
  </div>
</section>
```

- [ ] **Step 2: Style both sections**

```css
/* ===== Sections ===== */
.features { padding: var(--space-8) var(--space-5); }

.features__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
}

.for {
  background: var(--color-clouds);
  color: var(--color-noir);
  text-align: center;
  padding: var(--space-8) var(--space-5);
}

.for h2 { color: var(--color-noir); }

.for__personas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
  max-width: 1000px;
  margin: var(--space-6) auto 0;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 20px;
}

@media (max-width: 768px) {
  .features__grid, .for__personas { grid-template-columns: 1fr; }
}

/* ===== Components ===== */
.card {
  background: var(--color-card);
  border: 1px solid var(--color-divider);
  border-top: 2px solid var(--color-sand);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--duration-fade) var(--ease-default) var(--delay, 0ms),
              transform var(--duration-fade) var(--ease-default) var(--delay, 0ms);
}

.card.is-visible { opacity: 1; transform: translateY(0); }

.card__icon { font-size: 28px; display: block; margin-bottom: var(--space-2); }
.card__icon--kanji { font-family: var(--font-kanji); }
.card h3 { font-size: 18px; margin-bottom: var(--space-1); }
.card p { font-size: 14px; color: var(--color-moss-text); margin: 0; }
```

- [ ] **Step 3: Update `initRevealOnScroll` selector to include `.card`**

In `script.js`, change the selector in `initRevealOnScroll` from:

```js
const elements = root.querySelectorAll('[data-reveal], .zone');
```

to:

```js
const elements = root.querySelectorAll('[data-reveal], .zone, .card');
```

- [ ] **Step 4: Manually verify in-browser**

Scroll to the features section — confirm 4 cards stagger-fade in, collapsing to a single column on mobile. Scroll to "Who it's for" — confirm the light Soft-Clouds background with dark text and 3 italic persona lines, also collapsing to one column on mobile.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css script.js
git commit -m "Add features grid and who-it's-for persona section"
```

---

### Task 8: Buy (#buy) section with ambient scroll-driven lighting

**Files:**
- Modify: `index.html`
- Modify: `styles.css` (`Sections`, `Motion`)
- Modify: `script.js` (ambient glow wiring)

**Interfaces:**
- Consumes: `throttleRAF(fn)` and `clamp(value, min, max)` and `prefersReducedMotion()` from Task 3.
- Produces: `.ambient-glow` element whose `--scroll-glow-y` custom property is updated on scroll; no later task depends on this beyond visual layering.

- [ ] **Step 1: Add the glow layer and buy markup to `index.html`**

```html
<div class="ambient-glow" data-ambient-glow aria-hidden="true"></div>

<section class="buy" id="buy">
  <span class="watermark watermark--buy" aria-hidden="true">律</span>
  <p class="buy__label">Release 01 · The Clarity System</p>
  <p class="buy__price">$24</p>
  <p class="buy__description">12-page interactive HTML workbook. Opens in any browser. No app needed. Instant download.</p>
  <a class="btn btn--primary" href="https://etsy.com">Get instant access →</a>
  <p class="buy__fine-print">Secure checkout via Etsy · Instant download · Works on Mac, Windows, iOS</p>
</section>
```

- [ ] **Step 2: Style the glow layer and buy section**

```css
/* ===== Motion ===== */
.ambient-glow {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% var(--scroll-glow-y, 50%),
    rgba(200, 186, 158, 0.06),
    transparent 60%
  );
}

@media (prefers-reduced-motion: reduce) {
  .ambient-glow { background: radial-gradient(circle at 50% 50%, rgba(200, 186, 158, 0.06), transparent 60%); }
}

/* ===== Sections ===== */
.buy {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: var(--space-8) var(--space-5);
  overflow: hidden;
}

.watermark--buy {
  font-size: 480px;
  opacity: 0.05;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.buy__label {
  color: var(--color-sand);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.buy__price {
  font-family: var(--font-display);
  font-size: 56px;
  color: var(--color-clouds);
  margin: var(--space-3) 0;
}

.buy__fine-print {
  margin-top: var(--space-3);
  font-size: 13px;
  color: var(--color-moss-text);
}
```

- [ ] **Step 3: Wire the scroll-driven glow in `script.js`**

```js
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
```

- [ ] **Step 4: Manually verify in-browser**

Scroll to `#buy` — confirm price/description/CTA centered, faint 律 watermark behind it, "Etsy" appears only in the small fine-print line (not in the button or headline). Scroll the whole page slowly from top to bottom — confirm the background glow's vertical position drifts subtly (open DevTools Performance tab, record a scroll, confirm no long frames / layout thrashing — only `background-position`-driving custom property and composited paint). Enable "Emulate prefers-reduced-motion: reduce" and reload — confirm the glow is present but static (does not move on scroll).

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css script.js
git commit -m "Add buy section and scroll-driven ambient lighting effect"
```

---

### Task 9: Future (#future) email capture and custom cursor follower

**Files:**
- Modify: `index.html`
- Modify: `styles.css` (`Sections`, `Components`, `Motion`)
- Modify: `script.js` (form validation wiring, cursor follower wiring)

**Interfaces:**
- Consumes: `isValidEmail(value)` and `shouldEnableCustomCursor()` from Task 3.

- [ ] **Step 1: Add markup**

```html
<section class="future" id="future">
  <h2>Mieruka is just getting started.</h2>
  <p>Be first to know what we build next.</p>
  <form class="future__form" data-email-form action="https://placeholder-email-provider.example/subscribe" method="post">
    <label class="visually-hidden" for="email">Email address</label>
    <input class="future__input" id="email" name="email" type="email" placeholder="you@example.com" required />
    <button class="btn btn--primary" type="submit">Notify me</button>
  </form>
  <p class="future__feedback" data-email-feedback role="status"></p>
</section>

<div class="cursor-glow" data-cursor-glow aria-hidden="true"></div>
```

- [ ] **Step 2: Style the section, form, and cursor follower**

```css
/* ===== Sections ===== */
.future {
  text-align: center;
  padding: var(--space-7) var(--space-5);
}

.future__form {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  margin-top: var(--space-4);
  flex-wrap: wrap;
}

.future__input {
  background: var(--color-card);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  color: var(--color-clouds);
  font-family: var(--font-body);
  min-width: 260px;
}

.future__feedback {
  margin-top: var(--space-2);
  font-size: 13px;
  color: var(--color-sand);
  min-height: 1.2em;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

/* ===== Motion ===== */
.cursor-glow {
  position: fixed;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-sand);
  opacity: 0.15;
  filter: blur(8px);
  pointer-events: none;
  z-index: 999;
  transform: translate(-50%, -50%);
  transition: transform 0.12s linear;
  display: none;
}

.cursor-glow--active { display: block; }
```

- [ ] **Step 3: Wire form validation and cursor follower in `script.js`**

```js
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

  const cursorGlow = document.querySelector('[data-cursor-glow]');
  if (cursorGlow && shouldEnableCustomCursor()) {
    cursorGlow.classList.add('cursor-glow--active');
    window.addEventListener('mousemove', (event) => {
      cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
    });
  }
```

- [ ] **Step 4: Manually verify in-browser**

On a desktop-sized window, confirm a soft Sand glow dot trails your real cursor (which stays fully visible) anywhere on the page. Narrow the window below 1024px — confirm the glow disappears. In DevTools device toolbar, switch to a touch device emulation — confirm the glow does not appear. Enable "Emulate prefers-reduced-motion: reduce" — confirm the glow does not appear. In the `#future` form, submit an invalid value like `notanemail` — confirm the feedback text appears and the form does not navigate away; submit a valid email — confirm no error text and the browser attempts to POST to the placeholder action (network tab shows a failed/pending request to the placeholder URL, which is expected pre-launch).

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css script.js
git commit -m "Add future email capture section and restrained custom cursor follower"
```

---

### Task 10: Footer, favicon, final integration pass

**Files:**
- Modify: `index.html` (`<footer>`)
- Modify: `styles.css` (`Sections`)
- Create: `assets/favicon.svg`
- Test: re-run full suite

**Interfaces:**
- None produced for later tasks — this is the final task.

- [ ] **Step 1: Add footer markup**

```html
<footer class="footer">
  <span class="footer__logo">MIERUKA <span class="nav__kanji">見える化</span></span>
  <p class="footer__tagline">Make the invisible visible.</p>
  <p class="footer__detail">Built with Japanese philosophy.</p>
  <p class="footer__copyright">© 2026 Mieruka Studio · All rights reserved</p>
</footer>
```

- [ ] **Step 2: Style the footer**

```css
/* ===== Sections ===== */
.footer {
  text-align: center;
  padding: var(--space-7) var(--space-5);
  border-top: 1px solid var(--color-divider);
}

.footer__logo {
  font-family: var(--font-display);
  color: var(--color-sand);
}

.footer__tagline {
  margin-top: var(--space-2);
  font-style: italic;
  color: var(--color-moss-text);
}

.footer__detail {
  margin-top: var(--space-2);
  font-size: 12px;
  color: var(--color-sand);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.footer__copyright {
  margin-top: var(--space-4);
  font-size: 12px;
  color: var(--color-divider);
}
```

- [ ] **Step 3: Create `assets/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#181614" />
  <text x="32" y="44" font-size="40" text-anchor="middle" fill="#C8BA9E" font-family="serif">見</text>
</svg>
```

- [ ] **Step 4: Run the full test suite**

Run: `node --test tests/`
Expected: PASS — all SEO and utility tests green (the `<h1>` count is still exactly one, since the footer/nav use `<span>`/`<p>`, not headings).

- [ ] **Step 5: Full manual end-to-end pass**

Open `index.html` in a fresh browser tab and scroll top to bottom once normally, then again with DevTools "Emulate prefers-reduced-motion: reduce" enabled. Confirm: every section appears in order (Nav, Hero, Philosophy, Product, Features, Who it's for, Buy, Future, Footer), no console errors, no layout shift/jank during scroll, footer shows the "Built with Japanese philosophy" line and is not the only place referencing 2026 copyright.

Run a Lighthouse audit (Chrome DevTools → Lighthouse → Mobile, all 4 categories). Confirm Performance, Accessibility, Best Practices, and SEO all score 95+. If any score is below 95, note the specific failing audit and fix it before final commit (common culprits at this stage: missing `lang` attribute — already set on `<html>`; image alt text — none used; color contrast — already verified via Task 3's tests).

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css assets/favicon.svg
git commit -m "Add footer with brand detail line and favicon; complete v1 landing page"
```

---

## Self-Review Notes

- **Spec coverage:** all 8 original sections (Nav, Hero, Philosophy, Product, Features, Who it's for, Buy, Footer) plus the round-2 additions (loader, ambient glow, custom cursor, tactile buttons, Future/email capture, footer brand detail, tested tokens, multi-page-ready CSS structure) each map to a task above.
- **Placeholder scan:** the only placeholders are the Etsy URL and the email-form `action`, both explicitly called for in the spec's "Open items for before public launch" list and documented in the README pre-launch checklist — not unresolved plan gaps.
- **Type/name consistency:** `initRevealOnScroll`, `throttleRAF`, `clamp`, `isValidEmail`, `getStaggerDelay`, `prefersReducedMotion`, `shouldEnableCustomCursor`, `getContrastRatio` are each defined once (Task 3 or Task 6) and referenced by the same name in every later task.
