const FIELDS = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  appId: "VITE_FIREBASE_APP_ID",
};

export function readFirebaseConfig(env = {}) {
  const config = Object.fromEntries(
    Object.entries(FIELDS).map(([field, key]) => [
      field,
      String(env[key] || "").trim(),
    ]),
  );
  const missing = Object.entries(FIELDS)
    .filter(([field]) => !config[field])
    .map(([, key]) => key);
  const problems = [];
  if (
    Object.keys(env).some(
      (key) =>
        /^VITE_/i.test(key) &&
        /PRIVATE_KEY|SERVICE_ACCOUNT|CLIENT_SECRET|ADMIN_SECRET|ACCESS_TOKEN/i.test(
          key,
        ),
    )
  ) {
    problems.push("Administrator credentials must not use VITE_ variables");
  }
  const mode = String(env.VITE_FIREBASE_USE_EMULATORS || "false").trim();
  if (!["true", "false"].includes(mode))
    problems.push("VITE_FIREBASE_USE_EMULATORS must be true or false");
  const useEmulators = mode === "true";
  if (
    useEmulators &&
    (env.DEV !== true || config.projectId !== "demo-ku-bridge")
  )
    problems.push(
      "Emulators require a development build and demo-ku-bridge project",
    );
  if (missing.length === 4 && !useEmulators && !problems.length)
    return {
      status: "unconfigured",
      config: null,
      missing,
      problems,
      useEmulators: false,
    };
  if (missing.length)
    problems.push("Complete all four Firebase web-app identifiers");
  if (
    config.projectId &&
    !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(config.projectId)
  )
    problems.push("Invalid Firebase project ID");
  if (config.projectId.startsWith("demo-") && !useEmulators)
    problems.push("Demo projects may only use local emulators");
  if (
    config.apiKey &&
    !(useEmulators && config.apiKey === "demo-api-key") &&
    !/^AIza[A-Za-z0-9_-]{35}$/.test(config.apiKey)
  )
    problems.push("Invalid Firebase web API key format");
  if (config.appId && !/^1:\d+:web:[a-f0-9]+$/i.test(config.appId))
    problems.push("Invalid Firebase web app ID");
  if (
    config.authDomain &&
    !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(config.authDomain)
  )
    problems.push("authDomain must be a hostname without a URL path");
  return {
    status: problems.length ? "invalid" : "ready",
    config: problems.length ? null : config,
    missing,
    problems,
    useEmulators,
  };
}
