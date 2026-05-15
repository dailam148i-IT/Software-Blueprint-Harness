import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { templates, exampleTemplates, githubTemplates } from "./templates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

const REQUIRED_ARTIFACTS = [
  "AGENTS.md",
  "blueprint.config.yaml",
  "docs/HARNESS.md",
  "docs/WORKFLOW.md",
  "docs/FEATURE_INTAKE.md",
  "docs/QUALITY_GATES.md",
  "docs/TEST_MATRIX.md",
  "docs/MEMORY.md",
  "docs/product/product-passport.yaml",
  "docs/product/prd.md",
  "docs/product/ux-spec.md",
  "docs/product/data-api-contract.md",
  "docs/architecture.md",
  "docs/epics/epics.md",
  "docs/readiness-review.md",
  "docs/progress-ledger.md",
  ".blueprint/status.json",
  ".blueprint/memory/project-memory.yaml",
  ".blueprint/memory/artifact-index.json",
  ".blueprint/memory/decisions.index.json",
  ".blueprint/memory/agent-handoffs.json"
];

const COMMANDS = new Set([
  "help",
  "init",
  "doctor",
  "status",
  "check",
  "readiness",
  "new-story",
  "new-decision",
  "export-context",
  "memory",
  "extension",
  "integration"
]);

export async function runCli(argv) {
  const [command = "help", ...rest] = argv;
  if (!COMMANDS.has(command)) {
    throw new Error(`unknown command "${command}". Run "blueprint help".`);
  }

  switch (command) {
    case "help":
      printHelp();
      return;
    case "init":
      await commandInit(parseOptions(rest));
      return;
    case "doctor":
      await commandDoctor(parseOptions(rest));
      return;
    case "status":
      await commandStatus(parseOptions(rest));
      return;
    case "check":
      await commandCheck(parseOptions(rest));
      return;
    case "readiness":
      await commandReadiness(parseOptions(rest));
      return;
    case "new-story":
      await commandNewStory(parseOptions(rest));
      return;
    case "new-decision":
      await commandNewDecision(parseOptions(rest));
      return;
    case "export-context":
      await commandExportContext(parseOptions(rest));
      return;
    case "memory":
      await commandMemory(rest);
      return;
    case "extension":
      await commandExtension(rest);
      return;
    case "integration":
      await commandIntegration(rest);
      return;
  }
}

function printHelp() {
  console.log(`Software Blueprint Harness

Usage:
  blueprint init [--directory <path>] [--dry-run] [--merge] [--override] [--yes] [--with-github] [--with-examples]
  blueprint doctor [--directory <path>]
  blueprint status [--directory <path>]
  blueprint check [--directory <path>] [--strict]
  blueprint readiness [--directory <path>] [--ci]
  blueprint new-story "Story title" [--directory <path>]
  blueprint new-decision "Decision title" [--directory <path>]
  blueprint export-context US-001 [--agent developer-agent] [--directory <path>]
  blueprint memory show [--directory <path>]
  blueprint extension create <name> [--directory <path>]
  blueprint integration add github [--directory <path>]

Principle:
  No implementation before readiness says READY_FOR_IMPLEMENTATION.
`);
}

function parseOptions(args) {
  const options = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith("--")) {
      options._.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      options[key] = next;
      index += 1;
    } else {
      options[key] = true;
    }
  }
  return options;
}

function resolveDirectory(options = {}) {
  return path.resolve(options.directory || options.dir || process.cwd());
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readText(filePath) {
  return fs.readFile(filePath, "utf8");
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readText(filePath));
  } catch {
    return fallback;
  }
}

async function writeFileSafe(root, relativePath, content, options) {
  const target = path.join(root, relativePath);
  const alreadyExists = await exists(target);
  const action = alreadyExists ? "update" : "create";

  if (alreadyExists && !options.override && !options.merge) {
    return { relativePath, action: "skip", reason: "exists" };
  }

  if (alreadyExists && options.merge) {
    return { relativePath, action: "skip", reason: "merge-keeps-existing" };
  }

  if (options["dry-run"]) {
    return { relativePath, action };
  }

  await fs.mkdir(path.dirname(target), { recursive: true });
  if (alreadyExists && options.override) {
    const backup = `${target}.bak-${Date.now()}`;
    await fs.copyFile(target, backup);
  }
  await fs.writeFile(target, content, "utf8");
  return { relativePath, action };
}

