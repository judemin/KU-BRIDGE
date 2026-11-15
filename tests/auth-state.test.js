import test from "node:test";
import assert from "node:assert/strict";
import { createAuthService, authErrorKey } from "../src/services/auth.js";

const tick = () => new Promise((resolve) => setImmediate(resolve));
test("guests do not load Firestore and stale profile responses cannot cross accounts", async () => {
  let observer,
    dbLoads = 0;
  const pending = [];
  const auth = { currentUser: null };
  const service = createAuthService({
    getSettings: () => ({ status: "ready" }),
    getServices: async () => ({ auth, db: {} }),
    loadAuth: async () => ({
      onIdTokenChanged: (_, listener) => {
        observer = listener;
        listener(null);
        return () => {};
      },
    }),
    loadDb: async () => {
      dbLoads++;
      return {
        doc: (_, ...parts) => parts.join("/"),
        getDocFromServer: (path) =>
          new Promise((resolve) => pending.push({ path, resolve })),
      };
    },
  });
  const stop = service.subscribe(() => {});
  try {
    await service.start();
    assert.equal(service.getSnapshot().status, "guest");
    assert.equal(dbLoads, 0);
    auth.currentUser = {
      uid: "alice",
      email: "alice@example.test",
      emailVerified: true,
    };
    observer(auth.currentUser);
    await tick();
    auth.currentUser = {
      uid: "bob",
      email: "bob@example.test",
      emailVerified: false,
    };
    observer(auth.currentUser);
    await tick();
    const resolveUser = (uid, locale) =>
      pending
        .filter((item) => item.path.endsWith(`/${uid}`))
        .forEach((item) =>
          item.resolve({
            exists: () => item.path.startsWith("users/"),
            data: () => ({ locale }),
          }),
        );
    resolveUser("bob", "ja");
    await tick();
    assert.equal(service.getSnapshot().profile.locale, "ja");
    resolveUser("alice", "ko");
    await tick();
    assert.equal(service.getSnapshot().user.uid, "bob");
    assert.equal(service.getSnapshot().profile.locale, "ja");
    auth.currentUser = null;
    observer(null);
    await tick();
    assert.equal(service.getSnapshot().profile, null);
    assert.equal(service.getSnapshot().user, null);
    assert.equal(dbLoads, 1);
  } finally {
    stop();
    service.dispose();
  }
});

test("an initialization failure can retry without marking the user logged in", async () => {
  let attempts = 0;
  const service = createAuthService({
    getSettings: () => ({ status: "ready" }),
    getServices: async () => {
      if (++attempts === 1)
        throw Object.assign(new Error("offline"), {
          code: "auth/network-request-failed",
        });
      return { auth: {} };
    },
    loadAuth: async () => ({
      onIdTokenChanged: (_, listener) => {
        listener(null);
        return () => {};
      },
    }),
  });
  try {
    await service.start();
    assert.equal(service.getSnapshot().status, "error");
    assert.equal(service.getSnapshot().errorKey, "authErrorNetwork");
    await service.retry();
    assert.equal(service.getSnapshot().status, "guest");
    assert.equal(service.getSnapshot().user, null);
    assert.equal(
      authErrorKey({
        code: "auth/invalid-credential",
        message: "private provider message",
      }),
      "authErrorCredentials",
    );
  } finally {
    service.dispose();
  }
});
