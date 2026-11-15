import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createServer } from "vite";
import copy from "../src/i18n.js";

test("account forms and recovery states", async (t) => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "http://localhost/account",
  });
  const keys = [
    "window",
    "document",
    "navigator",
    "localStorage",
    "IS_REACT_ACT_ENVIRONMENT",
  ];
  const old = Object.fromEntries(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  keys.forEach((key) =>
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key],
    }),
  );
  window.scrollTo = () => {};
  const originalError = console.error,
    errors = [];
  console.error = (...args) => {
    errors.push(args.map(String).join(" "));
  };
  const server = await createServer({
    envDir: false,
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  let root;
  let state = {
    status: "guest",
    user: null,
    profile: null,
    profileStatus: "idle",
    deletionPending: false,
  };
  const listeners = new Set(),
    calls = [];
  const set = (changes) => {
    state = { ...state, ...changes };
    listeners.forEach((fn) => fn());
  };
  const user = {
    uid: "test-user",
    email: "student@example.test",
    emailVerified: false,
  };
  const preferences = {
    locale: "en",
    studentType: "g",
    preferredRoom: "country-vn",
  };
  let resetResolve,
    deleteFails = false;
  const service = {
    getSnapshot: () => state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    async register(value) {
      calls.push(["register", value]);
      set({
        status: "authenticated",
        user,
        profile: value.preferences,
        profileStatus: "ready",
      });
      return { profileSaved: true, verificationSent: true };
    },
    async login() {
      throw Object.assign(new Error("secret raw provider error"), {
        code: "auth/invalid-credential",
      });
    },
    async logout() {
      set({
        status: "guest",
        user: null,
        profile: null,
        profileStatus: "idle",
        deletionPending: false,
      });
    },
    async resetPassword(email) {
      calls.push(["reset", email]);
      await new Promise((resolve) => {
        resetResolve = resolve;
      });
    },
    async savePreferences(value) {
      calls.push(["save", value]);
      set({ profile: value, profileStatus: "ready" });
    },
    async refresh() {
      set({
        user: { ...user, emailVerified: true },
        profile: preferences,
        profileStatus: "ready",
      });
    },
    async sendVerification() {
      calls.push(["verification"]);
    },
    async deleteAccount(password) {
      calls.push(["delete", password]);
      if (deleteFails) {
        set({ deletionPending: true });
        throw Object.assign(new Error("partial deletion"), {
          code: "auth/network-request-failed",
        });
      }
      await service.logout();
    },
  };
  const settle = async () => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (!document.querySelector('[aria-busy="true"]')) return;
      await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    }
    assert.fail("Page did not settle");
  };
  const click = async (element) => {
    assert.ok(element);
    await act(async () => element.click());
    await settle();
  };
  const button = (text) =>
    [...document.querySelectorAll("main button")].find(
      (item) => item.textContent === text,
    );
  const input = async (name, value) => {
    const field = document.querySelector(`[name="${name}"]`);
    assert.ok(field, name);
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set.call(field, value);
      field.dispatchEvent(new window.Event("input", { bubbles: true }));
      field.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
  };
  const select = async (name, value) => {
    await act(async () => {
      const field = document.querySelector(`[name="${name}"]`);
      field.value = value;
      field.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
  };
  const submit = async (form = document.querySelector("main form")) => {
    await act(async () =>
      form.dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true }),
      ),
    );
    await settle();
  };
  try {
    const { createRoot } = await import("react-dom/client");
    const { default: App } = await server.ssrLoadModule("/src/App.jsx");
    root = createRoot(document.getElementById("root"));
    await act(async () =>
      root.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(App, { authService: service }),
        ),
      ),
    );
    await settle();
    await t.test(
      "login and signup routes are accessible and translated in four languages",
      async () => {
        for (const [locale, label] of [
          ["ko", "한국어"],
          ["zh", "简体中文"],
          ["ja", "日本語"],
          ["en", "English"],
        ]) {
          await click(
            document.querySelector(`button[aria-label="Language ${label}"]`),
          );
          assert.equal(
            document.querySelector("h1").textContent,
            copy[locale].authLogin,
          );
        }
        assert.equal(
          document.querySelector('[name="password"]').autocomplete,
          "current-password",
        );
        await click(button(copy.en.authRegister));
        assert.equal(window.location.search, "?mode=signup");
        assert.equal(
          document.querySelector('[name="password"]').autocomplete,
          "new-password",
        );
        assert.equal(
          document.querySelector('main a[href="/privacy"]').target,
          "_blank",
        );
      },
    );
    await t.test(
      "signup validates confirmation and acknowledgment before creating an account",
      async () => {
        await input("email", "student@example.test");
        await input("password", "Password123!");
        await input("confirmation", "different");
        await submit();
        assert.equal(
          document.querySelector('[role="alert"]').textContent,
          copy.en.authMismatch,
        );
        await input("confirmation", "Password123!");
        await submit();
        assert.equal(
          document.querySelector('[role="alert"]').textContent,
          copy.en.authReadPrivacy,
        );
        assert.equal(calls.length, 0);
        await click(document.querySelector('main input[type="checkbox"]'));
        await select("studentType", "g");
        await select("preferredRoom", "country-vn");
        await submit();
        assert.equal(calls[0][0], "register");
        assert.equal(calls[0][1].preferences.preferredRoom, "country-vn");
        assert.equal(
          document.querySelector("h1").textContent,
          copy.en.authAccount,
        );
        assert.match(
          document.querySelector('[role="status"]').textContent,
          /Verification email sent/,
        );
        assert.equal(document.querySelector('[name="password"]'), null);
      },
    );
    await t.test(
      "verification refresh, preference save and logout preserve guest records",
      async () => {
        localStorage.setItem("ku-bridge-independent-v1:saved", '["visa"]');
        await click(button(copy.en.authCheckVerification));
        assert.equal(
          document.querySelector(".auth-badge").textContent,
          copy.en.authVerified,
        );
        await select("studentType", "l");
        await submit();
        assert.equal(calls.at(-1)[0], "save");
        assert.equal(calls.at(-1)[1].studentType, "l");
        await click(button(copy.en.authLogout));
        assert.equal(
          document.querySelector("h1").textContent,
          copy.en.authRegister,
        );
        assert.equal(
          localStorage.getItem("ku-bridge-independent-v1:saved"),
          '["visa"]',
        );
      },
    );
    await t.test(
      "login provider errors are translated without exposing raw messages",
      async () => {
        await click(button(copy.en.authLogin));
        await input("email", "student@example.test");
        await input("password", "Wrong-password");
        await submit();
        assert.equal(
          document.querySelector('[role="alert"]').textContent,
          copy.en.authErrorCredentials,
        );
        assert.ok(!document.body.textContent.includes("secret raw"));
        assert.equal(document.querySelector('[name="password"]').value, "");
      },
    );
    await t.test(
      "reset requests cannot be double-submitted and use a generic success message",
      async () => {
        await click(button(copy.en.authReset));
        await input("email", "student@example.test");
        await submit();
        assert.ok(document.querySelector("fieldset").disabled);
        await submit();
        assert.equal(calls.filter(([name]) => name === "reset").length, 1);
        await act(async () => resetResolve());
        assert.equal(
          document.querySelector('[role="status"]').textContent,
          copy.en.authResetSent,
        );
      },
    );
    await t.test(
      "failed preference loading cannot overwrite existing server preferences",
      async () => {
        await act(async () =>
          set({
            status: "authenticated",
            user,
            profile: null,
            profileStatus: "error",
          }),
        );
        assert.equal(document.querySelector('[name="studentType"]'), null);
        assert.ok(button(copy.en.authReload));
        await click(button(copy.en.authReload));
        assert.ok(document.querySelector('[name="studentType"]'));
      },
    );
    await t.test(
      "partial deletion remains visible and retry completes without clearing guest records",
      async () => {
        await click(button(copy.en.authDelete));
        await input("deletePassword", "Password123!");
        await click(
          document.querySelector('.account-danger input[type="checkbox"]'),
        );
        deleteFails = true;
        await submit(document.querySelector(".account-danger form"));
        assert.ok(
          document.body.textContent.includes(copy.en.authDeletionPending),
        );
        assert.ok(
          document.body.textContent.includes(copy.en.authDeleteFailure),
        );
        assert.equal(document.querySelector('[name="studentType"]'), null);
        assert.equal(
          document.querySelector('[name="deletePassword"]').value,
          "",
        );
        deleteFails = false;
        await input("deletePassword", "Password123!");
        await submit(document.querySelector(".account-danger form"));
        assert.ok(document.body.textContent.includes(copy.en.authDeleted));
        assert.equal(
          localStorage.getItem("ku-bridge-independent-v1:saved"),
          '["visa"]',
        );
      },
    );
    await t.test(
      "unconfigured accounts leave the guide and privacy page accessible",
      async () => {
        await act(async () => set({ status: "unconfigured", user: null }));
        assert.ok(document.body.textContent.includes(copy.en.authUnavailable));
        assert.equal(document.querySelector("main form"), null);
        await click(document.querySelector('footer a[href="/privacy"]'));
        assert.equal(
          document.querySelector("h1").textContent,
          copy.en.authPrivacy,
        );
        assert.match(document.body.textContent, /private deletion record/);
      },
    );
    assert.deepEqual(errors, [], "no React runtime errors or warnings");
  } finally {
    if (root) await act(async () => root.unmount());
    await server.close();
    console.error = originalError;
    dom.window.close();
    keys.forEach((key) => {
      if (old[key]) Object.defineProperty(globalThis, key, old[key]);
      else delete globalThis[key];
    });
  }
});
