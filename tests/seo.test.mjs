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

test('has exactly one h1', () => {
  const matches = html.match(/<h1[\s>]/gi) || [];
  assert.equal(matches.length, 1);
});
