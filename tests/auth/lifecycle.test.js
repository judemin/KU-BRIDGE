import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { initializeApp, deleteApp } from "firebase/app";
import * as a from "firebase/auth";
import * as d from "firebase/firestore";
import {
  initializeTestEnvironment,
  assertFails,
} from "@firebase/rules-unit-testing";
import { createAuthService } from "../../src/services/auth.js";

const projectId = "demo-ku-bridge";
for (const name of ["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST"])
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(process.env[name] || ""))
    throw new Error(`Loopback ${name} is required; live Auth is forbidden`);
const authBase = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`;
const settings = {
  apiKey: "demo-api-key",
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  appId: "1:123:web:abcdef",
};
const preferences = {
  locale: "ko",
  studentType: "g",
  preferredRoom: "country-vn",
};
const password = "Correct-Password-123!";
const waitFor = async (condition) => {
  for (let attempt = 0; attempt < 200; attempt++) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.fail("Auth state did not settle");
};
const emailCode = async (email, type) => {
  const response = await fetch(
    `${authBase}/emulator/v1/projects/${projectId}/oobCodes`,
  );
  assert.equal(response.status, 200);
  const { oobCodes } = await response.json();
  const item = oobCodes
    .filter((code) => code.email === email && code.requestType === type)
    .at(-1);
  assert.ok(item, `Emulator created ${type}`);
  return item.oobCode;
};

test("real Auth and Firestore account lifecycle", async (t) => {
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(":");
  const env = await initializeTestEnvironment({
    projectId,
    firestore: {
      host,
      port: Number(port),
      rules: await readFile(
        new URL("../../firebase/firestore.rules", import.meta.url),
        "utf8",
      ),
    },
  });
  await env.clearFirestore();
  await fetch(`${authBase}/emulator/v1/projects/${projectId}/accounts`, {
    method: "DELETE",
  });
  d.setLogLevel("silent");
  const app = initializeApp(settings, "auth-lifecycle-test");
  const auth = a.getAuth(app);
  a.connectAuthEmulator(auth, authBase, { disableWarnings: true });
  const db = d.getFirestore(app);
  d.connectFirestoreEmulator(db, host, Number(port));
  const makeService = (authSdk = a) =>
    createAuthService({
      getSettings: () => ({ status: "ready" }),
      getServices: async () => ({ app, auth, db }),
      loadAuth: async () => authSdk,
      loadDb: async () => d,
    });
  let service = makeService();
  let stop = service.subscribe(() => {});
  let uid, createdAt;
  const email = "lifecycle@example.test";
  try {
    await t.test("initial session resolves to guest", async () => {
      await waitFor(() => service.getSnapshot().status === "guest");
      assert.equal(service.getSnapshot().user, null);
    });
    await t.test(
      "registration creates only private preferences and sends a verification code",
      async () => {
        const result = await service.register({ email, password, preferences });
        assert.deepEqual(result, {
          profileSaved: true,
          verificationSent: true,
        });
        await waitFor(() => service.getSnapshot().profileStatus === "ready");
        uid = auth.currentUser.uid;
        const snapshot = service.getSnapshot();
        assert.equal(snapshot.user.emailVerified, false);
        assert.equal(snapshot.profile.preferredRoom, "country-vn");
        assert.deepEqual(
          Object.keys(snapshot.profile).sort(),
          [
            "createdAt",
            "locale",
            "preferredRoom",
            "studentType",
            "updatedAt",
          ].sort(),
        );
        assert.ok(await emailCode(email, "VERIFY_EMAIL"));
        createdAt = snapshot.profile.createdAt.toMillis();
      },
    );
    await t.test(
      "verification refreshes the actual token and never grants community writes",
      async () => {
        await a.applyActionCode(auth, await emailCode(email, "VERIFY_EMAIL"));
        await service.refresh();
        assert.equal(service.getSnapshot().user.emailVerified, true);
        assert.equal(
          (await a.getIdTokenResult(auth.currentUser)).claims.email_verified,
          true,
        );
        await assertFails(
          d.setDoc(d.doc(db, "rooms/global/posts/attempt"), {
            body: "not released",
          }),
        );
      },
    );
    await t.test(
      "preference updates preserve creation time and reject malformed values",
      async () => {
        await service.savePreferences({
          locale: "ja",
          studentType: "u",
          preferredRoom: "global",
        });
        assert.equal(
          service.getSnapshot().profile.createdAt.toMillis(),
          createdAt,
        );
        await assert.rejects(
          service.savePreferences({
            locale: "bad",
            studentType: "admin",
            preferredRoom: "global",
          }),
          { code: "permission-denied" },
        );
      },
    );
    await t.test(
      "remounting the service restores the SDK session and preferences",
      async () => {
        stop();
        service.dispose();
        service = makeService();
        stop = service.subscribe(() => {});
        await waitFor(() => service.getSnapshot().profileStatus === "ready");
        assert.equal(service.getSnapshot().user.uid, uid);
        assert.equal(service.getSnapshot().profile.locale, "ja");
      },
    );
    await t.test(
      "logout clears the in-memory account and wrong credentials are rejected",
      async () => {
        await service.logout();
        await waitFor(() => service.getSnapshot().status === "guest");
        assert.equal(service.getSnapshot().profile, null);
        await assert.rejects(service.login(email, "Wrong-password!", "en"));
        assert.equal(auth.currentUser, null);
      },
    );
    await t.test(
      "duplicate signup is rejected and password reset changes the password",
      async () => {
        await assert.rejects(
          service.register({ email, password, preferences }),
        );
        await service.resetPassword(email, "en");
        const code = await emailCode(email, "PASSWORD_RESET");
        assert.equal(await a.verifyPasswordResetCode(auth, code), email);
        await a.confirmPasswordReset(auth, code, password + "New");
        await assert.rejects(service.login(email, password, "en"));
        await service.login(email, password + "New", "en");
        await waitFor(() => service.getSnapshot().profileStatus === "ready");
      },
    );
    await t.test(
      "wrong deletion password preserves the account and private data",
      async () => {
        await assert.rejects(service.deleteAccount("wrong password"));
        assert.equal((await d.getDoc(d.doc(db, "users", uid))).exists(), true);
        assert.equal(
          (await d.getDoc(d.doc(db, "accountDeletions", uid))).exists(),
          false,
        );
      },
    );
    await t.test(
      "deletion cleans children before Auth and a stale token cannot recreate data",
      async () => {
        await d.setDoc(d.doc(db, "users", uid, "saved", "visa"), {
          createdAt: d.serverTimestamp(),
        });
        await d.setDoc(d.doc(db, "users", uid, "checklists", "u"), {
          completed: ["checkC1"],
          updatedAt: d.serverTimestamp(),
        });
        await service.deleteAccount(password + "New");
        await waitFor(() => service.getSnapshot().status === "guest");
        assert.equal(auth.currentUser, null);
        await env.withSecurityRulesDisabled(async (context) => {
          const store = context.firestore();
          assert.equal(
            (await d.getDoc(d.doc(store, "users", uid))).exists(),
            false,
          );
          assert.equal(
            (await d.getDocs(d.collection(store, "users", uid, "saved"))).size,
            0,
          );
          assert.equal(
            (await d.getDocs(d.collection(store, "users", uid, "checklists")))
              .size,
            0,
          );
          assert.equal(
            (await d.getDoc(d.doc(store, "accountDeletions", uid))).exists(),
            true,
          );
        });
        const stale = env
          .authenticatedContext(uid, {
            auth_time: Math.floor(Date.now() / 1000),
            email_verified: true,
          })
          .firestore();
        await assertFails(
          d.setDoc(d.doc(stale, "users", uid, "saved", "visa"), {
            createdAt: d.serverTimestamp(),
          }),
        );
        await assert.rejects(service.login(email, password + "New", "en"));
      },
    );
    await t.test(
      "partial deletion stays pending across remount and can be retried",
      async () => {
        await service.register({
          email: "retry@example.test",
          password,
          preferences,
        });
        await waitFor(() => service.getSnapshot().profileStatus === "ready");
        stop();
        service.dispose();
        service = makeService({
          ...a,
          deleteUser: async () => {
            throw Object.assign(new Error("Simulated connection loss"), {
              code: "auth/network-request-failed",
            });
          },
        });
        stop = service.subscribe(() => {});
        await waitFor(() => service.getSnapshot().profileStatus === "ready");
        await assert.rejects(service.deleteAccount(password), {
          code: "auth/network-request-failed",
        });
        assert.equal(service.getSnapshot().deletionPending, true);
        stop();
        service.dispose();
        service = makeService();
        stop = service.subscribe(() => {});
        await waitFor(() => service.getSnapshot().deletionPending);
        await assert.rejects(service.savePreferences(preferences), {
          code: "auth/deletion-pending",
        });
        await service.deleteAccount(password);
        assert.equal(service.getSnapshot().status, "guest");
      },
    );
    await t.test(
      "a failed profile save does not misreport successful signup as a missing account",
      async () => {
        const result = await service.register({
          email: "preferences-fail@example.test",
          password,
          preferences: { ...preferences, locale: "bad" },
        });
        assert.equal(result.profileSaved, false);
        assert.equal(result.verificationSent, true);
        assert.ok(auth.currentUser);
        await service.savePreferences(preferences);
        await waitFor(() => service.getSnapshot().profileStatus === "ready");
        await service.deleteAccount(password);
      },
    );
    await t.test(
      "a failed verification email keeps the account recoverable and resend succeeds",
      async () => {
        stop();
        service.dispose();
        service = makeService({
          ...a,
          sendEmailVerification: async () => {
            throw Object.assign(new Error("Simulated email failure"), {
              code: "auth/too-many-requests",
            });
          },
        });
        stop = service.subscribe(() => {});
        await waitFor(() => service.getSnapshot().status === "guest");
        const result = await service.register({
          email: "mail-retry@example.test",
          password,
          preferences,
        });
        assert.equal(result.profileSaved, true);
        assert.equal(result.verificationSent, false);
        assert.equal(result.verificationError, "authErrorRate");
        assert.ok(auth.currentUser);
        stop();
        service.dispose();
        service = makeService();
        stop = service.subscribe(() => {});
        await waitFor(() => service.getSnapshot().profileStatus === "ready");
        await service.sendVerification("ko");
        assert.ok(await emailCode("mail-retry@example.test", "VERIFY_EMAIL"));
        await service.deleteAccount(password);
      },
    );
  } finally {
    stop();
    service.dispose();
    await a.signOut(auth);
    await d.terminate(db);
    await deleteApp(app);
    await env.cleanup();
  }
});
