import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = path.join(root, "node_modules/firebase-tools/lib/bin/firebase.js");
const start = process.argv.length === 3 && process.argv[2] === "--start";
const authTests = process.argv.length === 3 && process.argv[2] === "--auth";
if (process.argv.length > 2 && !start && !authTests)
  throw new Error(
    "Only --start or --auth is supported; project and loopback hosts are fixed",
  );
const child = spawn(
  process.execPath,
  [
    cli,
    start ? "emulators:start" : "emulators:exec",
    "--only",
    start || authTests ? "auth,firestore" : "firestore",
    "--project",
    "demo-ku-bridge",
    ...(start
      ? []
      : [
          authTests
            ? "node --test --test-concurrency=1 tests/auth/*.test.js"
            : "node --test tests/firestore/*.test.js",
        ]),
  ],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      CI: "true",
      FIREBASE_EMULATORS_PATH: path.join(root, ".cache/firebase/emulators"),
      ...(process.platform === "win32"
        ? {
            JAVA_TOOL_OPTIONS: [
              process.env.JAVA_TOOL_OPTIONS,
              "-Djava.net.preferIPv4Stack=true",
            ]
              .filter(Boolean)
              .join(" "),
          }
        : {}),
    },
  },
);
child.on("error", (error) => {
  process.stderr.write(error.message + "\n");
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
