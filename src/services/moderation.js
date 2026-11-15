import { getFirebaseServices } from "./firebase.js";
import { contentRef } from "./community.js";
import { contentKey, ROOM_IDS } from "../communityConfig.js";
export function createModerationService({
  getServices = getFirebaseServices,
  loadDb = () => import("firebase/firestore"),
} = {}) {
  const api = async (uid) => {
    const [services, d] = await Promise.all([getServices(), loadDb()]);
    if (!services || services.auth.currentUser?.uid !== uid)
      throw Object.assign(new Error("Session changed"), {
        code: "permission-denied",
      });
    return { ...services, d };
  };
  const audit = (batch, db, d, uid, action, target, reason) =>
    batch.set(d.doc(d.collection(db, "moderationEvents")), {
      actorId: uid,
      action,
      target,
      reason,
      createdAt: d.serverTimestamp(),
    });
  return {
    async reports(uid, status = "open", cursor) {
      const { db, d } = await api(uid);
      const snapshot = await d.getDocs(
        d.query(
          d.collection(db, "reports"),
          d.where("status", "==", status),
          d.orderBy("createdAt", "desc"),
          ...(cursor ? [d.startAfter(cursor)] : []),
          d.limit(20),
        ),
      );
      return {
        items: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        cursor: snapshot.docs.at(-1),
        hasMore: snapshot.size === 20,
      };
    },
    async events(uid) {
      const { db, d } = await api(uid);
      return (
        await d.getDocs(
          d.query(
            d.collection(db, "moderationEvents"),
            d.orderBy("createdAt", "desc"),
            d.limit(30),
          ),
        )
      ).docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    async target(uid, item) {
      const { db, d } = await api(uid);
      const snapshot = await d.getDoc(contentRef(db, d, item));
      return snapshot.exists() ? snapshot.data() : null;
    },
    async moderate(uid, item, hidden, reason, reportId) {
      const { db, d } = await api(uid);
      const batch = d.writeBatch(db);
      batch.update(contentRef(db, d, item), {
        status: hidden ? "hidden" : "visible",
        updatedAt: d.serverTimestamp(),
      });
      if (reportId)
        batch.update(d.doc(db, "reports", reportId), {
          status: "reviewed",
          resolution: reason,
          updatedAt: d.serverTimestamp(),
        });
      audit(
        batch,
        db,
        d,
        uid,
        hidden ? "hide" : "restore",
        contentKey(item.roomId, item.kind, item.parentId, item.contentId),
        reason,
      );
      await batch.commit();
    },
    async closeReport(uid, id, reason) {
      const { db, d } = await api(uid);
      const batch = d.writeBatch(db);
      batch.update(d.doc(db, "reports", id), {
        status: "closed",
        resolution: reason,
        updatedAt: d.serverTimestamp(),
      });
      audit(batch, db, d, uid, "report_close", id, reason);
      await batch.commit();
    },
    async restrict(uid, userId, suspended, reason) {
      const { db, d } = await api(uid);
      const reservation = await d.getDoc(d.doc(db, "userIds", userId));
      if (!reservation.exists() || reservation.data().ownerId === uid)
        throw Object.assign(new Error("Invalid target"), {
          code: "permission-denied",
        });
      const batch = d.writeBatch(db);
      batch.set(d.doc(db, "moderation", reservation.data().ownerId), {
        status: suspended ? "suspended" : "active",
        reason: reason.slice(0, 500),
        updatedAt: d.serverTimestamp(),
      });
      audit(
        batch,
        db,
        d,
        uid,
        suspended ? "suspend" : "resume",
        userId,
        reason,
      );
      await batch.commit();
    },
    async flags(uid, flags) {
      const { db, d } = await api(uid);
      const batch = d.writeBatch(db);
      batch.set(d.doc(db, "serviceConfig", "public"), flags);
      audit(
        batch,
        db,
        d,
        uid,
        "pause",
        "serviceConfig/public",
        JSON.stringify(flags),
      );
      await batch.commit();
    },
    async pruneMessages(uid) {
      const { db, d } = await api(uid);
      let removed = 0;
      const cutoff = d.Timestamp.fromMillis(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      );
      for (const room of ROOM_IDS) {
        const old = await d.getDocs(
          d.query(
            d.collection(db, "rooms", room, "messages"),
            d.where("createdAt", "<", cutoff),
            d.orderBy("createdAt", "asc"),
            d.limit(50),
          ),
        );
        if (old.empty) continue;
        const batch = d.writeBatch(db);
        old.docs.forEach((doc) => {
          batch.delete(doc.ref);
          batch.delete(
            d.doc(db, "contentOwners", contentKey(room, "message", "", doc.id)),
          );
        });
        await batch.commit();
        removed += old.size;
      }
      return removed;
    },
  };
}
export const moderationService = createModerationService();
