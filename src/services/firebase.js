import { readFirebaseConfig } from "./firebaseConfig.js";

let authPromise, servicesPromise;
export function getFirebaseStatus() {
  return readFirebaseConfig(import.meta.env || {});
}

// Explicit, lazy initialization. The existing static guide does not require Firebase.
export async function getFirebaseAuthServices() {
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
  if (!authPromise)
    authPromise = (async () => {
      const [{ initializeApp, getApps }, { getAuth, connectAuthEmulator }] =
        await Promise.all([import("firebase/app"), import("firebase/auth")]);
      const app =
        getApps().find((item) => item.name === "ku-bridge-web") ||
        initializeApp(settings.config, "ku-bridge-web");
      const auth = getAuth(app);
      if (settings.useEmulators) {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", {
          disableWarnings: true,
        });
      }
      return { app, auth };
    })().catch((error) => {
      authPromise = undefined;
      throw error;
    });
  return authPromise;
}

// Guests restore only Auth; Firestore is loaded after a user needs account data.
export async function getFirebaseServices() {
  const services = await getFirebaseAuthServices();
  if (!services) return null;
  if (!servicesPromise)
    servicesPromise = (async () => {
      const { getFirestore, connectFirestoreEmulator } = await import(
        "firebase/firestore"
      );
      const db = getFirestore(services.app);
      if (getFirebaseStatus().useEmulators)
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
      return { ...services, db };
    })().catch((error) => {
      servicesPromise = undefined;
      throw error;
    });
  return servicesPromise;
}
