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
