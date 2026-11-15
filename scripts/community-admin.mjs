import { createRequire } from "node:module";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { ROOM_IDS } from "../src/communityConfig.js";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const cliAuth = require("firebase-tools/lib/auth");
const { requireAuth } = require("firebase-tools/lib/requireAuth");
const { findUser } = require("firebase-tools/lib/gcp/auth");
const { Client } = require("firebase-tools/lib/apiv2");
const [action, project, file] = process.argv.slice(2);
const commands = ["bootstrap", "open", "pause", "backup", "restore-emulator"];
if (!commands.includes(action) || project !== "ku-bridge")
  throw Error(
    "Usage: node scripts/community-admin.mjs bootstrap|open|pause|backup|restore-emulator ku-bridge [backup-file]",
  );
const root = `projects/${project}/databases/(default)/documents`;
let client;
if (action === "restore-emulator") {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host || "") || !file)
    throw Error(
      "Restore requires a loopback FIRESTORE_EMULATOR_HOST and a backup file; production restore is forbidden",
    );
  client = new Client({ urlPrefix: `http://${host}`, auth: false });
  const backup = JSON.parse(await readFile(file, "utf8"));
  if (
    backup.project !== project ||
    backup.format !== 1 ||
    !Array.isArray(backup.documents)
  )
    throw Error("Invalid backup");
  const demoRoot = "projects/demo-ku-bridge/databases/(default)/documents";
  for (let offset = 0; offset < backup.documents.length; offset += 200) {
    const writes = backup.documents.slice(offset, offset + 200).map((doc) => {
      if (!doc.name.startsWith(root + "/"))
        throw Error("Foreign document path");
      return {
        update: {
          name: demoRoot + doc.name.slice(root.length),
          fields: doc.fields || {},
        },
      };
    });
    await client.post(
      "/v1/projects/demo-ku-bridge/databases/(default)/documents:commit",
      { writes },
      { headers: { Authorization: "Bearer owner" } },
    );
  }
  for (const doc of backup.documents) {
    const result = await client.get(
      `/v1/${demoRoot}${doc.name.slice(root.length)}`,
      { headers: { Authorization: "Bearer owner" } },
    );
    assert.deepEqual(result.body.fields || {}, doc.fields || {});
  }
  console.log(
    `Restored and verified ${backup.documents.length} documents in demo-ku-bridge emulator only`,
  );
  process.exit(0);
}
const options = { project, nonInteractive: true },
  account = cliAuth.getGlobalDefaultAccount();
if (!account) throw Error("Run npx firebase login first");
cliAuth.setActiveAccount(options, account);
await requireAuth(options);
client = new Client({ urlPrefix: "https://firestore.googleapis.com" });
const str = (value) => ({ stringValue: value }),
  bool = (value) => ({ booleanValue: value });
const get = async (path) => {
  try {
    return (await client.get(`/v1/${root}/${path}`)).body;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
};
const commit = (writes) =>
  client.post(`/v1/projects/${project}/databases/(default)/documents:commit`, {
    writes,
  });
const put = (path, fields) => ({ update: { name: `${root}/${path}`, fields } });
async function operator() {
  const user = await findUser(project, "judemin2087@naver.com");
  if (user.emailVerified !== true)
    throw Error("Operator must verify the registered email first");
  return user.localId;
}
if (action === "bootstrap") {
  const uid = await operator(),
    now = { timestampValue: new Date().toISOString() },
    writes = [put(`admins/${uid}`, { role: str("admin") })];
  for (const id of ROOM_IDS) {
    const existing = await get(`rooms/${id}`);
    writes.push(
      put(`rooms/${id}`, {
        enabled: bool(true),
        kind: str(
          id === "global"
            ? "global"
            : id === "anglophone"
              ? "group"
              : "country",
        ),
        countryCode: str(
          { "country-cn": "CN", "country-jp": "JP", "country-kr": "KR" }[id] ||
            "",
        ),
        createdAt: existing?.fields?.createdAt || now,
        updatedAt: now,
      }),
    );
  }
  if (!(await get("serviceConfig/public")))
    writes.push(
      put("serviceConfig/public", {
        communityEnabled: bool(false),
        chatEnabled: bool(false),
      }),
    );
  await commit(writes);
  console.log(
    "Verified operator granted admin role; five rooms initialized. Existing service switches preserved.",
  );
} else if (action === "open" || action === "pause") {
  const uid = await operator();
  if ((await get(`admins/${uid}`))?.fields?.role?.stringValue !== "admin")
    throw Error("Bootstrap the verified operator first");
  for (const id of ROOM_IDS)
    if ((await get(`rooms/${id}`))?.fields?.enabled?.booleanValue !== true)
      throw Error("All five rooms must exist and be enabled");
  const enabled = action === "open";
  await commit([
    put("serviceConfig/public", {
      communityEnabled: bool(enabled),
      chatEnabled: bool(enabled),
    }),
  ]);
  console.log(`Community and chat ${enabled ? "enabled" : "paused"}`);
} else if (action === "backup") {
  const documents = [];
  async function walk(parent) {
    let token;
    do {
      const result = (
        await client.post(`/v1/${parent}:listCollectionIds`, {
          pageSize: 100,
          ...(token ? { pageToken: token } : {}),
        })
      ).body;
      for (const collection of result.collectionIds || []) {
        let page;
        do {
          const response = (
            await client.get(`/v1/${parent}/${collection}`, {
              queryParams: {
                pageSize: 300,
                showMissing: true,
                ...(page ? { pageToken: page } : {}),
              },
            })
          ).body;
          for (const doc of response.documents || []) {
            if (doc.fields)
              documents.push({ name: doc.name, fields: doc.fields });
            if (documents.length > 10000)
              throw Error(
                "Backup exceeds the 10,000-document safety limit; use a dedicated export workflow",
              );
            await walk(doc.name);
          }
          page = response.nextPageToken;
        } while (page);
      }
      token = result.nextPageToken;
    } while (token);
  }
  await walk(root);
  await mkdir(".private-backups", { recursive: true });
  const target = `.private-backups/${project}-${new Date().toISOString().replaceAll(":", "-")}.json`;
  await writeFile(
    target,
    JSON.stringify(
      {
        format: 1,
        project,
        createdAt: new Date().toISOString(),
        note: "Logical Firestore backup; Auth passwords are excluded. Not a point-in-time snapshot.",
        documents,
      },
      null,
      2,
    ),
    { flag: "wx" },
  );
  console.log(
    `Private backup saved: ${target} (${documents.length} documents). Never upload this file.`,
  );
}
