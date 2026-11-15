import test from "node:test";
import assert from "node:assert/strict";
import { readFirebaseConfig } from "../src/services/firebaseConfig.js";

const web = {
  VITE_FIREBASE_API_KEY: "AIza" + "a".repeat(35),
  VITE_FIREBASE_PROJECT_ID: "ku-bridge-example",
  VITE_FIREBASE_AUTH_DOMAIN: "ku-bridge-example.firebaseapp.com",
  VITE_FIREBASE_APP_ID: "1:1234567890:web:abcdef1234",
};
test("unconfigured Firebase leaves the static guide independent", () => {
  assert.equal(readFirebaseConfig().status, "unconfigured");
  assert.equal(readFirebaseConfig().config, null);
});
test("partial and malformed identifiers fail without exposing config values", () => {
  const result = readFirebaseConfig({
    VITE_FIREBASE_API_KEY: web.VITE_FIREBASE_API_KEY,
  });
  assert.equal(result.status, "invalid");
  assert.equal(result.config, null);
  assert.ok(!result.problems.join(" ").includes(web.VITE_FIREBASE_API_KEY));
  assert.equal(
    readFirebaseConfig({
      ...web,
      VITE_FIREBASE_AUTH_DOMAIN: "https://example.com/path",
    }).status,
    "invalid",
  );
  assert.equal(readFirebaseConfig(web).status, "ready");
});
test("emulators cannot point to real projects or be enabled in a production build", () => {
  const local = {
    ...web,
    DEV: true,
    VITE_FIREBASE_PROJECT_ID: "demo-ku-bridge",
    VITE_FIREBASE_USE_EMULATORS: "true",
  };
  assert.equal(readFirebaseConfig(local).status, "ready");
  assert.equal(readFirebaseConfig({ ...local, DEV: false }).status, "invalid");
  assert.equal(
    readFirebaseConfig({
      ...local,
      VITE_FIREBASE_PROJECT_ID: web.VITE_FIREBASE_PROJECT_ID,
    }).status,
    "invalid",
  );
  assert.equal(
    readFirebaseConfig({ ...web, VITE_FIREBASE_PROJECT_ID: "demo-ku-bridge" })
      .status,
    "invalid",
  );
});
test("administrator credential variables are rejected even when identifiers are valid", () => {
  const result = readFirebaseConfig({
    ...web,
    VITE_FIREBASE_PRIVATE_KEY: "not-for-a-browser",
  });
  assert.equal(result.status, "invalid");
  assert.equal(result.config, null);
  assert.ok(!JSON.stringify(result).includes("not-for-a-browser"));
});