async function writeMany(root, files, options) {
  const results = [];
  for (const [relativePath, content] of Object.entries(files)) {
    results.push(await writeFileSafe(root, relativePath, content, options));
  }
  return results;
}

async function commandInit(options) {
  const root = resolveDirectory(options);
  if (!options.yes && !options["dry-run"]) {
    console.log("blueprint init requires --yes for non-interactive safety.");
    console.log("Run with --dry-run to preview files.");
    return;
  }

  const files = { ...templates };
  if (options["with-examples"]) {
    Object.assign(files, exampleTemplates);
  }
  if (options["with-github"]) {
    Object.assign(files, githubTemplates);
  }

  const results = await writeMany(root, files, options);
  printWriteResults(root, results, options);
}

function printWriteResults(root, results, options) {
  console.log(`${options["dry-run"] ? "Dry run for" : "Initialized"} ${root}`);
  for (const result of results) {
    const suffix = result.reason ? ` (${result.reason})` : "";
    console.log(`${result.action.padEnd(7)} ${result.relativePath}${suffix}`);
  }
}

async function commandDoctor(options) {
  const root = resolveDirectory(options);
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  const packageExists = await exists(path.join(repoRoot, "package.json"));
  const targetExists = await exists(root);

  console.log("Software Blueprint Harness Doctor");
  console.log(`Node.js: ${process.versions.node} ${nodeMajor >= 18 ? "OK" : "FAIL (need >=18)"}`);
  console.log(`Framework root: ${repoRoot} ${packageExists ? "OK" : "WARN"}`);
  console.log(`Target directory: ${root} ${targetExists ? "OK" : "missing"}`);
  console.log(`Templates loaded: ${Object.keys(templates).length}`);
}

async function commandStatus(options) {
  const root = resolveDirectory(options);
  const statusPath = path.join(root, ".blueprint/status.json");
  const status = await readJson(statusPath, null);
  const passport = await safeRead(path.join(root, "docs/product/product-passport.yaml"));
  const report = analyzeProject(root, passport, status);

  console.log(`Project: ${report.projectName}`);
  console.log(`Stage: ${report.stage}`);
  console.log(`Track: ${report.track}`);
  console.log(`Risk: ${report.risk}`);
  console.log(`Readiness: ${report.readiness}`);
  console.log("");
  console.log("Artifacts:");
  for (const row of await artifactRows(root)) {
    console.log(`${row.exists ? "✓" : "✗"} ${row.path}`);
  }
}

async function commandCheck(options) {
  const root = resolveDirectory(options);
  const rows = await artifactRows(root);
  const missing = rows.filter((row) => !row.exists);
  const concerns = [];
  const passportPath = path.join(root, "docs/product/product-passport.yaml");
  const passport = await safeRead(passportPath);

  for (const field of [
    "product_name:",
    "product_type:",
    "target_users:",
    "in_scope:",
    "out_of_scope:",
    "risk_level:",
    "chosen_track:",
    "current_stage:",
    "readiness_status:"
  ]) {
    if (passport && !passport.includes(field)) {
      concerns.push(`product-passport missing field marker ${field}`);
    }
  }

  const storiesDir = path.join(root, "docs/stories");
  const stories = await listMarkdown(storiesDir);
  if (stories.length === 0) {
    concerns.push("no story packets yet");
  }

  if (missing.length === 0 && concerns.length === 0) {
    console.log("PASS blueprint structural check");
    return;
  }

  const strict = Boolean(options.strict);
  console.log(strict ? "FAIL blueprint structural check" : "PASS_WITH_CONCERNS blueprint structural check");
  for (const item of missing) {
    console.log(`missing ${item.path}`);
  }
  for (const item of concerns) {
    console.log(`concern ${item}`);
  }

  if (strict && (missing.length > 0 || concerns.length > 0)) {
    process.exitCode = 1;
  }
}

