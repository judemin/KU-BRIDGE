import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createServer } from "vite";
test("board, editor and chat use independent routes, flags and subscription lifecycles", async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "http://localhost/community",
    pretendToBeVisual: true,
  });
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
  window.scrollTo = () => {};
  const server = await createServer({
    envDir: false,
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  let root;
  let state = {
    status: "authenticated",
    user: { uid: "alice", email: "private@example.test", emailVerified: true },
    profileStatus: "ready",
    profile: {
      userId: "alice_ku",
      nationality: "KR",
      locale: "en",
      studentType: "all",
      preferredRoom: "global",
    },
    isAdmin: false,
    deletionPending: false,
  };
  const listeners = new Set();
  let starts = 0,
    stops = 0;
  const authService = {
    getSnapshot: () => state,
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    async logout() {
      state = { status: "guest", user: null, profile: null };
      listeners.forEach((fn) => fn());
    },
  };
  const row = {
    id: "post-one",
    title: "A post to open",
    body: "Public post body",
    category: "general",
    authorId: "bob_ku",
    nationality: "JP",
    status: "visible",
  };
  const api = {
    watchFlags(uid, next) {
      next({ communityEnabled: true, chatEnabled: true });
      return () => {};
    },
    watchBlocks(uid, next) {
      next([]);
      return () => {};
    },
    async listPosts(uid, room, cursor = 0) {
      return {
        items: Array.from(
          { length: Math.min(10, 23 - cursor) },
          (_, index) => ({
            ...row,
            id: `post-${cursor + index}`,
            title: `A post to open ${cursor + index}`,
          }),
        ),
        cursor: cursor + 10,
        hasMore: cursor + 10 < 23,
      };
    },
    watchMessages(uid, room, next) {
      starts++;
      next([
        {
          id: "msg-one",
          authorId: "bob_ku",
          nationality: "JP",
          body: "Hello from Japan",
          status: "visible",
        },
      ]);
      return () => {
        stops++;
      };
    },
    watchPost(uid, room, id, next) {
      next(row);
      return () => {};
    },
    watchComments(uid, room, id, next) {
      next([]);
      return () => {};
    },
  };
  const flush = async () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 25));
      });
      if (!document.querySelector('main [aria-busy="true"]')) return;
    }
    assert.fail("The page did not finish loading");
  };
  try {
    const { createRoot } = await import("react-dom/client");
    const { default: App } = await server.ssrLoadModule("/src/App.jsx");
    await act(async () => {
      root = createRoot(document.getElementById("root"));
      root.render(
        React.createElement(App, {
          authService,
          communityApi: api,
          syncService: { available: () => false },
        }),
      );
    });
    await flush();
    await flush();
    assert.equal(document.querySelectorAll(".room-tabs button").length, 5);
    assert.ok(document.querySelector(".community-board"));
    assert.equal(document.querySelectorAll(".post-row").length, 10);
    const pageButtons = () =>
      document.querySelectorAll(".pagination-direction");
    assert.ok(pageButtons()[0].disabled);
    await act(async () => pageButtons()[1].click());
    await flush();
    assert.equal(document.querySelectorAll(".post-row").length, 10);
    assert.equal(
      document.querySelector('.page-numbers [aria-current="page"]').textContent,
      "2",
    );
    await act(async () => pageButtons()[1].click());
    await flush();
    assert.equal(document.querySelectorAll(".post-row").length, 3);
    assert.ok(pageButtons()[1].disabled);
    await act(async () => pageButtons()[0].click());
    await flush();
    assert.equal(document.querySelectorAll(".post-row").length, 10);
    await act(async () =>
      document.querySelector(".page-numbers button").click(),
    );
    await flush();
    assert.equal(
      document.querySelector('.page-numbers [aria-current="page"]').textContent,
      "1",
    );
    assert.equal(document.querySelector(".community-chat"), null);
    assert.equal(starts, 0);
    assert.match(
      document.querySelector(".content-author").textContent,
      /Japan/,
    );
    assert.equal(
      document.querySelector("img.country-flag").getAttribute("src"),
      "/flags/jp.svg",
    );
    assert.ok(
      !document
        .querySelector(".community-page")
        .textContent.includes("private@example.test"),
    );
    await act(async () =>
      document.querySelector(".board-heading .auth-button").click(),
    );
    await flush();
    assert.equal(window.location.pathname, "/community/new");
    assert.ok(document.querySelector(".post-editor"));
    assert.equal(document.querySelector(".post-list"), null);
    assert.equal(starts, 0);
    await act(async () => document.querySelector(".post-editor a").click());
    await flush();
    await act(async () => document.querySelector(".post-title").click());
    await flush();
    assert.ok(document.querySelector(".post-detail"));
    assert.equal(starts, 0);
    assert.equal(document.querySelector(".community-chat"), null);
    await act(async () =>
      document.querySelector('.header-nav a[href="/chat"]').click(),
    );
    await flush();
    assert.equal(document.querySelector(".community-board"), null);
    assert.ok(document.querySelector(".community-chat"));
    assert.equal(starts, 1);
    assert.equal(
      document
        .querySelector(".chat-message img.country-flag")
        .getAttribute("src"),
      "/flags/jp.svg",
    );
    const input = document.querySelector("#chat-message-input");
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      ).set.call(input, "Private draft");
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await act(async () =>
      document.querySelectorAll(".room-tabs button")[3].click(),
    );
    await flush();
    assert.equal(document.querySelector("#chat-message-input").value, "");
    assert.equal(starts, 2);
    assert.equal(stops, 1);
    await act(async () => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new window.Event("visibilitychange"));
    });
    assert.equal(stops, 2);
    await act(async () => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new window.Event("visibilitychange"));
    });
    assert.equal(starts, 3);
    await act(async () =>
      document.querySelector('.header-nav a[href="/community"]').click(),
    );
    await flush();
    assert.equal(stops, 3);
    assert.equal(document.querySelector(".community-chat"), null);
    await act(async () =>
      document.querySelector('.header-nav a[href="/chat"]').click(),
    );
    await flush();
    assert.equal(starts, 4);
    await act(async () => document.querySelector(".header-logout").click());
    await flush();
    assert.equal(stops, 4);
    assert.equal(window.location.pathname, "/");
    assert.equal(document.querySelector(".header-logout"), null);
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
