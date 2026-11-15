import { loadEnv } from "vite";
import { readFirebaseConfig } from "../src/services/firebaseConfig.js";

const mode = process.argv[2] || "development";
if (!["development", "production"].includes(mode))
  throw new Error("Use development or production mode");
const settings = readFirebaseConfig({
  ...loadEnv(mode, process.cwd(), "VITE_"),
  ...Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key.startsWith("VITE_")),
  ),
  DEV: mode === "development",
});
// Never print config values, tokens or API keys.
process.stdout.write(`Firebase configuration: ${settings.status}\n`);
if (settings.status === "unconfigured")
  process.stdout.write(
    "Static FE works without Firebase. Complete .env.local before stage 4.\n",
  );
for (const problem of settings.problems) process.stderr.write(problem + "\n");
if (settings.status === "invalid") process.exitCode = 1;
