import {
  getFirebaseServices,
  getFirebaseAuthServices,
  getFirebaseStatus,
} from "./firebase.js";
import {
  COUNTRY_CODES,
  normalizeUserId,
  validUserId,
} from "../communityConfig.js";
import { cleanupCommunityAccount } from "./community.js";

export function authErrorKey(error) {
  const code = typeof error === "string" ? error : error?.code;
  return (
    {
      "auth/invalid-email": "authErrorEmail",
      "auth/invalid-credential": "authErrorCredentials",
      "auth/wrong-password": "authErrorCredentials",
      "auth/user-not-found": "authErrorCredentials",
      "auth/email-already-in-use": "authErrorEmailUsed",
      "auth/weak-password": "authErrorPassword",
      "auth/password-does-not-meet-requirements": "authErrorPassword",
      "auth/too-many-requests": "authErrorRate",
      "auth/network-request-failed": "authErrorNetwork",
      unavailable: "authErrorNetwork",
      "auth/user-disabled": "authErrorDisabled",
      "auth/requires-recent-login": "authErrorRecent",
      "auth/operation-not-allowed": "authErrorUnavailable",
      "auth/unauthorized-continue-uri": "authErrorUnavailable",
      "auth/invalid-continue-uri": "authErrorUnavailable",
      "auth/deletion-pending": "authDeletionPending",
      "auth/protected-account": "authErrorProtected",
      "auth/session-changed": "authErrorRecent",
      "permission-denied": "authErrorPermission",
      "auth/user-id-invalid": "userIdInvalid",
      "auth/user-id-taken": "userIdTaken",
      "auth/user-id-locked": "userIdLocked",
      "auth/nationality-required": "nationalityRequired",
    }[code] || "authErrorGeneric"
  );
}

const fail = (code) => {
  throw Object.assign(new Error(code), { code });
};
const publicUser = (user) =>
  user
    ? { uid: user.uid, email: user.email, emailVerified: user.emailVerified }
    : null;
const emptyState = (status) => ({
  status,
  user: null,
  profile: null,
  profileStatus: "idle",
  deletionPending: false,
  errorKey: null,
  isAdmin: false,
  suspended: false,
});

