# Mieruka Studio — Landing Page Design Spec

**Date:** 2026-06-24
**Status:** Approved, pending implementation

## Purpose

The first public page for Mieruka Studio (mieruka.studio). It must read as the
beginning of a premium software/clarity company — not a single-product Etsy
storefront — while introducing and selling the studio's first release, the
Clarity System workbook ($24, fulfilled via Etsy).

Emotional references: Apple, Linear, Notion, Raycast, Arc, Stripe, Vercel,
Muji, Aesop, Kinfolk. Calm, editorial, typography-led, generous negative space
(ma). Never trendy or flashy.

## Strategic decisions (from review)

- **Frame the workbook as "Release 01," not the whole catalog.** Signals an
  ongoing body of work rather than a single SKU.
- **Add a soft secondary action** (#future email capture) so visitors not
  ready to buy still have a low-friction way to stay connected. This is the
  clearest "beginning of something" signal on the page.
- **No fabricated testimonial.** Removed from original brief — fake social
  proof undermines a premium-brand read. Replace with real proof later, or
  leave the space as negative space.
- **De-emphasize "Etsy" in prominent copy.** Etsy remains the real fulfillment
  link, but the word only appears in small print, not in headlines or button
  labels — avoids a marketplace association.
- **Restrained kanji use.** One watermark in hero, one in philosophy strip,
  none in buy section — kanji must anchor meaning (philosophy strip), not
  decorate indiscriminately.
- **Nav CTA is a plain text link**, not a filled button — reserves the
  filled-button treatment for hero/buy primary actions only.

## Sitemap

Single page, anchor navigation only:

```
/ (index.html)
├── Nav
├── #hero
├── #philosophy
├── #product   ("What is this" — Release 01, 4 zones)
├── #features  (4 feature cards)
├── #for       ("Who it's for")
├── #buy       (Release 01 · Clarity System purchase)
├── #future    (email capture)
└── Footer
```

## Wireframes (see conversation for full ASCII detail)

- **Nav:** logo left ("MIERUKA · 見える化"), single text link right ("The
  Workbook →"). Transparent over hero, solid `--color-noir` + bottom divider
  after ~80px scroll.
- **Hero:** full viewport height, centered column (max-width ~640px). Kanji
  見 watermark (opacity 0.04, ~600px, centered, `aria-hidden`). H1 "Clarity is
  not found. / It is designed." (Cormorant Garamond Light Italic, ~72px
  desktop / 40px mobile). Subtext in Jost Light. Primary CTA "Begin the
  practice →" → `#buy`. Fade + rise on load (0.8s).
- **Philosophy strip:** 5 items (見える化/Mieruka/Visibility,
  侘寂/Wabi-sabi/Impermanence, 生き甲斐/Ikigai/Purpose, 間/Ma/Space,
  簡素/Kanso/Simplicity). Horizontal row desktop, scroll-snap mobile. Sand top
  border, dividers between items.
- **#product:** "Release 01 · The Clarity System" label, headline "One
  workbook. Four zones. Total clarity.", two-column layout (text 55% / dark
  mockup-hint card 45%) collapsing to one column on mobile, 2×2 zone grid
  below (Zone 01–04).
- **#features:** 4 equal cards (🌸 Life Wheel, 🎋 Bonsai Dashboard, 書
  Kanji-per-page, ✦ PDF Export), `--color-card` background, Sand top border,
  staggered fade-in on scroll.
- **#for:** light section (`--color-clouds` bg, dark text), headline "Made
  for the quietly overwhelmed.", 3 persona lines, no icons.
- **#buy:** dark, centered, kanji 律 watermark (opacity 0.05, `aria-hidden`).
  "Release 01 · The Clarity System" label, price $24, description, primary
  CTA "Get instant access →" (links to Etsy placeholder), fine print "Secure
  checkout · Instant download · Mac/Win/iOS" (Etsy named here only, in fine
  print or href, not in visible button/heading copy).
- **#future:** quiet section, "Mieruka is just getting started. / Be first to
  know what we build next." + email input + submit button. Posts to a
  clearly-marked placeholder form action (same pattern as the Etsy
  placeholder link) — needs a real provider (e.g. Buttondown, Formspree)
  wired up before launch.
- **Footer:** centered logo, tagline "Make the invisible visible.", small
  copyright line. Minimal, dark.

## Design System

### Color tokens
```css
--color-noir: #181614;       /* page background */
--color-moss: #8B7B6A;       /* decorative / large text / icons only */
--color-moss-text: #A89A87;  /* body-size text on noir, ~4.6:1 contrast (AA) */
--color-sand: #C8BA9E;       /* highlight / primary CTA fill */
--color-clouds: #EDE8DF;     /* light section bg + text-on-light */
--color-divider: #2E2B28;
--color-card: #1E1C1A;
```
`--color-moss` is decorative-only (icons, large display text); any body-size
text on `--color-noir` must use `--color-moss-text` to meet WCAG AA contrast.

