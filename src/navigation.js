import { useSyncExternalStore } from "react";

export const PAGE_PATHS = Object.freeze({
  home: "/",
  explore: "/guide",
  help: "/contacts",
  checklist: "/my/checklist",
  saved: "/my/saved",
  account: "/account",
  privacy: "/privacy",
  community: "/community",
  chat: "/chat",
  postWrite: "/community/new",
  admin: "/admin",
});
const LOCATION_EVENT = "ku-bridge:navigate";

export function pageUrl(page, params = {}) {
  const path = PAGE_PATHS[page];
  if (!path) throw new Error(`Unknown page: ${page}`);
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    )
      search.set(key, String(value));
  }
  return path + (search.size ? `?${search}` : "");
}

export function parseLocation(location) {
  const url = new URL(location, "https://ku-bridge.invalid");
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const page =
    Object.keys(PAGE_PATHS).find((key) => PAGE_PATHS[key] === path) ||
    "notFound";
  return { page, params: url.searchParams, pathname: path };
}

export function changeLocation(page, params, { replace = false } = {}) {
  const url = pageUrl(page, params);
  if (url === window.location.pathname + window.location.search) return;
  window.history[replace ? "replaceState" : "pushState"](null, "", url);
  window.dispatchEvent(new window.Event(LOCATION_EVENT));
}

function subscribe(listener) {
  window.addEventListener("popstate", listener);
  window.addEventListener(LOCATION_EVENT, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(LOCATION_EVENT, listener);
  };
}
const snapshot = () => window.location.pathname + window.location.search;
export function useLocation() {
  return useSyncExternalStore(subscribe, snapshot, () => "/");
}
