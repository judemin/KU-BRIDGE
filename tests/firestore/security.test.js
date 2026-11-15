import test, { before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  setLogLevel,
} from "firebase/firestore";
import { RESOURCES } from "../../src/data.js";

const address = process.env.FIRESTORE_EMULATOR_HOST;
// Permission-denied writes below are expected assertions, not application errors.
setLogLevel("silent");
if (!address || !/^(127\.0\.0\.1|localhost):\d+$/.test(address))
  throw new Error(
    "Rules tests require a loopback Firestore emulator; live databases are forbidden",
  );
const [host, port] = address.split(":");
let env;
const originalTime = Timestamp.fromDate(new Date("2026-01-01T00:00:00Z"));
const profile = () => ({
  locale: "en",
  studentType: "u",
  preferredRoom: "global",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
const db = (uid = "alice", claims = {}) =>
  env
    .authenticatedContext(uid, { email_verified: true, ...claims })
    .firestore();

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-ku-bridge",
    firestore: {
      host,
      port: Number(port),
      rules: await readFile(
        new URL("../../firebase/firestore.rules", import.meta.url),
        "utf8",
      ),
    },
  });
});
after(async () => {
  await env?.cleanup();
});
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const store = context.firestore();
    const batch = writeBatch(store);
    for (const uid of ["alice", "bob"])
      batch.set(doc(store, `users/${uid}`), {
        locale: "en",
        studentType: "u",
        preferredRoom: "global",
        createdAt: originalTime,
        updatedAt: originalTime,
      });
    batch.set(doc(store, "users/bob/saved/visa"), { createdAt: originalTime });
    batch.set(doc(store, "users/bob/checklists/u"), {
      completed: ["checkC1"],
      updatedAt: originalTime,
    });
    batch.set(doc(store, "admins/operator"), { role: "admin" });
    batch.set(doc(store, "moderation/bob"), { status: "suspended" });
    batch.set(doc(store, "serviceConfig/public"), {
      communityEnabled: false,
      chatEnabled: false,
    });
    for (const path of [
      "rooms/global",
      "rooms/global/posts/post1",
      "rooms/global/posts/post1/comments/comment1",
      "rooms/global/messages/message1",
      "contentOwners/post1",
      "roomAliases/global/members/bob",
      "reports/report1",
    ])
      batch.set(doc(store, path), { marker: "private-stage-2-seed" });
    await batch.commit();
  });
});

