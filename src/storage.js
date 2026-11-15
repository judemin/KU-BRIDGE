const PREFIX = "ku-bridge-independent-v1:";

export function writeStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    if (Array.isArray(fallback))
      return Array.isArray(value) &&
        value.every((item) => typeof item === "string")
        ? value
        : fallback;
    if (fallback && typeof fallback === "object")
      return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : fallback;
    return typeof value === typeof fallback ? value : fallback;
  } catch {
    return fallback;
  }
}
