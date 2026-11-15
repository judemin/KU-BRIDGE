import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createServer } from "vite";
test("guest merge is explicit; account switching, stale snapshots and failed writes preserve isolation", async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost/" });
  const keys = [
      "window",
      "document",
      "navigator",
      "localStorage",
      "IS_REACT_ACT_ENVIRONMENT",
    ],
    old = Object.fromEntries(
      keys.map((key) => [
        key,
        Object.getOwnPropertyDescriptor(globalThis, key),
      ]),
    );
  for (const key of keys)
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key],
    });
  const server = await createServer({
    envDir: false,
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  let root, view, hook;
  const callbacks = new Map(),
    writes = [];
  let fail = false;
  const service = {
    available: () => true,
    subscribe(uid, next, error) {
      callbacks.set(uid, { next, error });
      return () => {};
    },
    async mutate(uid, change) {
      writes.push({ uid, change });
      if (fail) throw Error("Offline");
    },
  };
  function Probe({ uid }) {
    view = hook(
      { user: uid ? { uid } : null, deletionPending: false },
      service,
    );
    return React.createElement("span", null, view.saved.join(","));
  }
  const render = (uid) =>
    act(async () => root.render(React.createElement(Probe, { uid })));
  try {
    hook = (await server.ssrLoadModule("/src/hooks/useSyncedPersonal.js"))
      .useSyncedPersonal;
    const { createRoot } = await import("react-dom/client");
    root = createRoot(document.getElementById("root"));
    await render(null);
    await act(async () => view.setSaved(["visa"]));
    assert.deepEqual(view.saved, ["visa"]);
    await render("alice");
    assert.deepEqual(view.saved, []);
    await act(async () =>
      callbacks.get("alice").next({ saved: ["course"], checked: {} }),
    );
    assert.equal(view.needsMigration, true);
    assert.equal(writes.length, 0);
    await act(async () => view.mergeGuest());
    assert.equal(writes.length, 1);
    assert.equal(writes[0].uid, "alice");
    assert.deepEqual(writes[0].change.savedAdd, ["visa"]);
    await render("bob");
    assert.deepEqual(view.saved, []);
    await act(async () =>
      callbacks.get("alice").next({ saved: ["thesis"], checked: {} }),
    );
    assert.deepEqual(view.saved, []);
    await act(async () =>
      callbacks.get("bob").next({ saved: [], checked: {} }),
    );
    assert.equal(view.needsMigration, true);
    await act(async () => view.keepSeparate());
    assert.equal(view.needsMigration, false);
    assert.equal(writes.length, 1);
    fail = true;
    await act(async () => view.setSaved(["alien"]));
    assert.ok(view.personalError);
    assert.deepEqual(view.saved, []);
    await render(null);
    assert.deepEqual(view.saved, ["visa"]);
    await act(async () =>
      callbacks.get("bob").next({ saved: ["alien"], checked: {} }),
    );
    assert.deepEqual(view.saved, ["visa"]);
  } finally {
    if (root) await act(async () => root.unmount());
    await server.close();
    dom.window.close();
    for (const key of keys) {
      if (old[key]) Object.defineProperty(globalThis, key, old[key]);
      else delete globalThis[key];
    }
  }
});
