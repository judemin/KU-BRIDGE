import { useEffect, useRef, useState } from "react";
import { usePersonalState } from "./usePersonalState.js";
import { personalSync, personalDiff } from "../services/personalSync.js";
import { readStorage, writeStorage } from "../storage.js";
export function useSyncedPersonal(auth, service = personalSync) {
  const [guestSaved, setGuestSaved] = usePersonalState("saved", []);
  const [guestChecked, setGuestChecked] = usePersonalState("checked", {});
  const uid = auth.user?.uid && service.available() ? auth.user.uid : null;
  const [remote, setRemote] = useState(null),
    [pending, setPending] = useState(false),
    [epoch, setEpoch] = useState(0),
    [choice, setChoice] = useState(null);
  const lock = useRef(false),
    currentUid = useRef(uid);
  currentUid.current = uid;
  useEffect(() => {
    setPending(false);
    lock.current = false;
    setChoice(
      uid ? { uid, done: readStorage(`migration:${uid}`, false) } : null,
    );
    if (!uid) {
      setRemote(null);
      return;
    }
    let active = true;
    setRemote({ uid, saved: [], checked: {}, status: "loading", error: null });
    const stop = service.subscribe(
      uid,
      (value) => {
        if (active) setRemote({ uid, ...value, status: "ready", error: null });
      },
      (error) => {
        if (active)
          setRemote((old) => ({
            uid,
            saved: [],
            checked: {},
            ...old,
            status: "error",
            error,
          }));
      },
    );
    return () => {
      active = false;
      stop();
    };
  }, [uid, service, epoch]);
  const account = !!uid;
  const view = account
    ? remote?.uid === uid
      ? remote
      : { saved: [], checked: {}, status: "loading" }
    : { saved: guestSaved, checked: guestChecked, status: "guest" };
  const apply = async (saved, checked, merged = false) => {
    if (!account) {
      setGuestSaved(saved);
      setGuestChecked(checked);
      return;
    }
    if (lock.current || view.status !== "ready" || auth.deletionPending) return;
    lock.current = true;
    setPending(true);
    try {
      await service.mutate(uid, personalDiff(view, { saved, checked }));
      if (currentUid.current === uid) {
        if (merged) {
          writeStorage(`migration:${uid}`, true);
          setChoice({ uid, done: true });
        }
        setRemote((old) => (old?.uid === uid ? { ...old, error: null } : old));
      }
    } catch (error) {
      if (currentUid.current === uid)
        setRemote((old) => (old?.uid === uid ? { ...old, error } : old));
    } finally {
      if (currentUid.current === uid) {
        lock.current = false;
        setPending(false);
      }
    }
  };
  return {
    saved: view.saved,
    checked: view.checked,
    setSaved: (update) => {
      const next = typeof update === "function" ? update(view.saved) : update;
      void apply(next, view.checked);
    },
    setChecked: (update) => {
      const next = typeof update === "function" ? update(view.checked) : update;
      void apply(view.saved, next);
    },
    personalStatus: view.status,
    personalBusy:
      pending || (account && (view.status !== "ready" || auth.deletionPending)),
    personalError: view.error,
    retryPersonal: () => setEpoch((value) => value + 1),
    needsMigration:
      account &&
      view.status === "ready" &&
      choice?.uid === uid &&
      !choice.done &&
      (guestSaved.length > 0 || Object.values(guestChecked).some(Boolean)),
    mergeGuest: () =>
      apply(
        [...new Set([...view.saved, ...guestSaved])],
        {
          ...guestChecked,
          ...Object.fromEntries(
            Object.entries(view.checked).filter(([, value]) => value),
          ),
        },
        true,
      ),
    keepSeparate: () => {
      writeStorage(`migration:${uid}`, true);
      setChoice({ uid, done: true });
    },
  };
}
