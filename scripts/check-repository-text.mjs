import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const names = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { cwd: root, encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const decoder = new TextDecoder("utf-8", { fatal: true });
const failures = [];
for (const name of new Set(names)) {
  let source;
  try {
    source = decoder.decode(
      await readFile(
        new URL(name.replaceAll("\\", "/"), new URL("../", import.meta.url)),
      ),
    );
  } catch (error) {
    if (
      error.code === "ENOENT" ||
      error.code === "ERR_ENCODING_INVALID_ENCODED_DATA"
    )
      continue;
    throw error;
  }
  if (source.includes(String.fromCodePoint(0xb7))) failures.push(name);
}
if (failures.length) {
  console.error("Forbidden Unicode U+00B7 in: " + failures.join(", "));
  process.exitCode = 1;
} else console.log("Repository text: no forbidden separator found");
