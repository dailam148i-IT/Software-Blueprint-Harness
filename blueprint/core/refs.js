import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

export async function loadReferenceCatalog(repoRoot) {
  const catalogPath = path.join(repoRoot, "refs/catalog.json");
  const text = await fs.readFile(catalogPath, "utf8");
  return JSON.parse(text);
}

export async function syncReferences({ repoRoot, targetRoot, dryRun = false, force = false }) {
  const catalog = await loadReferenceCatalog(repoRoot);
  const vendorRoot = path.join(targetRoot, "refs/vendor");
  const results = [];

  if (!dryRun) {
    await fs.mkdir(vendorRoot, { recursive: true });
  }

  for (const ref of catalog.references) {
    const target = path.join(vendorRoot, ref.name);
    const exists = await pathExists(target);
    if (exists && !force) {
      results.push({ name: ref.name, action: "skip", reason: "exists" });
      continue;
    }

    if (dryRun) {
      results.push({ name: ref.name, action: exists ? "update" : "clone", url: ref.url });
      continue;
    }

    if (exists && force) {
      await fs.rm(target, { recursive: true, force: true });
    }

    await git(["clone", "--depth", "1", ref.url, target]);
    results.push({ name: ref.name, action: "clone", url: ref.url });
  }

  if (!dryRun) {
    await fs.writeFile(
      path.join(targetRoot, "refs/REFS_LOCK.json"),
      JSON.stringify({ synced_at: new Date().toISOString(), references: catalog.references }, null, 2),
      "utf8"
    );
  }

  return results;
}

function git(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`git ${args.join(" ")} failed with exit code ${code}`));
    });
    child.on("error", reject);
  });
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
