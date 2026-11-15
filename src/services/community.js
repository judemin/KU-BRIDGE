import { getFirebaseServices } from "./firebase.js";
import {
  contentKey,
  identityReady,
  validRoom,
  COMMUNITY_LIMITS,
} from "../communityConfig.js";

const failure = (code) => {
  throw Object.assign(new Error(code), { code });
};
export function communityErrorKey(error) {
  return (
    {
      "app/rate-limit": "communityRate",
      "app/identity-required": "identityRequired",
      "app/room-invalid": "communityUnavailable",
      "permission-denied": "communityPermission",
      unavailable: "communityNetwork",
      "resource-exhausted": "communityQuota",
      "auth/network-request-failed": "communityNetwork",
      "app/already-reported": "alreadyReported",
    }[error?.code] || "communityError"
  );
}
export function contentRef(db, d, item) {
  return item.kind === "post"
    ? d.doc(db, "rooms", item.roomId, "posts", item.contentId)
    : item.kind === "comment"
      ? d.doc(
          db,
          "rooms",
          item.roomId,
          "posts",
          item.parentId,
          "comments",
          item.contentId,
        )
      : d.doc(db, "rooms", item.roomId, "messages", item.contentId);
}
const pack = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data({ serverTimestamps: "estimate" }),
  cursor: snapshot,
});
export function createCommunityService({
  getServices = getFirebaseServices,
  loadDb = () => import("firebase/firestore"),
} = {}) {
  const api = async (uid) => {
    const [services, d] = await Promise.all([getServices(), loadDb()]);
    if (
      !services ||
      !services.auth.currentUser ||
      (uid && services.auth.currentUser.uid !== uid)
    )
      failure("permission-denied");
    return { ...services, d, uid: services.auth.currentUser.uid };
  };
  const watch = (uid, ref, next, error) => {
    let closed = false,
      stop;
    void api(uid)
      .then(({ db, d }) => {
        if (!closed)
          stop = d.onSnapshot(
            ref(db, d),
            (snapshot) => {
              if (!closed) next(snapshot);
            },
            (err) => {
              if (!closed) error(err);
            },
          );
      })
      .catch((err) => {
        if (!closed) error(err);
      });
    return () => {
      closed = true;
      stop?.();
    };
  };
  const queryPage = async (uid, room, kind, parent, cursor, count) => {
    if (!validRoom(room)) failure("app/room-invalid");
    const { db, d } = await api(uid);
    const collection =
      kind === "comment"
        ? d.collection(db, "rooms", room, "posts", parent, "comments")
        : d.collection(
            db,
            "rooms",
            room,
            kind === "post" ? "posts" : "messages",
          );
    const direction = "desc";
    const constraints = [
      d.where("status", "==", "visible"),
      d.orderBy("createdAt", direction),
      ...(cursor ? [d.startAfter(cursor)] : []),
      d.limit(count + 1),
    ];
    const result = await d.getDocs(d.query(collection, ...constraints));
    return {
      items: result.docs.slice(0, count).map(pack),
      cursor: result.docs.slice(0, count).at(-1) || null,
      hasMore: result.size > count,
    };
  };
  return {
    watchFlags: (uid, next, error) =>
      watch(
        uid,
        (db, d) => d.doc(db, "serviceConfig", "public"),
        (snapshot) =>
          next(
            snapshot.exists()
              ? snapshot.data()
              : { communityEnabled: false, chatEnabled: false },
          ),
        error,
      ),
    watchBlocks: (uid, next, error) =>
      watch(
        uid,
        (db, d) => d.collection(db, "users", uid, "blocks"),
        (snapshot) => next(snapshot.docs.map((item) => item.id)),
        error,
      ),
    listPosts: (uid, room, cursor) =>
      queryPage(uid, room, "post", "", cursor, 10),
    olderMessages: (uid, room, cursor) =>
      queryPage(uid, room, "message", "", cursor, 30),
    olderComments: (uid, room, parent, cursor) =>
      queryPage(uid, room, "comment", parent, cursor, 30),
    watchPost: (uid, room, id, next, error) =>
      watch(
        uid,
        (db, d) => d.doc(db, "rooms", room, "posts", id),
        (snapshot) => next(snapshot.exists() ? pack(snapshot) : null),
        error,
      ),
    watchComments: (uid, room, id, next, error) =>
      watch(
        uid,
        (db, d) =>
          d.query(
            d.collection(db, "rooms", room, "posts", id, "comments"),
            d.where("status", "==", "visible"),
            d.orderBy("createdAt", "desc"),
            d.limit(30),
          ),
        (snapshot) => next(snapshot.docs.map(pack)),
        error,
      ),
    watchMessages: (uid, room, next, error) =>
      watch(
        uid,
        (db, d) =>
          d.query(
            d.collection(db, "rooms", room, "messages"),
            d.where("status", "==", "visible"),
            d.orderBy("createdAt", "desc"),
            d.limit(30),
          ),
        (snapshot) => next(snapshot.docs.map(pack)),
        error,
      ),
    async newId(uid) {
      const { db, d } = await api(uid);
      return d.doc(d.collection(db, "contentOwners")).id;
    },
    async publish(
      uid,
      {
        roomId,
        kind,
        parentId = "",
        contentId,
        title = "",
        body,
        category = "general",
      },
    ) {
      if (!validRoom(roomId) || !["post", "comment", "message"].includes(kind))
        failure("app/room-invalid");
      const { db, d, auth } = await api(uid);
      const key = contentKey(roomId, kind, parentId, contentId);
      const item = { roomId, kind, parentId, contentId };
      await d.runTransaction(db, async (transaction) => {
        const owner = await transaction.get(d.doc(db, "contentOwners", key));
        if (owner.exists()) {
          if (owner.data().ownerId !== uid) failure("permission-denied");
          return;
        }
        const profile = await transaction.get(d.doc(db, "users", uid));
        const counter = await transaction.get(
          d.doc(db, "users", uid, "limits", kind),
        );
        if (auth.currentUser?.uid !== uid) failure("permission-denied");
        if (!profile.exists() || !identityReady(profile.data()))
          failure("app/identity-required");
        if (
          counter.exists() &&
          Date.now() - counter.data().lastWriteAt.toMillis() <
            COMMUNITY_LIMITS[kind] * 1000
        )
          failure("app/rate-limit");
        const data = {
          authorId: profile.data().userId,
          nationality: profile.data().nationality,
          body: body.trim(),
          status: "visible",
          createdAt: d.serverTimestamp(),
          updatedAt: d.serverTimestamp(),
          ...(kind === "post" ? { title: title.trim(), category } : {}),
        };
        transaction.set(contentRef(db, d, item), data);
        transaction.set(d.doc(db, "contentOwners", key), {
          ...item,
          ownerId: uid,
          createdAt: d.serverTimestamp(),
        });
        transaction.set(d.doc(db, "users", uid, "limits", kind), {
          targetKey: key,
          lastWriteAt: d.serverTimestamp(),
        });
      });
      return contentId;
    },
    async edit(uid, item, changes) {
      const { db, d } = await api(uid);
      await d.updateDoc(contentRef(db, d, item), {
        body: changes.body.trim(),
        ...(item.kind === "post"
          ? { title: changes.title.trim(), category: changes.category }
          : {}),
        updatedAt: d.serverTimestamp(),
      });
    },
    async remove(uid, item) {
      const { db, d } = await api(uid);
      const batch = d.writeBatch(db);
      removeInBatch(batch, db, d, item);
      await batch.commit();
    },
    async block(uid, userId, blocked) {
      const { db, d } = await api(uid);
      const ref = d.doc(db, "users", uid, "blocks", userId);
      if (blocked) {
        const existing = await d.getDoc(ref);
        if (!existing.exists())
          await d.setDoc(ref, { userId, createdAt: d.serverTimestamp() });
      } else await d.deleteDoc(ref);
    },
    async report(uid, item, reason, details) {
      const { db, d, auth } = await api(uid);
      const reportId =
        uid +
        "~" +
        contentKey(item.roomId, item.kind, item.parentId, item.contentId);
      await d.runTransaction(db, async (transaction) => {
        const previous = await transaction.get(d.doc(db, "reports", reportId));
        const counter = await transaction.get(
          d.doc(db, "users", uid, "limits", "report"),
        );
        if (previous.exists()) failure("app/already-reported");
        if (auth.currentUser?.uid !== uid) failure("permission-denied");
        if (
          counter.exists() &&
          Date.now() - counter.data().lastWriteAt.toMillis() <
            COMMUNITY_LIMITS.report * 1000
        )
          failure("app/rate-limit");
        transaction.set(d.doc(db, "reports", reportId), {
          ...item,
          reporterId: uid,
          reason,
          details: details.trim(),
          status: "open",
          createdAt: d.serverTimestamp(),
          updatedAt: d.serverTimestamp(),
        });
        transaction.set(d.doc(db, "users", uid, "limits", "report"), {
          targetKey: reportId,
          lastWriteAt: d.serverTimestamp(),
        });
      });
    },
    async exportOwn(uid) {
      const { db, d } = await api(uid);
      const result = await d.getDocs(
        d.query(
          d.collection(db, "contentOwners"),
          d.where("ownerId", "==", uid),
        ),
      );
      const items = [];
      for (const doc of result.docs) {
        const snapshot = await d.getDoc(contentRef(db, d, doc.data()));
        if (snapshot.exists())
          items.push({ ...doc.data(), content: snapshot.data() });
      }
      return items;
    },
  };
}
function removeInBatch(batch, db, d, item) {
  const ref = contentRef(db, d, item);
  if (item.kind === "post")
    batch.update(ref, {
      status: "deleted",
      title: "",
      body: "",
      authorId: "",
      nationality: "",
      updatedAt: d.serverTimestamp(),
    });
  else batch.delete(ref);
  batch.delete(
    d.doc(
      db,
      "contentOwners",
      contentKey(item.roomId, item.kind, item.parentId, item.contentId),
    ),
  );
}
export async function cleanupCommunityAccount({ db, d, uid, assertCurrent }) {
  for (;;) {
    const owned = await d.getDocs(
      d.query(
        d.collection(db, "contentOwners"),
        d.where("ownerId", "==", uid),
        d.limit(100),
      ),
    );
    if (owned.empty) break;
    assertCurrent();
    const batch = d.writeBatch(db);
    owned.docs.forEach((doc) => removeInBatch(batch, db, d, doc.data()));
    await batch.commit();
  }
  for (;;) {
    const reports = await d.getDocs(
      d.query(
        d.collection(db, "reports"),
        d.where("reporterId", "==", uid),
        d.limit(100),
      ),
    );
    if (reports.empty) break;
    assertCurrent();
    const batch = d.writeBatch(db);
    reports.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}
export const communityService = createCommunityService();