// Emulator tests inject real local SDK instances; the production path stays lazy.
export function createAuthService({
  getServices = getFirebaseAuthServices,
  getDatabase = getFirebaseServices,
  getSettings = getFirebaseStatus,
  loadAuth = () => import("firebase/auth"),
  loadDb = () => import("firebase/firestore"),
} = {}) {
  const configured = getSettings().status;
  let state = emptyState(configured === "ready" ? "loading" : configured);
  const listeners = new Set();
  let connection,
    databaseConnection,
    startPromise,
    observer,
    revision = 0,
    disposed = false;
  const publish = (changes) => {
    state = { ...state, ...changes };
    listeners.forEach((listener) => listener());
  };
  const connect = async () => {
    if (!connection)
      connection = Promise.all([getServices(), loadAuth()])
        .then(([services, authSdk]) => {
          if (!services) fail("auth/operation-not-allowed");
          return { ...services, authSdk };
        })
        .catch((error) => {
          connection = undefined;
          throw error;
        });
    return connection;
  };
  const connectDb = async () => {
    if (!databaseConnection)
      databaseConnection = connect()
        .then(async (services) => {
          const [database, dbSdk] = await Promise.all([
            services.db ? services : getDatabase(),
            loadDb(),
          ]);
          return { ...services, db: database.db, dbSdk };
        })
        .catch((error) => {
          databaseConnection = undefined;
          throw error;
        });
    return databaseConnection;
  };
  const readAccount = async (user, version) => {
    const { db, dbSdk: d } = await connectDb();
    const [profile, deletion, admin, moderation] = await Promise.all([
      d.getDocFromServer(d.doc(db, "users", user.uid)),
      d.getDocFromServer(d.doc(db, "accountDeletions", user.uid)),
      d.getDocFromServer(d.doc(db, "admins", user.uid)),
      d.getDocFromServer(d.doc(db, "moderation", user.uid)),
    ]);
    if (revision !== version || disposed) return;
    publish({
      profile: profile.exists() ? profile.data() : null,
      profileStatus: profile.exists() ? "ready" : "missing",
      deletionPending: deletion.exists(),
      isAdmin: admin.exists() && admin.data().role === "admin",
      suspended:
        moderation.exists() && moderation.data().status === "suspended",
      errorKey: null,
    });
  };
  const acceptUser = async (user) => {
    if (disposed) return;
    const version = ++revision;
    publish({
      ...emptyState(user ? "authenticated" : "guest"),
      user: publicUser(user),
      profileStatus: user ? "loading" : "idle",
    });
    if (user) {
      try {
        await readAccount(user, version);
      } catch (error) {
        if (version === revision && !disposed)
          publish({ profileStatus: "error", errorKey: authErrorKey(error) });
      }
    }
  };
  const start = () => {
    if (configured !== "ready" || disposed) return Promise.resolve();
    if (!startPromise)
      startPromise = connect()
        .then(({ auth, authSdk: a }) => {
          if (!disposed)
            observer = a.onIdTokenChanged(
              auth,
              (user) => {
                void acceptUser(user);
              },
              (error) =>
                publish({
                  ...emptyState("error"),
                  errorKey: authErrorKey(error),
                }),
            );
        })
        .catch((error) => {
          startPromise = undefined;
          publish({ ...emptyState("error"), errorKey: authErrorKey(error) });
        });
    return startPromise;
  };
  const requireUser = async () => {
    const services = await connect();
    const user = services.auth.currentUser;
    if (!user) fail("auth/requires-recent-login");
    return { ...services, user };
  };
  const assertCurrent = (auth, user) => {
    if (auth.currentUser?.uid !== user.uid) fail("auth/session-changed");
  };
  const language = (auth, locale) => {
    auth.languageCode = ["en", "ko", "zh", "ja"].includes(locale)
      ? locale
      : "en";
  };
  const refresh = async () => {
    const { auth, user, authSdk: a } = await requireUser();
    await a.reload(user);
    assertCurrent(auth, user);
    await a.getIdToken(user, true);
    await acceptUser(user);
  };
  const savePreferences = async (preferences) => {
    const { auth, user } = await requireUser();
    const { db, dbSdk: d } = await connectDb();
    const { locale, studentType, preferredRoom } = preferences;
    if (
      !["en", "ko", "zh", "ja"].includes(locale) ||
      !["all", "u", "g", "e", "l"].includes(studentType) ||
      !/^(global|anglophone|country-[a-z]{2})$/.test(preferredRoom)
    )
      fail("permission-denied");
    const ref = d.doc(db, "users", user.uid);
    await d.runTransaction(db, async (transaction) => {
      const deletion = await transaction.get(
        d.doc(db, "accountDeletions", user.uid),
      );
      const existing = await transaction.get(ref);
      assertCurrent(auth, user);
      if (deletion.exists()) fail("auth/deletion-pending");
      const old = existing.exists() ? existing.data() : {};
      const userId = normalizeUserId(preferences.userId ?? old.userId ?? "");
      const nationality = String(
        preferences.nationality ?? old.nationality ?? "",
      ).toUpperCase();
      let reservation;
      if (userId || nationality) {
        if (!validUserId(userId)) fail("auth/user-id-invalid");
        if (!COUNTRY_CODES.includes(nationality))
          fail("auth/nationality-required");
        if (old.userId && old.userId !== userId) fail("auth/user-id-locked");
        try {
          reservation = await transaction.get(d.doc(db, "userIds", userId));
        } catch (error) {
          if (error.code === "permission-denied") fail("auth/user-id-taken");
          throw error;
        }
        if (
          reservation.exists() &&
          (reservation.data().ownerId !== user.uid ||
            reservation.data().state !== "active")
        )
          fail("auth/user-id-taken");
      }
      transaction.set(ref, {
        locale,
        studentType,
        preferredRoom,
        createdAt: existing.exists()
          ? existing.data().createdAt
          : d.serverTimestamp(),
        updatedAt: d.serverTimestamp(),
        ...(userId ? { userId, nationality } : {}),
      });
      if (userId) {
        if (!reservation.exists())
          transaction.set(d.doc(db, "userIds", userId), {
            ownerId: user.uid,
            state: "active",
            createdAt: d.serverTimestamp(),
          });
        transaction.set(d.doc(db, "profiles", userId), {
          userId,
          nationality,
          updatedAt: d.serverTimestamp(),
        });
      }
    });
    assertCurrent(auth, user);
    await acceptUser(user);
  };
  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      void start();
      return () => listeners.delete(listener);
    },
    start,
    async retry() {
      if (state.user) return refresh();
      observer?.();
      observer = undefined;
      publish(emptyState("loading"));
      startPromise = undefined;
      await start();
    },
    async register({ email, password, preferences }) {
      const { auth, authSdk: a } = await connect();
      await a.setPersistence(auth, a.browserLocalPersistence);
      language(auth, preferences.locale);
      if (password.length < 8) fail("auth/weak-password");
      const { user } = await a.createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const result = { profileSaved: true, verificationSent: true };
      try {
        await savePreferences(preferences);
      } catch (error) {
        result.profileSaved = false;
        result.profileError = authErrorKey(error);
      }
      try {
        assertCurrent(auth, user);
        await a.sendEmailVerification(user);
      } catch (error) {
        result.verificationSent = false;
        result.verificationError = authErrorKey(error);
      }
      return result;
    },
    async login(email, password, locale) {
      const { auth, authSdk: a } = await connect();
      await a.setPersistence(auth, a.browserLocalPersistence);
      language(auth, locale);
      await a.signInWithEmailAndPassword(auth, email.trim(), password);
    },
    async logout() {
      const { auth, authSdk: a } = await connect();
      await a.signOut(auth);
    },
    async sendVerification(locale) {
      const { auth, user, authSdk: a } = await requireUser();
      language(auth, locale);
      await a.sendEmailVerification(user);
    },
    async resetPassword(email, locale) {
      const { auth, authSdk: a } = await connect();
      language(auth, locale);
      try {
        await a.sendPasswordResetEmail(auth, email.trim());
      } catch (error) {
        if (error.code !== "auth/user-not-found") throw error;
      }
    },
    refresh,
    savePreferences,
    async deleteAccount(password) {
      const { auth, user, authSdk: a } = await requireUser();
      const { db, dbSdk: d } = await connectDb();
      await a.reauthenticateWithCredential(
        user,
        a.EmailAuthProvider.credential(user.email, password),
      );
      assertCurrent(auth, user);
      await a.getIdToken(user, true);
      const deletionRef = d.doc(db, "accountDeletions", user.uid);
      await d.runTransaction(db, async (transaction) => {
        const deletion = await transaction.get(deletionRef);
        const admin = await transaction.get(d.doc(db, "admins", user.uid));
        const moderation = await transaction.get(
          d.doc(db, "moderation", user.uid),
        );
        assertCurrent(auth, user);
        if (
          admin.exists() ||
          (moderation.exists() && moderation.data().status === "suspended")
        )
          fail("auth/protected-account");
        if (!deletion.exists())
          transaction.set(deletionRef, { requestedAt: d.serverTimestamp() });
      });
      revision++;
      publish({ deletionPending: true });
      await cleanupCommunityAccount({
        db,
        d,
        uid: user.uid,
        assertCurrent: () => assertCurrent(auth, user),
      });
      // Keep this cleanup in sync before introducing new personal collections.
      const snapshots = await Promise.all(
        ["saved", "checklists", "blocks", "limits"].map((name) =>
          d.getDocs(d.collection(db, "users", user.uid, name)),
        ),
      );
      const refs = snapshots.flatMap((snapshot) =>
        snapshot.docs.map((item) => item.ref),
      );
      for (let offset = 0; offset < refs.length; offset += 400) {
        assertCurrent(auth, user);
        const batch = d.writeBatch(db);
        refs.slice(offset, offset + 400).forEach((ref) => batch.delete(ref));
        await batch.commit();
      }
      assertCurrent(auth, user);
      const profile = await d.getDocFromServer(d.doc(db, "users", user.uid));
      const finalBatch = d.writeBatch(db);
      if (profile.exists() && profile.data().userId) {
        finalBatch.delete(d.doc(db, "profiles", profile.data().userId));
        finalBatch.update(d.doc(db, "userIds", profile.data().userId), {
          state: "retired",
        });
      }
      const moderation = await d.getDocFromServer(
        d.doc(db, "moderation", user.uid),
      );
      if (moderation.exists() && moderation.data().status === "active")
        finalBatch.delete(moderation.ref);
      finalBatch.delete(d.doc(db, "users", user.uid));
      await finalBatch.commit();
      assertCurrent(auth, user);
      await a.deleteUser(user);
      await acceptUser(null);
    },
    dispose() {
      disposed = true;
      revision++;
      observer?.();
      listeners.clear();
    },
  };
}

export const authService = createAuthService();