async function commandReadiness(options) {
  const root = resolveDirectory(options);
  const rows = await artifactRows(root);
  const missing = rows.filter((row) => !row.exists);
  const stories = await listMarkdown(path.join(root, "docs/stories"));
  const matrix = await safeRead(path.join(root, "docs/TEST_MATRIX.md"));
  const blockers = [];
  const concerns = [];

  if (missing.length > 0) {
    blockers.push(`Missing required artifacts: ${missing.map((row) => row.path).join(", ")}`);
  }
  if (stories.length === 0) {
    blockers.push("No implementation story packets exist.");
  }
  if (matrix && !matrix.includes("| US-")) {
    concerns.push("TEST_MATRIX exists but has no story rows yet.");
  }

  const ready = blockers.length === 0;
  const status = ready ? (concerns.length ? "PASS_WITH_CONCERNS" : "READY_FOR_IMPLEMENTATION") : "FAIL";
  const content = `# Readiness Review

Status: ${status}
Generated: ${new Date().toISOString()}

## Blockers
${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None"}

## Concerns
${concerns.length ? concerns.map((item) => `- ${item}`).join("\n") : "- None"}

## Required Before Code
${ready ? "- Approved story packet and context packet for each implementation agent." : "- Resolve blockers above, then rerun `blueprint readiness`."}
`;

  if (!options["dry-run"]) {
    await fs.mkdir(path.join(root, "docs"), { recursive: true });
    await fs.writeFile(path.join(root, "docs/readiness-review.md"), content, "utf8");
  }

  console.log(status);
  if (options.ci && status !== "READY_FOR_IMPLEMENTATION") {
    process.exitCode = 1;
  }
}

async function commandNewStory(options) {
  const root = resolveDirectory(options);
  const title = options._.join(" ").trim();
  if (!title) {
    throw new Error("new-story requires a title.");
  }
  const storiesDir = path.join(root, "docs/stories");
  await fs.mkdir(storiesDir, { recursive: true });
  const existing = await listMarkdown(storiesDir);
  const nextNumber = String(existing.length + 1).padStart(3, "0");
  const slug = slugify(title);
  const id = `US-${nextNumber}`;
  const relativePath = `docs/stories/${id}-${slug}.md`;
  const content = storyTemplate(id, title);
  await writeFileSafe(root, relativePath, content, { merge: true });
  console.log(`created ${relativePath}`);
}

async function commandNewDecision(options) {
  const root = resolveDirectory(options);
  const title = options._.join(" ").trim();
  if (!title) {
    throw new Error("new-decision requires a title.");
  }
  const decisionsDir = path.join(root, "docs/decisions");
  await fs.mkdir(decisionsDir, { recursive: true });
  const existing = await listMarkdown(decisionsDir);
  const nextNumber = String(existing.length + 1).padStart(4, "0");
  const slug = slugify(title);
  const relativePath = `docs/decisions/${nextNumber}-${slug}.md`;
  const content = decisionTemplate(nextNumber, title);
  await writeFileSafe(root, relativePath, content, { merge: true });
  console.log(`created ${relativePath}`);
}

