import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import crypto from "node:crypto";

const REF_INDEX_EXTENSIONS = new Set([
  ".md",
  ".mdx",
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".js",
  ".ts",
  ".tsx",
  ".py",
  ".toml"
]);

const REF_IGNORE_DIRS = new Set([".git", "node_modules", "dist", "build", ".next", ".turbo", "coverage", "vendor"]);
const MAX_INDEX_FILE_BYTES = 250_000;

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
    await writeReferenceLock({ repoRoot, targetRoot });
  }

  return results;
}

export async function statusReferences({ repoRoot, targetRoot }) {
  const catalog = await loadReferenceCatalog(repoRoot);
  const vendorRoot = path.join(targetRoot, "refs/vendor");
  const lock = await readReferenceLock(targetRoot);
  const rows = [];

  for (const ref of catalog.references) {
    const target = path.join(vendorRoot, ref.name);
    const exists = await pathExists(target);
    const gitInfo = exists ? await readGitInfo(target) : null;
    const locked = lock?.references?.find((item) => item.name === ref.name);
    rows.push({
      name: ref.name,
      url: ref.url,
      role: ref.role,
      requested_ref: ref.default_ref || null,
      trust_tier: ref.trust_tier || "reference",
      status: exists ? "present" : "missing",
      commit: gitInfo?.commit || null,
      branch: gitInfo?.branch || null,
      dirty: gitInfo?.dirty || false,
      locked_commit: locked?.commit || null,
      lock_matches: Boolean(locked?.commit && gitInfo?.commit && locked.commit === gitInfo.commit)
    });
  }

  return rows;
}

export async function indexReferences({ repoRoot, targetRoot }) {
  const catalog = await loadReferenceCatalog(repoRoot);
  const vendorRoot = path.join(targetRoot, "refs/vendor");
  const indexedAt = new Date().toISOString();
  const references = [];

  for (const ref of catalog.references) {
    const target = path.join(vendorRoot, ref.name);
    const exists = await pathExists(target);
    const gitInfo = exists ? await readGitInfo(target) : null;
    const files = exists ? await collectReferenceFiles(target, ref.name, gitInfo?.commit || null) : [];
    references.push({
      name: ref.name,
      url: ref.url,
      role: ref.role,
      status: exists ? "present" : "missing",
      root: path.relative(targetRoot, target).replaceAll("\\", "/"),
      commit: gitInfo?.commit || null,
      branch: gitInfo?.branch || null,
      file_count: files.length,
      files
    });
  }

  const index = {
    schema_version: 1,
    indexed_at: indexedAt,
    references
  };
  const outDir = path.join(targetRoot, ".blueprint/refs");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  await fs.writeFile(
    path.join(outDir, "index.summary.json"),
    `${JSON.stringify(
      {
        schema_version: index.schema_version,
        indexed_at: index.indexed_at,
        references: references.map((ref) => ({
          name: ref.name,
          status: ref.status,
          commit: ref.commit,
          file_count: ref.file_count
        }))
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  await fs.writeFile(
    path.join(outDir, "index.files.jsonl"),
    `${references.flatMap((ref) => ref.files.map((file) => JSON.stringify(file))).join("\n")}\n`,
    "utf8"
  );
  return index;
}

export async function writeReferenceLock({ repoRoot, targetRoot }) {
  const status = await statusReferences({ repoRoot, targetRoot });
  const lock = {
    schema_version: 1,
    synced_at: new Date().toISOString(),
    tool: "software-blueprint-harness",
    references: status.map((ref) => ({
      name: ref.name,
      url: ref.url,
      role: ref.role,
      requested_ref: ref.requested_ref,
      trust_tier: ref.trust_tier,
      commit: ref.commit,
      branch: ref.branch,
      dirty: ref.dirty,
      status: ref.status
    }))
  };

  await fs.mkdir(path.join(targetRoot, ".blueprint/refs"), { recursive: true });
  await fs.mkdir(path.join(targetRoot, "refs"), { recursive: true });
  const content = `${JSON.stringify(lock, null, 2)}\n`;
  await fs.writeFile(path.join(targetRoot, ".blueprint/refs/REFS_LOCK.json"), content, "utf8");
  await fs.writeFile(path.join(targetRoot, "refs/REFS_LOCK.json"), content, "utf8");
  return lock;
}

export async function readReferenceLock(targetRoot) {
  return (
    (await readJson(path.join(targetRoot, ".blueprint/refs/REFS_LOCK.json"), null)) ||
    (await readJson(path.join(targetRoot, "refs/REFS_LOCK.json"), null))
  );
}

async function collectReferenceFiles(root, referenceName, commit) {
  const files = [];
  await walk(root, async (filePath, entry) => {
    if (!entry.isFile()) return;
    const extension = path.extname(entry.name).toLowerCase();
    if (!REF_INDEX_EXTENSIONS.has(extension)) return;

    const stat = await fs.stat(filePath);
    if (stat.size > MAX_INDEX_FILE_BYTES) return;

    const text = await fs.readFile(filePath, "utf8").catch(() => "");
    if (!text.trim()) return;
    const relativePath = path.relative(root, filePath).replaceAll("\\", "/");
    const sha256 = hashText(text);

    files.push({
      file_id: `${referenceName}:${commit || "missing"}:${relativePath}:${sha256.slice(0, 12)}`,
      ref_name: referenceName,
      commit,
      path: relativePath,
      language: languageForExtension(extension),
      sha256,
      bytes: stat.size,
      lines: text.split(/\r?\n/).length,
      headings: extractHeadings(text).slice(0, 12),
      keywords: extractKeywords(text).slice(0, 20),
      excerpt_hashes: extractHeadings(text)
        .slice(0, 6)
        .map((heading) => hashText(heading).slice(0, 16))
    });
  });
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function walk(dir, visitor) {
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.isDirectory() && REF_IGNORE_DIRS.has(entry.name)) continue;
    const nextPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(nextPath, visitor);
    } else {
      await visitor(nextPath, entry);
    }
  }
}

function extractHeadings(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => /^#{1,4}\s+/.test(line.trim()))
    .map((line) => line.replace(/^#{1,4}\s+/, "").trim())
    .filter(Boolean);
}

function extractKeywords(text) {
  const normalized = text.toLowerCase();
  return [
    "agent",
    "workflow",
    "research",
    "gate",
    "validation",
    "memory",
    "context",
    "story",
    "scrum",
    "architecture",
    "extension",
    "integration",
    "test",
    "release",
    "security",
    "privacy",
    "prompt",
    "schema"
  ].filter((keyword) => normalized.includes(keyword));
}

function languageForExtension(extension) {
  return (
    {
      ".md": "markdown",
      ".mdx": "markdown",
      ".txt": "text",
      ".json": "json",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".js": "javascript",
      ".ts": "typescript",
      ".tsx": "typescript-react",
      ".py": "python",
      ".toml": "toml"
    }[extension] || "text"
  );
}

function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function readGitInfo(cwd) {
  const [commit, branch, dirtyOutput] = await Promise.all([
    gitCapture(["rev-parse", "HEAD"], cwd).catch(() => ""),
    gitCapture(["rev-parse", "--abbrev-ref", "HEAD"], cwd).catch(() => ""),
    gitCapture(["status", "--porcelain"], cwd).catch(() => "")
  ]);
  return {
    commit: commit.trim() || null,
    branch: branch.trim() || null,
    dirty: Boolean(dirtyOutput.trim())
  };
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

function gitCapture(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("exit", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`git ${args.join(" ")} failed with exit code ${code}: ${stderr}`));
    });
    child.on("error", reject);
  });
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
