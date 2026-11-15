import test from "node:test";
import assert from "node:assert/strict";
import { observeReveals } from "../src/motion.js";

function fixture(t, reduced = false) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const calls = [];
  const listeners = new Map();
  const preference = {
    matches: reduced,
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name) => listeners.delete(name),
  };
  let observer;
  class Observer {
    constructor(callback) {
      this.callback = callback;
      this.observed = new Set();
      this.disconnected = false;
      observer = this;
    }
    observe(element) {
      this.observed.add(element);
    }
    unobserve(element) {
      this.observed.delete(element);
    }
    disconnect() {
      this.disconnected = true;
      this.observed.clear();
    }
  }
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { matchMedia: () => preference, IntersectionObserver: Observer },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else delete globalThis.window;
  });
  const element = {
    animate() {
      const animation = {
        cancelled: false,
        cancel() {
          this.cancelled = true;
          this.oncancel?.();
        },
      };
      calls.push(animation);
      return animation;
    },
  };
  const root = { querySelectorAll: () => [element] };
  return {
    root,
    element,
    calls,
    listeners,
    get observer() {
      return observer;
    },
  };
}

test("offscreen content is not animated and retained cards only reveal once", (t) => {
  const f = fixture(t);
  const seen = new WeakSet();
  const cleanup = observeReveals(f.root, seen);
  f.observer.callback([{ target: f.element, isIntersecting: false }]);
  assert.equal(f.calls.length, 0);
  f.observer.callback([{ target: f.element, isIntersecting: true }]);
  assert.equal(f.calls.length, 1);
  cleanup();
  const cleanupAgain = observeReveals(f.root, seen);
  assert.equal(
    f.observer.observed.size,
    0,
    "filter updates do not replay retained cards",
  );
  cleanupAgain();
});

test("reduced motion skips animation setup entirely", (t) => {
  const f = fixture(t, true);
  const cleanup = observeReveals(f.root);
  assert.equal(f.observer, undefined);
  assert.equal(f.calls.length, 0);
  cleanup();
});

test("changing motion preference cancels in-flight effects and cleans up listeners", (t) => {
  const f = fixture(t);
  const cleanup = observeReveals(f.root);
  f.observer.callback([{ target: f.element, isIntersecting: true }]);
  f.listeners.get("change")({ matches: true });
  assert.ok(f.calls[0].cancelled);
  assert.ok(f.observer.disconnected);
  cleanup();
  assert.equal(f.listeners.size, 0);
});

test("missing observer support leaves content untouched and cleanup safe", (t) => {
  const f = fixture(t);
  delete window.IntersectionObserver;
  const cleanup = observeReveals(f.root);
  assert.equal(f.observer, undefined);
  assert.equal(f.calls.length, 0);
  cleanup();
});
