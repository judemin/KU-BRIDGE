import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = path.join(root, "node_modules/firebase-tools/lib/bin/firebase.js");
const start = process.argv.length === 3 && process.argv[2] === "--start";
if (process.argv.length > 2 && !start)
  throw new Error(
    "Only --start is supported; project and loopback hosts are fixed in the local configuration",
  );
const child = spawn(
  process.execPath,
  [
    cli,
    start ? "emulators:start" : "emulators:exec",
    "--only",
    start ? "auth,firestore" : "firestore",
    "--project",
    "demo-ku-bridge",
    ...(start ? [] : ["node --test tests/firestore/*.test.js"]),
  ],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      CI: "true",
      FIREBASE_EMULATORS_PATH: path.join(root, ".cache/firebase/emulators"),
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
