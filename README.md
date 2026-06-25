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
