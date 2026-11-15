import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createServer } from "vite";
import translations from "../src/i18n.js";
import { RESOURCES } from "../src/data.js";

test("React application interactions", async (t) => {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"></div></body></html>',
    { url: "http://localhost/" },
  );
  const keys = [
    "window",
    "document",
    "navigator",
    "localStorage",
    "IS_REACT_ACT_ENVIRONMENT",
  ];
  const descriptors = Object.fromEntries(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  for (const key of keys)
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key],
    });
  window.scrollTo = () => {};
  window.confirm = () => true;
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => {
    errors.push(args.map(String).join(" "));
    originalError(...args);
  };
  const server = await createServer({
    envDir: false,
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  const { createRoot } = await import("react-dom/client");
  let root;
  const prefix = "ku-bridge-independent-v1:";
  const settle = async () => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (!document.querySelector('[aria-busy="true"]')) return;
      await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    }
    assert.fail("Page module did not finish loading");
  };
  const click = async (element) => {
    assert.ok(element, "click target exists");
    await act(async () => element.click());
    await settle();
  };
  const nav = async (index) =>
    click(document.querySelectorAll(".header-nav a")[index]);
  const select = async (element, value) => {
    await act(async () => {
      element.value = value;
      element.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
  };
  try {
    const { default: App } = await server.ssrLoadModule("/src/App.jsx");
    const mount = async () => {
      root = createRoot(document.getElementById("root"));
      await act(async () =>
        root.render(
          React.createElement(React.StrictMode, null, React.createElement(App)),
        ),
      );
      await settle();
    };
    await mount();

    await t.test("home, four languages and accessible headings", async () => {
      assert.equal(document.querySelectorAll(".hero .resource-card").length, 0);
      assert.ok(document.querySelector(".hero-search"));
      assert.equal(
        document.querySelectorAll(".quick-guide > button").length,
        3,
      );
      assert.equal(document.querySelectorAll(".issue-card").length, 5);
      for (const locale of ["ko", "zh", "ja", "en"]) {
        await click(
          document.querySelector(
            `button[aria-label="Language ${{ ko: "한국어", zh: "简体中文", ja: "日本語", en: "English" }[locale]}"]`,
          ),
        );
        assert.equal(
          document.documentElement.lang,
          locale === "zh" ? "zh-CN" : locale,
        );
        assert.equal(
          document.querySelector("h1").textContent,
          translations[locale].heroTitle,
        );
        assert.equal(document.querySelectorAll("h1").length, 1);
        assert.equal(
          JSON.parse(localStorage.getItem(prefix + "locale")),
          locale,
        );
      }
    });

    await t.test("directory, student and category filters", async () => {
      await nav(1);
      assert.equal(document.querySelectorAll(".resource-card").length, 45);
      const selectors = document.querySelectorAll(".explore-filters select");
      await select(selectors[0], "g");
      await select(selectors[1], "funding");
      assert.equal(
        document.querySelectorAll(".resource-card").length,
        RESOURCES.filter(
          (item) => item.audience.includes("g") && item.category === "funding",
        ).length,
      );
    });

    await t.test(
      "saved items reset stale filters and persist across remounts",
      async () => {
        await click(document.querySelector(".save-icon"));
        assert.equal(
          JSON.parse(localStorage.getItem(prefix + "saved")).length,
          1,
        );
        await select(
          document.querySelectorAll(".explore-filters select")[1],
          "career",
        );
        await nav(4);
        assert.equal(
          document.querySelector("h1").textContent,
          translations.en.navSaved,
        );
        assert.equal(document.querySelectorAll(".resource-card").length, 1);
        await act(async () => root.unmount());
        await mount();
        await nav(4);
        assert.equal(document.querySelectorAll(".resource-card").length, 1);
        await click(document.querySelector(".save-icon"));
        assert.ok(document.querySelector(".empty-state"));
        await click(document.querySelector(".empty-state button"));
        assert.equal(
          document.querySelectorAll(".resource-card").length,
          0,
          "clearing filters must not expose unsaved topics",
        );
      },
    );

    await t.test(
      "issue shortcuts show relevant topics and browse all resets recommendations",
      async () => {
        await nav(0);
        await click(document.querySelector(".issue-card"));
        assert.equal(document.querySelectorAll(".resource-card").length, 4);
        await nav(1);
        assert.equal(document.querySelectorAll(".resource-card").length, 45);
      },
    );

    await t.test("home search submits a multilingual query", async () => {
      await nav(0);
      const input = document.querySelector("#home-search");
      await act(async () => {
        Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        ).set.call(input, "장학");
        input.dispatchEvent(new window.Event("input", { bubbles: true }));
        input.dispatchEvent(new window.Event("change", { bubbles: true }));
      });
      await act(async () =>
        document
          .querySelector(".hero-search")
          .dispatchEvent(
            new window.Event("submit", { bubbles: true, cancelable: true }),
          ),
      );
      assert.equal(document.querySelector(".search-wrap input").value, "장학");
      const count = document.querySelectorAll(".resource-card").length;
      assert.ok(count > 0 && count < 45);
    });

    await t.test(
      "detail dialog traps keyboard focus, closes and restores focus",
      async () => {
        const trigger = document.querySelector(".resource-card .text-link");
        trigger.focus();
        await click(trigger);
        const dialog = document.querySelector("[role=dialog]");
        assert.equal(document.activeElement, dialog);
        assert.equal(document.body.style.overflow, "hidden");
        assert.ok(dialog.querySelector('a[target="_blank"]'));
        await act(async () =>
          window.dispatchEvent(
            new window.KeyboardEvent("keydown", {
              key: "Tab",
              bubbles: true,
              cancelable: true,
            }),
          ),
        );
        assert.equal(document.activeElement, dialog.querySelector("button"));
        await act(async () =>
          window.dispatchEvent(
            new window.KeyboardEvent("keydown", {
              key: "Escape",
              bubbles: true,
            }),
          ),
        );
        assert.equal(document.querySelector("[role=dialog]"), null);
        assert.equal(document.activeElement, trigger);
        assert.equal(document.body.style.overflow, "");
      },
    );

    await t.test(
      "all student-specific checklist sizes, persistence and reset",
      async () => {
        await nav(3);
        for (const [student, count] of [
          ["u", 7],
          ["g", 5],
          ["e", 3],
          ["l", 2],
        ]) {
          await select(
            document.querySelector(".standalone-select select"),
            student,
          );
          assert.equal(document.querySelectorAll(".check-item").length, count);
        }
        await select(document.querySelector(".standalone-select select"), "u");
        await click(document.querySelector(".check-item input"));
        assert.equal(document.querySelectorAll(".check-item.done").length, 1);
        await act(async () => root.unmount());
        await mount();
        await nav(3);
        assert.equal(document.querySelectorAll(".check-item.done").length, 1);
        await click(document.querySelector(".check-footer button"));
        assert.equal(document.querySelectorAll(".check-item.done").length, 0);
      },
    );

    await t.test(
      "contact routes, clipboard failure and mobile menu",
      async () => {
        await nav(2);
        await select(document.querySelectorAll(".help-form select")[0], "l");
        await select(
          document.querySelectorAll(".help-form select")[1],
          "askClasses",
        );
        assert.equal(
          document.querySelector(".route-step h3").textContent,
          translations.en.askLanguageSchool,
        );
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async () => {
              throw new Error("Permission denied");
            },
          },
        });
        await click(document.querySelector(".inquiry-template button"));
        assert.equal(
          document.querySelector(".inquiry-template [role=status]").textContent,
          translations.en.copyFailed,
        );
        await click(document.querySelector(".mobile-toggle"));
        assert.equal(
          document
            .querySelector(".mobile-toggle")
            .getAttribute("aria-expanded"),
          "true",
        );
        await nav(0);
        assert.equal(
          document
            .querySelector(".mobile-toggle")
            .getAttribute("aria-expanded"),
          "false",
        );
      },
    );

    await t.test("malformed saved data cannot crash startup", async () => {
      await act(async () => root.unmount());
      localStorage.setItem(prefix + "saved", "null");
      localStorage.setItem(prefix + "checked", "null");
      localStorage.setItem(prefix + "audience", '"invalid"');
      localStorage.setItem(prefix + "locale", "{}");
      await mount();
      await nav(1);
      assert.equal(document.querySelectorAll(".resource-card").length, 45);
      await nav(3);
      assert.equal(document.querySelectorAll(".check-item").length, 7);
    });
    const visit = async (path) => {
      await act(async () => {
        window.history.pushState(null, "", path);
        window.dispatchEvent(new window.PopStateEvent("popstate"));
      });
      await settle();
    };
    await t.test(
      "direct URLs and remounts restore guide filters, contact selections and checklist type",
      async () => {
        await visit("/guide?student=g&category=funding&q=장학");
        const count = document.querySelectorAll(".resource-card").length;
        assert.ok(count > 0 && count < 45);
        await act(async () => root.unmount());
        await mount();
        assert.equal(document.querySelectorAll(".resource-card").length, count);
        assert.equal(
          document.querySelector(".search-wrap input").value,
          "장학",
        );
        assert.equal(
          document.querySelectorAll(".explore-filters select")[0].value,
          "g",
        );
        assert.equal(
          document.querySelectorAll(".explore-filters select")[1].value,
          "funding",
        );
        await visit("/contacts?student=l&topic=askClasses");
        await act(async () => root.unmount());
        await mount();
        assert.equal(
          document.querySelector(".route-step h3").textContent,
          translations.en.askLanguageSchool,
        );
        await visit("/my/checklist?student=g");
        assert.equal(document.querySelectorAll(".check-item").length, 5);
        await act(async () => root.unmount());
        await mount();
        assert.equal(
          document.querySelector(".standalone-select select").value,
          "g",
        );
        assert.equal(document.querySelectorAll(".check-item").length, 5);
      },
    );
    await t.test(
      "native back and forward navigation restore URLs and filters",
      async () => {
        await visit("/guide?q=장학&student=g");
        await nav(2);
        await select(
          document.querySelectorAll(".help-form select")[1],
          "askVisa",
        );
        const contactUrl = window.location.pathname + window.location.search;
        const travel = async (method) => {
          await act(
            async () =>
              new Promise((resolve) => {
                window.addEventListener("popstate", resolve, { once: true });
                window.history[method]();
              }),
          );
          await settle();
        };
        await travel("back");
        assert.equal(window.location.pathname, "/guide");
        assert.equal(
          document.querySelector(".search-wrap input").value,
          "장학",
        );
        assert.equal(
          document.querySelector(".explore-filters select").value,
          "g",
        );
        await travel("forward");
        assert.equal(
          window.location.pathname + window.location.search,
          contactUrl,
        );
        assert.equal(
          document.querySelectorAll(".help-form select")[1].value,
          "askVisa",
        );
      },
    );
    await t.test(
      "menu links expose real addresses and unknown pages recover to home",
      async () => {
        assert.deepEqual(
          [...document.querySelectorAll(".header-nav a")].map((link) =>
            link.getAttribute("href"),
          ),
          ["/", "/guide", "/contacts", "/my/checklist", "/my/saved", "/account"],
        );
        await visit("/missing/page");
        assert.equal(
          document.querySelector("h1").textContent,
          translations.en.notFoundTitle,
        );
        assert.ok(document.querySelector(".header-nav"));
        await click(document.querySelector(".status-page a"));
        assert.equal(window.location.pathname, "/");
        assert.ok(document.querySelector(".hero-search"));
      },
    );
    await t.test(
      "invalid URL options fall back safely and empty saved pages remain empty",
      async () => {
        await visit(
          "/guide?student=invalid&category=invalid&issue=invalid&detail=invalid",
        );
        assert.equal(document.querySelectorAll(".resource-card").length, 45);
        assert.equal(document.querySelector("[role=dialog]"), null);
        await visit("/my/saved");
        assert.equal(document.querySelectorAll(".resource-card").length, 0);
        await click(document.querySelector(".empty-state button"));
        assert.equal(window.location.pathname, "/my/saved");
        assert.equal(document.querySelectorAll(".resource-card").length, 0);
      },
    );
    await t.test(
      "page failure shows translated recovery without clearing stored records",
      async () => {
        const { ErrorBoundary } = await server.ssrLoadModule(
          "/src/components/States.jsx",
        );
        await act(async () => root.unmount());
        const records = JSON.stringify({ u: "preserve" });
        localStorage.setItem(prefix + "checked", records);
        root = createRoot(document.getElementById("root"));
        let fail = true;
        function FailingPage() {
          if (fail) throw new Error("Test page load failure");
          return React.createElement("p", null, "Recovered");
        }
        const collectErrors = console.error;
        const expectedErrors = [];
        console.error = (...args) =>
          expectedErrors.push(args.map(String).join(" "));
        try {
          await act(async () =>
            root.render(
              React.createElement(
                ErrorBoundary,
                {
                  tx: (key) => translations.en[key],
                  onRetry: () => {
                    fail = false;
                  },
                },
                React.createElement(FailingPage),
              ),
            ),
          );
          assert.ok(document.querySelector("[role=alert]"));
          assert.equal(
            document.querySelector("h1").textContent,
            translations.en.errorTitle,
          );
          assert.equal(localStorage.getItem(prefix + "checked"), records);
          assert.ok(
            expectedErrors.some((message) =>
              message.includes("Test page load failure"),
            ),
          );
          await click(document.querySelector("[role=alert] button"));
          assert.equal(document.querySelector("[role=alert]"), null);
          assert.equal(document.querySelector("p").textContent, "Recovered");
        } finally {
          console.error = collectErrors;
        }
      },
    );
    assert.deepEqual(errors, [], "no React runtime errors or warnings");
  } finally {
    if (root) await act(async () => root.unmount());
    await server.close();
    console.error = originalError;
    dom.window.close();
    for (const key of keys) {
      if (descriptors[key])
        Object.defineProperty(globalThis, key, descriptors[key]);
      else delete globalThis[key];
    }
  }
});