### Typography
| Token | Font | Weight | Usage |
|---|---|---|---|
| `--font-display` | Cormorant Garamond | 300 | H1 (italic in hero), 72px / 40px mobile |
| `--font-display-2` | Cormorant Garamond | 300 | H2, 40px / 28px mobile |
| `--font-body` | Jost | 300 | Body copy, 16px / 15px mobile |
| `--font-kanji` | Noto Serif JP | 200 | Decorative kanji only |

Loaded from Google Fonts with `<link rel="preconnect">` and `font-display:
swap`; system-font fallback stack while loading.

### Spacing
Scale: `--space-1: 4px` … `--space-8: 160px` (4/8/16/24/40/64/96/160).
Section vertical padding defaults to `--space-8` desktop, `--space-6` (96px)
mobile.

### Motion
```css
--ease-default: cubic-bezier(0.16, 1, 0.3, 1);
--duration-fade: 0.9s;
--duration-hover: 0.2s;
```
One easing curve reused everywhere (no novelty per-section easing). Scroll
reveals: opacity 0→1, translateY 20px→0, staggered via `--delay` custom
property on children. Wrapped in `@media (prefers-reduced-motion: reduce)` →
instant, no transform. Nav background transition uses `--duration-hover`.
Button hover: Sand fill lightens slightly + `scale(1.02)`.

### Shape
Cards and buttons: 2–4px border-radius (not sharp, not heavily rounded —
closer to the Linear/Stripe software reference than the sharper
Muji/Aesop editorial reference). 1px solid `--color-divider` card borders,
2px `--color-sand` top accent border on cards.

## Component System

Vanilla CSS/JS, no framework. Components as CSS classes + small JS modules:

- **Nav** — scroll listener toggles `.nav--solid`.
- **RevealOnScroll** — one shared `IntersectionObserver`, applies
  `.is-visible` to any `[data-reveal]` element; staggered children via
  `--delay`.
- **Button** — `.btn` (plain text, nav), `.btn--primary` (filled Sand, hero +
  buy CTAs), `.btn--ghost` (if needed for secondary actions).
- **Card** — `.card` base, used by feature cards and product mockup card.
- **PhilosophyItem** — `.philosophy-item` (kanji + romaji + meaning column).
- **EmailCapture** — form, client-side validation only, placeholder `action`
  URL clearly marked for swap-in before launch.
- **KanjiWatermark** — `.watermark`, absolutely positioned, `aria-hidden="true"`.

## Folder Architecture

```
mieruka.studio/
├── index.html
├── styles.css
├── script.js
├── assets/
│   ├── favicon.svg
│   └── og-image.png        (placeholder — replace before launch)
├── README.md
├── LICENSE
├── .gitignore
└── vercel.json              (only if redirects/headers needed; likely omitted)
```

## Technical Architecture

- Static HTML/CSS/vanilla JS — no framework, no bundler, no build step.
- Fonts via Google Fonts `<link>` with `preconnect`, not `@import`.
- Email capture posts to a placeholder form `action` (same pattern as the
  Etsy placeholder link) — real provider to be wired up before launch.
- One JSON-LD `Organization` block in `<head>` for SEO; standard meta tags
  (title, description, Open Graph, Twitter Card); single `<h1>` per page;
  proper heading hierarchy; `aria-hidden` on all decorative kanji/SVG;
  skip-to-content link; visible focus states.
- No analytics script included by default — flagged as an open decision
  (Plausible suggested over GA for brand fit) if wanted later.
- Deployment: zero-config static deploy on Vercel; also Netlify
  drag-and-drop compatible.
- Performance target: Lighthouse 95+, achieved via no JS libraries, system
  font fallback during load, `font-display: swap`, no images except
  favicon/OG.

## Accessibility requirements

- All body-size text on dark backgrounds meets WCAG AA contrast
  (`--color-moss-text`, not `--color-moss`).
- `prefers-reduced-motion: reduce` disables all scroll/hover transform
  animations.
- Skip-to-content link, visible keyboard focus states on all interactive
  elements.
- Decorative kanji/SVG watermarks are `aria-hidden="true"`.
- Single `<h1>`, logical heading order, semantic landmarks (`<nav>`,
  `<main>`, `<footer>`).

## Open items for before public launch (not blocking implementation)

- Replace Etsy placeholder URL (`https://etsy.com`) with the real listing.
- Replace email capture placeholder form action with a real provider.
- Replace `assets/og-image.png` placeholder with a real social preview image.
- Decide whether to add an analytics script (Plausible recommended).
