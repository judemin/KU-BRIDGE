import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const base = new URL(process.argv[2] || "http://127.0.0.1:5183");
if (!["http:", "https:"].includes(base.protocol))
  throw Error("HTTP(S) URL required");
const local = await readFile(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
const assets = [...local.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(
  (match) => match[1],
);
assert.ok(assets.length >= 2);
for (const path of [
  "/",
  "/account",
  "/privacy",
  "/community?room=country-jp",
  "/community/new?room=country-jp",
  "/chat?room=country-jp",
  "/admin",
]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("content-type"), /text\/html/);
  const html = await response.text();
  assert.match(html, /<div id="root">/);
  for (const asset of assets)
    assert.ok(html.includes(asset), `Current build missing at ${path}`);
}
const hash = (value) => createHash("sha256").update(value).digest("hex");
const files = await readdir(new URL("../dist/assets/", import.meta.url));
for (const file of files) {
  const response = await fetch(new URL(`/assets/${file}`, base));
  assert.equal(response.status, 200, file);
  const actual = Buffer.from(await response.arrayBuffer()),
    expected = await readFile(
      new URL(`../dist/assets/${file}`, import.meta.url),
    );
  assert.equal(hash(actual), hash(expected), file);
}
console.log(
  `Verified seven SPA routes and ${files.length} deployed assets against the local build at ${base.origin}`,
);
