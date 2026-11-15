import { useSyncExternalStore } from "react";
export function useAuth(service) {
  return useSyncExternalStore(
    service.subscribe,
    service.getSnapshot,
    service.getSnapshot,
  );
}