async function commandExportContext(options) {
  const root = resolveDirectory(options);
  const storyId = options._[0];
  if (!storyId) {
    throw new Error("export-context requires a story id, for example US-001.");
  }
  const agent = options.agent || "developer-agent";
  const storyFile = await findStory(root, storyId);
  if (!storyFile) {
    throw new Error(`story ${storyId} not found in docs/stories.`);
  }

  const packet = `# Context Packet: ${storyId} / ${agent}

## Read First
- docs/product/product-passport.yaml
- docs/product/prd.md
- docs/architecture.md
- docs/product/data-api-contract.md
- ${path.relative(root, storyFile).replaceAll("\\", "/")}
- docs/TEST_MATRIX.md

## Story
${await readText(storyFile)}

## Agent Rules
- Work only inside the story scope.
- Do not change architecture, API contracts, or validation requirements without a decision record.
- Add evidence after validation exists.
- Update TEST_MATRIX if behavior or proof changes.
`;

  const outDir = path.join(root, ".blueprint/context-packets");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${storyId}-${agent}.md`);
  await fs.writeFile(outPath, packet, "utf8");
  console.log(`created ${path.relative(root, outPath).replaceAll("\\", "/")}`);
}

async function commandMemory(args) {
  const subcommand = args[0] || "show";
  const options = parseOptions(args.slice(1));
  if (subcommand !== "show") {
    throw new Error("only `blueprint memory show` is available in v1.");
  }
  const root = resolveDirectory(options);
  const memoryPath = path.join(root, ".blueprint/memory/project-memory.yaml");
  const memory = await safeRead(memoryPath);
  console.log(memory || "No project memory found. Run `blueprint init` first.");
}

async function commandExtension(args) {
  const subcommand = args[0];
  const options = parseOptions(args.slice(1));
  if (subcommand !== "create") {
    throw new Error("use `blueprint extension create <name>`.");
  }
  const name = options._[0];
  if (!name) {
    throw new Error("extension create requires a name.");
  }
  const root = resolveDirectory(options);
  const extensionRoot = `extensions/${slugify(name)}`;
  const files = {
    [`${extensionRoot}/extension.yaml`]: extensionTemplate(name),
    [`${extensionRoot}/README.md`]: `# ${name}

Describe what this extension adds, which hooks it runs on, and which artifacts it creates.
`
  };
  const results = await writeMany(root, files, { merge: true });
  printWriteResults(root, results, options);
}

async function commandIntegration(args) {
  const subcommand = args[0];
  const integration = args[1];
  const options = parseOptions(args.slice(2));
  if (subcommand !== "add" || integration !== "github") {
    throw new Error("use `blueprint integration add github`.");
  }
  const root = resolveDirectory(options);
  const results = await writeMany(root, githubTemplates, { merge: true, ...options });
  printWriteResults(root, results, options);
}

async function artifactRows(root) {
  const rows = [];
  for (const artifact of REQUIRED_ARTIFACTS) {
    rows.push({ path: artifact, exists: await exists(path.join(root, artifact)) });
  }
  return rows;
}

async function safeRead(filePath) {
  try {
    return await readText(filePath);
  } catch {
    return "";
  }
}

function analyzeProject(root, passport, status) {
  return {
    projectName: yamlValue(passport, "product_name") || path.basename(root),
    stage: status?.stage || yamlValue(passport, "current_stage") || "UNKNOWN",
    track: status?.track || yamlValue(passport, "chosen_track") || "UNKNOWN",
    risk: status?.risk || yamlValue(passport, "risk_level") || "UNKNOWN",
    readiness: status?.readiness || yamlValue(passport, "readiness_status") || "UNKNOWN"
  };
}

function yamlValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

async function listMarkdown(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name);
  } catch {
    return [];
  }
}

async function findStory(root, storyId) {
  const storiesDir = path.join(root, "docs/stories");
  try {
    const entries = await fs.readdir(storiesDir, { withFileTypes: true });
    const match = entries.find((entry) => entry.isFile() && entry.name.startsWith(storyId));
    return match ? path.join(storiesDir, match.name) : null;
  } catch {
    return null;
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function storyTemplate(id, title) {
  return `# ${id} ${title}

## Status
planned

## Lane
normal

## Product Contract
Describe the behavior this story must make true.

## Relevant Product Docs
- docs/product/prd.md
- docs/architecture.md
- docs/product/data-api-contract.md

## Acceptance Criteria
- Criterion 1.
- Criterion 2.
- Criterion 3.

## Design Notes
- Commands:
- Queries:
- API:
- Tables:
- Domain rules:
- UI surfaces:

## Validation
| Layer | Expected proof |
| --- | --- |
| Unit | |
| Integration | |
| E2E | |
| Platform | |
| Release | |

## Agent Ownership
- Primary agent:
- Files/modules allowed:
- Files/modules forbidden:

## Harness Delta
Document any harness updates made or proposed because of this story.

## Evidence
Add commands, reports, screenshots, or links after validation exists.
`;
}

function decisionTemplate(number, title) {
  return `# ${number} ${title}

Date: ${new Date().toISOString().slice(0, 10)}

## Status
Proposed

## Context
What problem, constraint, or ambiguity forced this decision?

## Decision
What did we decide?

## Alternatives Considered
1. Alternative.

## Consequences
Positive:
- Item.

Tradeoffs:
- Item.

## Follow-Up
- Item.
`;
}

function extensionTemplate(name) {
  return `name: ${slugify(name)}
version: 0.1.0
type: workflow-extension
runs_on:
  - before_readiness
required_when:
  risk_flags: []
outputs: []
permissions:
  - read_docs
  - write_docs
`;
}
