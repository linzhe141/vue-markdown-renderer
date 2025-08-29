// @ts-check
import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd) {
  return execSync(cmd, { encoding: "utf-8" }).trim();
}

function main() {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  const name = pkg.name;
  const version = pkg.version;

  let existingVersions = [];
  try {
    const result = run(`npm view ${name} versions --json`);
    existingVersions = JSON.parse(result);
  } catch (e) {
    // 包可能还不存在，npm view 会报错
    existingVersions = [];
  }

  const exists = existingVersions.includes(version);

  if (exists) {
    console.log(`Version ${version} already exists on npm, skip publish.`);
    process.exit(1); // 用 exit code 表示 "跳过"
  } else {
    console.log(`Version ${version} does not exist, continue publish.`);
    process.exit(0);
  }
}

main();
