import { getFirebaseStatus } from "./firebase.js";

// Authentication UI/session subscriptions are introduced in stage 4.
// Configured services do not imply an authenticated user.
export function getAuthState() {
  const settings = getFirebaseStatus();
  return {
    status: settings.status === "ready" ? "not-initialized" : settings.status,
    user: null,
  };
}
