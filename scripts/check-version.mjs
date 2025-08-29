// scripts/check-version.js
import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd) {
  return execSync(cmd, { encoding: "utf-8" }).trim();
}

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
const name = pkg.name;
const version = pkg.version;

let existingVersions = [];
try {
  const result = run(`npm view ${name} versions --json`);
  existingVersions = JSON.parse(result);
} catch (e) {
  existingVersions = [];
}

const exists = existingVersions.includes(version);

console.log(`::set-output name=publish::${exists ? "false" : "true"}`);
console.log(
  exists
    ? `Version ${version} already exists on npm, will skip publish.`
    : `Version ${version} does not exist, will publish.`
);
