import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { COUNTRY_CODES, countryFlag } from "../src/communityConfig.js";

test("every selectable nationality has a bundled SVG flag", async () => {
  assert.equal(COUNTRY_CODES.length, 249);
  assert.equal(new Set(COUNTRY_CODES).size, 249);
  for (const code of COUNTRY_CODES) {
    const src = countryFlag(code);
    assert.equal(src, `/flags/${code.toLowerCase()}.svg`);
    const svg = await readFile(
      new URL(`../public${src}`, import.meta.url),
      "utf8",
    );
    assert.match(svg, /<svg\b/);
    assert.match(svg, /viewBox=/);
    assert.doesNotMatch(svg, /<script\b|(?:href|src)=["'](?:https?:|\/\/)/i);
  }
  for (const code of [undefined, "", "ZZ", "kr", "../KR"])
    assert.equal(countryFlag(code), "");
});
