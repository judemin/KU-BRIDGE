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
import {
  createCommunityService,
  contentRef,
} from "../../src/services/community.js";
import { createPersonalSync } from "../../src/services/personalSync.js";
import { createModerationService } from "../../src/services/moderation.js";
import { ROOM_IDS, contentKey } from "../../src/communityConfig.js";
const projectId = "demo-ku-bridge",
  password = "Correct-Password-123!";
for (const name of ["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST"])
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(process.env[name] || ""))
    throw Error("Only loopback emulators are allowed");
const authBase = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`;
async function eventually(condition) {
  for (let i = 0; i < 250; i++) {
    if (condition()) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  assert.fail("Snapshot did not settle");
}
test("identified community, moderation, synchronization and deletion with real SDK clients", async (t) => {
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
  const clients = [],
    stops = [];
  const trusted = (fn) =>
    env.withSecurityRulesDisabled((context) => fn(context.firestore()));
  async function client(id, nationality, verified = true) {
    const app = initializeApp(
      { projectId, apiKey: "demo-api-key", appId: "1:123:web:abcdef" },
      `community-${id}`,
    );
    const auth = a.getAuth(app);
    a.connectAuthEmulator(auth, authBase, { disableWarnings: true });
    const db = d.getFirestore(app);
    d.connectFirestoreEmulator(db, host, Number(port));
    const options = {
      getServices: async () => ({ app, auth, db }),
      loadDb: async () => d,
    };
    const service = createAuthService({
      ...options,
      getSettings: () => ({ status: "ready" }),
      loadAuth: async () => a,
    });
    stops.push(service.subscribe(() => {}));
    const email = `${id}@example.test`;
    const result = await service.register({
      email,
      password,
      preferences: {
        locale: "ko",
        studentType: "g",
        preferredRoom: "global",
        userId: id,
        nationality,
      },
    });
    assert.equal(result.profileSaved, true, `Identity reserved for ${id}`);
    if (verified) {
      const codes = await (
        await fetch(`${authBase}/emulator/v1/projects/${projectId}/oobCodes`)
      ).json();
      await a.applyActionCode(
        auth,
        codes.oobCodes
          .filter(
            (code) =>
              code.email === email && code.requestType === "VERIFY_EMAIL",
          )
          .at(-1).oobCode,
      );
      await service.refresh();
    }
    const value = {
      app,
      auth,
      db,
      service,
      uid: auth.currentUser.uid,
      community: createCommunityService(options),
      sync: createPersonalSync({ ...options, available: () => true }),
      moderation: createModerationService(options),
    };
    clients.push(value);
    return value;
  }
  const item = (kind, id, parentId = "", roomId = "global") => ({
    kind,
    contentId: id,
    parentId,
    roomId,
  });
  async function publish(
    client,
    target,
    body = "A useful community message",
    extra = {},
  ) {
    return client.community.publish(client.uid, {
      ...target,
      body,
      title: "Welcome to KU Bridge",
      category: "general",
      ...extra,
    });
  }
  try {
    await trusted(async (db) => {
      await d.setDoc(d.doc(db, "serviceConfig/public"), {
        communityEnabled: true,
        chatEnabled: true,
      });
      for (const room of ROOM_IDS)
        await d.setDoc(d.doc(db, "rooms", room), { enabled: true });
    });
    const alice = await client("alice_ku", "KR"),
      bob = await client("bob_ku", "JP"),
      operator = await client("operator_ku", "KR"),
      unverified = await client("unverified_ku", "US", false);
    await trusted((db) =>
      d.setDoc(d.doc(db, "admins", operator.uid), { role: "admin" }),
    );
    const post = item("post", "first-post"),
      comment = item("comment", "first-comment", post.contentId),
      message = item("message", "first-message");
    await t.test(
      "public identity excludes email; reservations and private preferences are protected",
      async () => {
        const profile = (
          await d.getDoc(d.doc(bob.db, "profiles/alice_ku"))
        ).data();
        assert.deepEqual(Object.keys(profile).sort(), [
          "nationality",
          "updatedAt",
          "userId",
        ]);
        assert.equal(profile.nationality, "KR");
        await assertFails(d.getDoc(d.doc(bob.db, "users", alice.uid)));
        await assertFails(d.getDoc(d.doc(bob.db, "userIds/alice_ku")));
        await assert.rejects(
          bob.service.savePreferences({
            locale: "ko",
            studentType: "g",
            preferredRoom: "global",
            userId: "alice_ku",
            nationality: "JP",
          }),
          (error) => error.code === "auth/user-id-locked",
        );
        await assertFails(
          d.setDoc(d.doc(bob.db, "admins", bob.uid), { role: "admin" }),
        );
      },
    );
    await t.test(
      "legacy accounts complete identity; concurrent ID claims have exactly one winner",
      async () => {
        await trusted(async (db) => {
          for (const who of [bob, unverified]) {
            await d.deleteDoc(
              d.doc(db, "profiles", who.service.getSnapshot().profile.userId),
            );
            await d.deleteDoc(
              d.doc(db, "userIds", who.service.getSnapshot().profile.userId),
            );
            await d.updateDoc(d.doc(db, "users", who.uid), {
              userId: d.deleteField(),
              nationality: d.deleteField(),
            });
          }
        });
        const preferences = {
          locale: "ko",
          studentType: "g",
          preferredRoom: "global",
          userId: "same_claim",
          nationality: "JP",
        };
        const results = await Promise.allSettled([
          bob.service.savePreferences(preferences),
          unverified.service.savePreferences({
            ...preferences,
            nationality: "US",
          }),
        ]);
        assert.equal(
          results.filter((result) => result.status === "fulfilled").length,
          1,
        );
        assert.equal(
          results.filter((result) => result.status === "rejected").length,
          1,
        );
        // Reset only emulator fixtures so subsequent scenarios retain stable display IDs.
        await trusted(async (db) => {
          await d.deleteDoc(d.doc(db, "profiles/same_claim"));
          await d.deleteDoc(d.doc(db, "userIds/same_claim"));
          for (const who of [bob, unverified])
            await d.updateDoc(d.doc(db, "users", who.uid), {
              userId: d.deleteField(),
              nationality: d.deleteField(),
            });
        });
        await bob.service.savePreferences({ ...preferences, userId: "bob_ku" });
        await unverified.service.savePreferences({
          ...preferences,
          userId: "unverified_ku",
          nationality: "US",
        });
      },
    );
    await t.test(
      "post creation is paired, idempotent, editable and bounded",
      async () => {
        await publish(alice, post);
        await publish(alice, post);
        const page = await bob.community.listPosts(bob.uid, "global");
        assert.equal(page.items.length, 1);
        assert.equal(page.items[0].authorId, "alice_ku");
        assert.equal(page.items[0].nationality, "KR");
        await alice.community.edit(alice.uid, post, {
          title: "Updated title",
          body: "Updated post",
          category: "question",
        });
        assert.equal(
          (await d.getDoc(contentRef(bob.db, d, post))).data().body,
          "Updated post",
        );
        await assertFails(
          bob.community.edit(bob.uid, post, {
            title: "Hijacked title",
            body: "bad",
            category: "general",
          }),
        );
        await assert.rejects(
          publish(alice, item("post", "too-soon")),
          (error) => error.code === "app/rate-limit",
        );
        await assertFails(
          d.getDocs(d.collection(bob.db, "rooms/global/posts")),
        );
        await assert.rejects(
          publish(alice, item("message", "wrong-room", "", "country-vn")),
        );
      },
    );
    await t.test(
      "two clients receive realtime messages with room isolation and verified author identity",
      async () => {
        let global = [],
          japan = [];
        stops.push(
          bob.community.watchMessages(
            bob.uid,
            "global",
            (items) => (global = items),
            (error) => {
              throw error;
            },
          ),
        );
        stops.push(
          bob.community.watchMessages(
            bob.uid,
            "country-jp",
            (items) => (japan = items),
            (error) => {
              throw error;
            },
          ),
        );
        await publish(alice, message);
        await eventually(() =>
          global.some((row) => row.id === message.contentId),
        );
        assert.equal(japan.length, 0);
        await assertFails(publish(unverified, item("message", "unverified")));
        const forged = d.writeBatch(bob.db),
          target = item("message", "forged"),
          key = contentKey(
            target.roomId,
            target.kind,
            target.parentId,
            target.contentId,
          );
        forged.set(contentRef(bob.db, d, target), {
          authorId: "alice_ku",
          nationality: "KR",
          body: "Impersonation",
          status: "visible",
          createdAt: d.serverTimestamp(),
          updatedAt: d.serverTimestamp(),
        });
        forged.set(d.doc(bob.db, "contentOwners", key), {
          ...target,
          ownerId: bob.uid,
          createdAt: d.serverTimestamp(),
        });
        forged.set(d.doc(bob.db, "users", bob.uid, "limits/message"), {
          targetKey: key,
          lastWriteAt: d.serverTimestamp(),
        });
        await assertFails(forged.commit());
        await assertFails(
          d.setDoc(d.doc(bob.db, "rooms/global/messages/unpaired"), {
            authorId: "bob_ku",
            nationality: "JP",
            body: "No owner",
            status: "visible",
            createdAt: d.serverTimestamp(),
            updatedAt: d.serverTimestamp(),
          }),
        );
      },
    );
    await t.test(
      "server rejects forged nationality, extra private fields, oversized bodies and reused counters",
      async () => {
        for (const [id, changes] of [
          ["bad-country", { nationality: "CN" }],
          ["private-email", { email: "secret@example.test" }],
          ["oversized", { body: "x".repeat(501) }],
        ]) {
          const target = item("message", id),
            key = contentKey("global", "message", "", id),
            batch = d.writeBatch(bob.db);
          batch.set(contentRef(bob.db, d, target), {
            authorId: "bob_ku",
            nationality: "JP",
            body: "Valid text",
            status: "visible",
            createdAt: d.serverTimestamp(),
            updatedAt: d.serverTimestamp(),
            ...changes,
          });
          batch.set(d.doc(bob.db, "contentOwners", key), {
            ...target,
            ownerId: bob.uid,
            createdAt: d.serverTimestamp(),
          });
          batch.set(d.doc(bob.db, "users", bob.uid, "limits/message"), {
            targetKey: key,
            lastWriteAt: d.serverTimestamp(),
          });
          await assertFails(batch.commit());
        }
        // Force a fresh server counter, then bypass all client-side cooldown checks.
        await trusted((db) =>
          d.setDoc(d.doc(db, "users", bob.uid, "limits/message"), {
            targetKey: "previous",
            lastWriteAt: d.Timestamp.fromMillis(Date.now() + 60000),
          }),
        );
        const target = item("message", "rate-bypass"),
          key = contentKey("global", "message", "", target.contentId),
          batch = d.writeBatch(bob.db);
        batch.set(contentRef(bob.db, d, target), {
          authorId: "bob_ku",
          nationality: "JP",
          body: "Bypass",
          status: "visible",
          createdAt: d.serverTimestamp(),
          updatedAt: d.serverTimestamp(),
        });
        batch.set(d.doc(bob.db, "contentOwners", key), {
          ...target,
          ownerId: bob.uid,
          createdAt: d.serverTimestamp(),
        });
        batch.set(d.doc(bob.db, "users", bob.uid, "limits/message"), {
          targetKey: key,
          lastWriteAt: d.serverTimestamp(),
        });
        await assertFails(batch.commit());
      },
    );
    await t.test(
      "comments, private reports, moderation and pause/resume work through services",
      async () => {
        await publish(
          bob,
          comment,
          "A comment that must survive its parent author's deletion",
        );
        await bob.community.report(bob.uid, post, "spam", "Review this post");
        await assert.rejects(
          bob.community.report(bob.uid, post, "spam", "duplicate"),
          (error) => error.code === "app/already-reported",
        );
        const reports = await operator.moderation.reports(operator.uid);
        assert.equal(reports.items.length, 1);
        await assertFails(
          d.getDoc(d.doc(alice.db, "reports", reports.items[0].id)),
        );
        await operator.moderation.moderate(
          operator.uid,
          post,
          true,
          "Reviewing report",
          reports.items[0].id,
        );
        assert.equal(
          (await bob.community.listPosts(bob.uid, "global")).items.length,
          0,
        );
        assert.equal((await alice.community.exportOwn(alice.uid)).length, 2);
        await operator.moderation.moderate(
          operator.uid,
          post,
          false,
          "Restored after review",
        );
        await operator.moderation.restrict(
          operator.uid,
          "alice_ku",
          true,
          "Test suspension",
        );
        await assertFails(alice.community.listPosts(alice.uid, "global"));
        await operator.moderation.restrict(
          operator.uid,
          "alice_ku",
          false,
          "Test resumption",
        );
        await operator.moderation.flags(operator.uid, {
          communityEnabled: false,
          chatEnabled: false,
        });
        await assertFails(bob.community.listPosts(bob.uid, "global"));
        await operator.moderation.flags(operator.uid, {
          communityEnabled: true,
          chatEnabled: true,
        });
        assert.ok((await operator.moderation.events(operator.uid)).length >= 6);
      },
    );
    await t.test(
      "bookmarks and checklists synchronize without cross-account access",
      async () => {
        let remote;
        stops.push(
          alice.sync.subscribe(
            alice.uid,
            (value) => (remote = value),
            (error) => {
              throw error;
            },
          ),
        );
        await alice.sync.mutate(alice.uid, {
          savedAdd: ["visa"],
          savedRemove: [],
          checked: { g: { checkG1: true } },
        });
        await eventually(
          () => remote?.saved.includes("visa") && remote.checked["g:checkG1"],
        );
        const created = (
          await d.getDoc(d.doc(alice.db, "users", alice.uid, "saved/visa"))
        ).data().createdAt;
        await Promise.all([
          alice.sync.mutate(alice.uid, {
            savedAdd: ["visa"],
            savedRemove: [],
            checked: { g: { checkG2: true } },
          }),
          alice.sync.mutate(alice.uid, {
            savedAdd: [],
            savedRemove: [],
            checked: { g: { checkG3: true } },
          }),
        ]);
        const checks = (
          await d.getDoc(d.doc(alice.db, "users", alice.uid, "checklists/g"))
        ).data().completed;
        assert.deepEqual(checks, ["checkG1", "checkG2", "checkG3"]);
        assert.ok(
          created.isEqual(
            (
              await d.getDoc(d.doc(alice.db, "users", alice.uid, "saved/visa"))
            ).data().createdAt,
          ),
        );
        await assertFails(
          d.getDocs(d.collection(bob.db, "users", alice.uid, "saved")),
        );
      },
    );
    await t.test(
      "account deletion scrubs its posts, removes messages/private state and preserves other users' comments",
      async () => {
        await alice.community.block(alice.uid, "bob_ku", true);
        stops.splice(0).forEach((stop) => stop());
        await alice.service.deleteAccount(password);
        assert.equal(alice.auth.currentUser, null);
        await trusted(async (db) => {
          assert.equal(
            (
              await d.getDoc(d.doc(db, "rooms/global/posts", post.contentId))
            ).data().status,
            "deleted",
          );
          assert.equal(
            (
              await d.getDoc(d.doc(db, "rooms/global/posts", post.contentId))
            ).data().authorId,
            "",
          );
          assert.equal(
            (
              await d.getDoc(
                d.doc(db, "rooms/global/messages", message.contentId),
              )
            ).exists(),
            false,
          );
          assert.equal(
            (
              await d.getDoc(
                d.doc(
                  db,
                  "rooms/global/posts",
                  post.contentId,
                  "comments",
                  comment.contentId,
                ),
              )
            ).exists(),
            true,
          );
          assert.equal(
            (await d.getDoc(d.doc(db, "users", alice.uid))).exists(),
            false,
          );
          assert.equal(
            (await d.getDoc(d.doc(db, "profiles/alice_ku"))).exists(),
            false,
          );
          assert.equal(
            (await d.getDoc(d.doc(db, "userIds/alice_ku"))).data().state,
            "retired",
          );
          for (const path of ["saved", "checklists", "blocks", "limits"])
            assert.equal(
              (await d.getDocs(d.collection(db, "users", alice.uid, path)))
                .size,
              0,
            );
        });
      },
    );
  } finally {
    stops.forEach((stop) => stop());
    for (const client of clients) {
      await d.terminate(client.db);
      await deleteApp(client.app);
    }
    await env.cleanup();
  }
});
