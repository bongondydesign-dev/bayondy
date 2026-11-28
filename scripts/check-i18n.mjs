import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const frPath = path.join(root, "src/messages/fr.json");
const krPath = path.join(root, "src/messages/kr.json");

const fr = JSON.parse(fs.readFileSync(frPath, "utf8"));
const kr = JSON.parse(fs.readFileSync(krPath, "utf8"));

function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
      if (typeof value !== "string" || value.trim().length === 0) {
        console.error(`[check-i18n] Empty or non-string value at key: ${fullKey}`);
        process.exitCode = 1;
      }
    }
  }
  return keys.sort();
}

const frKeys = flattenKeys(fr);
const krKeys = flattenKeys(kr);

const frSet = new Set(frKeys);
const krSet = new Set(krKeys);

const missingInKr = frKeys.filter((k) => !krSet.has(k));
const missingInFr = krKeys.filter((k) => !frSet.has(k));

if (missingInKr.length > 0) {
  console.error(`[check-i18n] Missing in kr.json (${missingInKr.length}):`);
  for (const key of missingInKr) console.error(`  - ${key}`);
}

if (missingInFr.length > 0) {
  console.error(`[check-i18n] Missing in fr.json (${missingInFr.length}):`);
  for (const key of missingInFr) console.error(`  - ${key}`);
}

if (missingInKr.length > 0 || missingInFr.length > 0 || process.exitCode) {
  process.exit(1);
}

console.log(`[check-i18n] OK: fr.json and kr.json share ${frKeys.length} identical keys.`);
