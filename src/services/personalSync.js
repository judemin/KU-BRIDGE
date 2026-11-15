import { getFirebaseServices, getFirebaseStatus } from "./firebase.js";
import { CHECK_ITEMS } from "../config.js";
import { RESOURCES } from "../data.js";
const topicIds = new Set(RESOURCES.map((item) => item.id));
export function personalDiff(before, after) {
  const savedAdd = after.saved.filter(
    (id) => topicIds.has(id) && !before.saved.includes(id),
  );
  const savedRemove = before.saved.filter((id) => !after.saved.includes(id));
  const checked = {};
  for (const [type, keys] of Object.entries(CHECK_ITEMS))
    for (const key of keys) {
      const id = `${type}:${key}`;
      if (!!before.checked[id] !== !!after.checked[id])
        (checked[type] ||= {})[key] = !!after.checked[id];
    }
  return { savedAdd, savedRemove, checked };
}
export function createPersonalSync({
  getServices = getFirebaseServices,
  loadDb = () => import("firebase/firestore"),
  available = () => getFirebaseStatus().status === "ready",
} = {}) {
  const api = async (uid) => {
    const [services, d] = await Promise.all([getServices(), loadDb()]);
    if (!services || services.auth.currentUser?.uid !== uid)
      throw Object.assign(new Error("Session changed"), {
        code: "permission-denied",
      });
    return { ...services, d };
  };
  return {
    available,
    subscribe(uid, next, error) {
      let stopped = false,
        stops = [],
        saved,
        checked;
      void api(uid)
        .then(({ db, d }) => {
          if (stopped) return;
          const emit = () => {
            if (!stopped && saved && checked) next({ saved, checked });
          };
          stops.push(
            d.onSnapshot(
              d.collection(db, "users", uid, "saved"),
              (snapshot) => {
                saved = snapshot.docs
                  .map((item) => item.id)
                  .filter((id) => topicIds.has(id));
                emit();
              },
              error,
            ),
          );
          stops.push(
            d.onSnapshot(
              d.collection(db, "users", uid, "checklists"),
              (snapshot) => {
                checked = {};
                snapshot.docs.forEach((item) => {
                  for (const key of item.data().completed || [])
                    if (CHECK_ITEMS[item.id]?.includes(key))
                      checked[`${item.id}:${key}`] = true;
                });
                emit();
              },
              error,
            ),
          );
        })
        .catch((err) => {
          if (!stopped) error(err);
        });
      return () => {
        stopped = true;
        stops.forEach((stop) => stop());
      };
    },
    async mutate(uid, change) {
      const { auth, db, d } = await api(uid);
      await d.runTransaction(db, async (transaction) => {
        const ids = [...new Set([...change.savedAdd, ...change.savedRemove])];
        const topics = await Promise.all(
          ids.map((id) =>
            transaction.get(d.doc(db, "users", uid, "saved", id)),
          ),
        );
        const types = Object.keys(change.checked);
        const lists = await Promise.all(
          types.map((type) =>
            transaction.get(d.doc(db, "users", uid, "checklists", type)),
          ),
        );
        if (auth.currentUser?.uid !== uid)
          throw Object.assign(new Error("Session changed"), {
            code: "permission-denied",
          });
        ids.forEach((id, index) => {
          const ref = d.doc(db, "users", uid, "saved", id);
          if (change.savedAdd.includes(id) && !topics[index].exists())
            transaction.set(ref, { createdAt: d.serverTimestamp() });
          else if (change.savedRemove.includes(id) && topics[index].exists())
            transaction.delete(ref);
        });
        types.forEach((type, index) => {
          const completed = new Set(
            lists[index].exists() ? lists[index].data().completed : [],
          );
          for (const [key, value] of Object.entries(change.checked[type])) {
            if (!CHECK_ITEMS[type]?.includes(key)) continue;
            if (value) completed.add(key);
            else completed.delete(key);
          }
          transaction.set(d.doc(db, "users", uid, "checklists", type), {
            completed: [...completed].sort(),
            updatedAt: d.serverTimestamp(),
          });
        });
      });
    },
  };
}
export const personalSync = createPersonalSync();
