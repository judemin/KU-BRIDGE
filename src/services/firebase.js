import { readFirebaseConfig } from "./firebaseConfig.js";

let servicesPromise;
export function getFirebaseStatus() {
  return readFirebaseConfig(import.meta.env || {});
}

// Explicit, lazy initialization. The existing static guide does not require Firebase.
export async function getFirebaseServices() {
  const settings = getFirebaseStatus();
  if (settings.status === "unconfigured") return null;
  if (settings.status !== "ready")
    throw new Error(settings.problems.join("; "));
  if (
    settings.useEmulators &&
    !["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)
  )
    throw new Error(
      "Emulators are only available on a loopback development host",
    );
  if (!servicesPromise)
    servicesPromise = (async () => {
      const [
        { initializeApp, getApps },
        { getAuth, connectAuthEmulator },
        { getFirestore, connectFirestoreEmulator },
      ] = await Promise.all([
        import("firebase/app"),
        import("firebase/auth"),
        import("firebase/firestore"),
      ]);
      const app =
        getApps().find((item) => item.name === "ku-bridge-web") ||
        initializeApp(settings.config, "ku-bridge-web");
      const auth = getAuth(app);
      const db = getFirestore(app);
      if (settings.useEmulators) {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", {
          disableWarnings: true,
        });
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
      }
      return { app, auth, db };
    })().catch((error) => {
      servicesPromise = undefined;
      throw error;
    });
  return servicesPromise;
}
