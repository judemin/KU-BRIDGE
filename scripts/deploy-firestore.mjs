import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const projectId = args.length === 1 ? args[0] : null;
if (
  !projectId ||
  projectId.startsWith("demo-") ||
  !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)
) {
  process.stderr.write(
    "Specify the real KU Bridge project explicitly: npm run firebase:deploy-rules -- YOUR_PROJECT_ID\n",
  );
  process.exit(1);
}
const result = spawnSync(
  process.execPath,
  [
    path.join(root, "node_modules/firebase-tools/lib/bin/firebase.js"),
    "deploy",
    "--only",
    "firestore:rules,firestore:indexes",
    "--project",
    projectId,
  ],
  { cwd: root, stdio: "inherit" },
);
if (result.error) process.stderr.write(result.error.message + "\n");
process.exitCode = result.status ?? 1;