test("unauthenticated users cannot read or write personal data", async () => {
  const store = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(store, "users/alice")));
  await assertFails(setDoc(doc(store, "users/guest"), profile()));
  await assertFails(
    setDoc(doc(store, "users/alice/saved/visa"), {
      createdAt: serverTimestamp(),
    }),
  );
});
test("owners can read and update their own profile without changing its creation time", async () => {
  const store = db();
  await assertSucceeds(getDoc(doc(store, "users/alice")));
  await assertSucceeds(
    updateDoc(doc(store, "users/alice"), {
      locale: "ko",
      studentType: "g",
      preferredRoom: "country-jp",
      updatedAt: serverTimestamp(),
    }),
  );
  assert.equal((await getDoc(doc(store, "users/alice"))).data().locale, "ko");
  await assertFails(
    updateDoc(doc(store, "users/alice"), {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
});
test("another user's profile, bookmark and checklist are isolated", async () => {
  const store = db();
  for (const path of [
    "users/bob",
    "users/bob/saved/visa",
    "users/bob/checklists/u",
  ]) {
    await assertFails(getDoc(doc(store, path)));
    await assertFails(deleteDoc(doc(store, path)));
  }
  await assertFails(
    updateDoc(doc(store, "users/bob"), {
      locale: "ko",
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(getDocs(collection(store, "users/bob/saved")));
});
test("profile creation validates required fields, values and server timestamps", async () => {
  const store = db("new-member");
  const ref = doc(store, "users/new-member");
  await assertFails(setDoc(ref, { ...profile(), locale: "invalid" }));
  await assertFails(setDoc(ref, { ...profile(), studentType: "admin" }));
  await assertFails(
    setDoc(ref, { ...profile(), preferredRoom: "../../admins" }),
  );
  await assertFails(setDoc(ref, { ...profile(), createdAt: originalTime }));
  await assertFails(setDoc(ref, { locale: "en" }));
  await assertSucceeds(setDoc(ref, profile()));
});
test("users cannot inject roles, email or administrative fields into profiles", async () => {
  const store = db();
  for (const extra of [
    { role: "admin" },
    { admin: true },
    { email: "private@example.com" },
    { suspended: false },
  ])
    await assertFails(
      updateDoc(doc(store, "users/alice"), {
        ...extra,
        updatedAt: serverTimestamp(),
      }),
    );
  await assertFails(
    setDoc(doc(db("new-member"), "users/new-member"), {
      ...profile(),
      role: "admin",
    }),
  );
});
test("no browser account, including an admin, can grant itself or others administrative privileges", async () => {
  for (const store of [db(), db("operator"), db("attacker", { admin: true })]) {
    await assertFails(setDoc(doc(store, "admins/alice"), { role: "admin" }));
    await assertFails(deleteDoc(doc(store, "admins/operator")));
    await assertFails(
      setDoc(doc(store, "moderation/bob"), { status: "active" }),
    );
  }
  await assertSucceeds(getDoc(doc(db("operator"), "admins/operator")));
  await assertFails(getDoc(doc(db(), "admins/operator")));
  await assertFails(getDocs(collection(db("operator"), "admins")));
});
test("user enumeration and arbitrary nested collections are denied", async () => {
  await assertFails(getDocs(collection(db(), "users")));
  await assertFails(
    setDoc(doc(db(), "users/alice/unknown/record"), { data: "not-allowed" }),
  );
  await assertFails(
    setDoc(doc(db(), "users/alice/blocks/someone"), {
      createdAt: serverTimestamp(),
    }),
  );
});
test("all existing catalog topic IDs can be saved, read and removed by their owner", async () => {
  const store = db();
  const batch = writeBatch(store);
  for (const item of RESOURCES)
    batch.set(doc(store, `users/alice/saved/${item.id}`), {
      createdAt: serverTimestamp(),
    });
  await assertSucceeds(batch.commit());
  const snapshot = await assertSucceeds(
    getDocs(collection(store, "users/alice/saved")),
  );
  assert.equal(snapshot.size, 45);
  await assertSucceeds(deleteDoc(doc(store, "users/alice/saved/visa")));
});
test("unknown bookmarks and extra fields are denied", async () => {
  const store = db();
  await assertFails(
    setDoc(doc(store, "users/alice/saved/nonexistent"), {
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    setDoc(doc(store, "users/alice/saved/visa"), {
      createdAt: serverTimestamp(),
      ownerId: "bob",
    }),
  );
  await assertFails(
    setDoc(doc(store, "users/alice/saved/visa"), { createdAt: originalTime }),
  );
});
test("bookmark metadata cannot be overwritten or transferred", async () => {
  const store = db("bob");
  await assertFails(
    updateDoc(doc(store, "users/bob/saved/visa"), {
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    setDoc(doc(db(), "users/bob/saved/credits"), {
      createdAt: serverTimestamp(),
    }),
  );
});
test("valid checklist items are restricted to each student type", async () => {
  const store = db();
  for (const [type, completed] of [
    ["u", ["checkC1", "checkC7"]],
    ["g", ["checkG1", "checkG5"]],
    ["e", ["checkE1"]],
    ["l", ["checkL2"]],
  ]) {
    await assertSucceeds(
      setDoc(doc(store, `users/alice/checklists/${type}`), {
        completed,
        updatedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(getDoc(doc(store, `users/alice/checklists/${type}`)));
  }
  await assertSucceeds(deleteDoc(doc(store, "users/alice/checklists/u")));
});
test("forged checklist types, cross-type keys, duplicates and stale timestamps are rejected", async () => {
  const store = db();
  for (const [type, completed] of [
    ["admin", []],
    ["u", ["checkG1"]],
    ["u", ["checkC1", "checkC1"]],
    ["g", ["unknown"]],
  ])
    await assertFails(
      setDoc(doc(store, `users/alice/checklists/${type}`), {
        completed,
        updatedAt: serverTimestamp(),
      }),
    );
  await assertFails(
    setDoc(doc(store, "users/alice/checklists/u"), {
      completed: ["checkC1"],
      updatedAt: originalTime,
    }),
  );
  await assertFails(
    setDoc(doc(store, "users/alice/checklists/u"), {
      completed: [],
      updatedAt: serverTimestamp(),
      approvedByUniversity: true,
    }),
  );
});
test("paused community and retired anonymous identity mappings are closed to ordinary accounts", async () => {
  for (const store of [
    env.unauthenticatedContext().firestore(),
    db(),
    db("attacker", { admin: true }),
  ]) {
    for (const path of [
      "rooms/global",
      "rooms/global/posts/post1",
      "rooms/global/posts/post1/comments/comment1",
      "rooms/global/messages/message1",
      "contentOwners/post1",
      "roomAliases/global/members/bob",
      "reports/report1",
    ]) {
      await assertFails(getDoc(doc(store, path)));
      await assertFails(setDoc(doc(store, path), { bypass: true }));
    }
  }
});
test("only the public feature document is guest-readable and only administrators can pause service", async () => {
  const store = env.unauthenticatedContext().firestore();
  const snapshot = await assertSucceeds(
    getDoc(doc(store, "serviceConfig/public")),
  );
  assert.deepEqual(snapshot.data(), {
    communityEnabled: false,
    chatEnabled: false,
  });
  await assertFails(getDocs(collection(store, "serviceConfig")));
  await assertFails(
    setDoc(doc(db("alice"), "serviceConfig/public"), {
      communityEnabled: true,
      chatEnabled: true,
    }),
  );
  await assertSucceeds(setDoc(doc(db("operator"),"serviceConfig/public"),{communityEnabled:true,chatEnabled:false}));
});
test("profile deletion cannot leave a misleading partially deleted account", async () => {
  await assertFails(deleteDoc(doc(db(), "users/alice")));
});

test("deletion requires a fresh owner login and cannot delete another account or operator records", async () => {
  const recent = { auth_time: Math.floor(Date.now() / 1000) };
  await assertFails(setDoc(doc(db("alice", { auth_time: 1 }), "accountDeletions/alice"), { requestedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(db("alice", recent), "accountDeletions/bob"), { requestedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(db("operator", recent), "accountDeletions/operator"), { requestedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(db("bob", recent), "accountDeletions/bob"), { requestedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(db("alice", recent), "accountDeletions/alice"), { requestedAt: serverTimestamp(), bypass: true }));
  await assertSucceeds(setDoc(doc(db("alice", recent), "accountDeletions/alice"), { requestedAt: serverTimestamp() }));
  await assertSucceeds(deleteDoc(doc(db("alice", recent), "users/alice")));
});

test("a deletion marker cannot be removed or used to recreate profile and private records", async () => {
  const store = db("alice", { auth_time: Math.floor(Date.now() / 1000) });
  await assertSucceeds(setDoc(doc(store, "accountDeletions/alice"), { requestedAt: serverTimestamp() }));
  await assertSucceeds(getDoc(doc(store, "accountDeletions/alice")));
  await assertFails(getDoc(doc(db("bob"), "accountDeletions/alice")));
  await assertFails(getDocs(collection(store, "accountDeletions")));
  await assertFails(updateDoc(doc(store, "accountDeletions/alice"), { requestedAt: serverTimestamp() }));
  await assertFails(deleteDoc(doc(store, "accountDeletions/alice")));
  await assertFails(updateDoc(doc(store, "users/alice"), { locale: "ko", updatedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(store, "users/alice/saved/visa"), { createdAt: serverTimestamp() }));
  await assertFails(setDoc(doc(store, "users/alice/checklists/u"), { completed: [], updatedAt: serverTimestamp() }));
  await assertSucceeds(deleteDoc(doc(store, "users/alice")));
  await assertFails(setDoc(doc(store, "users/alice"), profile()));
});
