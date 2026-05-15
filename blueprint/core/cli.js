import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { templates, exampleTemplates, githubTemplates } from "./templates.js";
import { parseSimpleYaml, stringifySimpleYaml } from "./simple-yaml.js";
import { validateProject } from "./validation.js";
import { indexReferences, statusReferences, syncReferences } from "./refs.js";
import {
  createResearchPlan,
  reportResearch,
  runResearch,
  synthesizeResearch,
  validateResearch
} from "./research.js";

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

const TARGET_GITIGNORE_ENTRIES = ["refs/vendor/", "refs/REFS_LOCK.json"];

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
  "integration",
  "github",
  "refs",
  "research"
]);

export async function runCli(argv) {
  const [command = "help", ...rest] = argv;
  if (command === "--version" || command === "-v" || command === "version") {
    await commandVersion();
    return;
  }
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
    case "github":
      await commandGithub(rest);
      return;
    case "refs":
      await commandRefs(rest);
      return;
    case "research":
      await commandResearch(rest);
      return;
  }
}

function printHelp() {
  console.log(`Software Blueprint Harness

Usage:
  blueprint init [--directory <path>] [--dry-run] [--merge] [--override] [--yes] [--with-github] [--with-examples]
  blueprint doctor [--directory <path>] [--ci]
  blueprint --version
  blueprint status [--directory <path>]
  blueprint check [--directory <path>] [--strict]
  blueprint readiness [--directory <path>] [--ci]
  blueprint new-story "Story title" [--directory <path>]
  blueprint new-decision "Decision title" [--directory <path>]
  blueprint export-context US-001 [--agent developer-agent] [--directory <path>]
  blueprint memory show [--directory <path>]
  blueprint memory update [--directory <path>]
  blueprint memory compact [--directory <path>]
  blueprint extension create <name> [--directory <path>]
  blueprint extension list [--directory <path>]
  blueprint extension run <hook> [--directory <path>]
  blueprint integration add github [--directory <path>]
  blueprint github create-issues [--directory <path>] [--use-gh] [--repo owner/name] [--force]
  blueprint refs sync [--directory <path>] [--dry-run] [--force]
  blueprint refs status [--directory <path>]
  blueprint refs index [--directory <path>]
  blueprint research plan [--topic <text>] [--depth quick|standard|deep] [--directory <path>]
  blueprint research run [--topic <text>] [--depth quick|standard|deep] [--directory <path>]
  blueprint research synthesize [--run <id>] [--directory <path>]
  blueprint research report [--run <id>] [--directory <path>]
  blueprint research validate [--run <id>] [--strict] [--ci] [--directory <path>]

Principle:
  No implementation before readiness says READY_FOR_IMPLEMENTATION.
`);
}

async function commandVersion() {
  const pkg = await readJson(path.join(repoRoot, "package.json"), { version: "unknown" });
  console.log(pkg.version);
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

async function ensureTargetGitignore(root, options = {}) {
  const relativePath = ".gitignore";
  const target = path.join(root, relativePath);
  const current = (await safeRead(target)) || "";
  const missing = TARGET_GITIGNORE_ENTRIES.filter((entry) => !current.split(/\r?\n/).includes(entry));

  if (missing.length === 0) {
    return [{ relativePath, action: "skip", reason: "refs-ignore-present" }];
  }

  const action = current ? "update" : "create";
  if (options["dry-run"]) {
    return [{ relativePath, action, reason: `add ${missing.join(", ")}` }];
  }

  const prefix = current.trimEnd();
  const block = ["# Software Blueprint Harness references", ...missing].join("\n");
  const separator = prefix ? "\n\n" : "";
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${prefix}${separator}${block}\n`, "utf8");
  return [{ relativePath, action, reason: `add ${missing.join(", ")}` }];
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
  results.push(...(await ensureTargetGitignore(root, options)));
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
  const ok = nodeMajor >= 18 && packageExists && targetExists;

  console.log("Software Blueprint Harness Doctor");
  console.log(`Node.js: ${process.versions.node} ${nodeMajor >= 18 ? "OK" : "FAIL (need >=18)"}`);
  console.log(`Framework root: ${repoRoot} ${packageExists ? "OK" : "WARN"}`);
  console.log(`Target directory: ${root} ${targetExists ? "OK" : "missing"}`);
  console.log(`Templates loaded: ${Object.keys(templates).length}`);

  if (options.ci && !ok) {
    process.exitCode = 1;
  }
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
  const result = await validateProject(root, REQUIRED_ARTIFACTS);
  const missing = result.missing;
  const concerns = result.concerns;
  const failures = result.failures;

  if (missing.length === 0 && concerns.length === 0 && failures.length === 0) {
    console.log("PASS blueprint structural check");
    return;
  }

  const strict = Boolean(options.strict);
  const hasFailures = missing.length > 0 || failures.length > 0;
  console.log(strict || hasFailures ? "FAIL blueprint structural check" : "PASS_WITH_CONCERNS blueprint structural check");
  for (const item of missing) console.log(`missing ${item}`);
  for (const item of failures) console.log(`failure ${item}`);
  for (const item of concerns) {
    console.log(`concern ${item}`);
  }

  if ((strict && (missing.length > 0 || concerns.length > 0 || failures.length > 0)) || hasFailures) {
    process.exitCode = 1;
  }
}

async function commandReadiness(options) {
  const root = resolveDirectory(options);
  const result = await validateProject(root, REQUIRED_ARTIFACTS, { readiness: true });
  const missing = result.missing;
  const failures = result.failures;
  const validationConcerns = result.concerns;
  const stories = await listMarkdown(path.join(root, "docs/stories"));
  const matrix = await safeRead(path.join(root, "docs/TEST_MATRIX.md"));
  const extensionGate = await evaluateExtensionGates(root);
  const blockers = [];
  const concerns = [...validationConcerns, ...extensionGate.concerns];

  if (missing.length > 0) {
    blockers.push(`Missing required artifacts: ${missing.join(", ")}`);
  }
  blockers.push(...failures);
  blockers.push(...extensionGate.blockers);
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
  const root = resolveDirectory(options);
  const memoryPath = path.join(root, ".blueprint/memory/project-memory.yaml");
  if (subcommand === "update") {
    await updateMemory(root);
    console.log("updated .blueprint/memory/project-memory.yaml");
    return;
  }
  if (subcommand === "compact") {
    await compactMemory(root);
    console.log("created .blueprint/memory/compact-context.md");
    return;
  }
  if (subcommand !== "show") {
    throw new Error("use `blueprint memory show|update|compact`.");
  }
  const memory = await safeRead(memoryPath);
  console.log(memory || "No project memory found. Run `blueprint init` first.");
}

async function commandExtension(args) {
  const subcommand = args[0];
  const options = parseOptions(args.slice(1));
  if (subcommand === "list") {
    const root = resolveDirectory(options);
    for (const ext of await loadExtensions(root)) {
      console.log(`${ext.name} (${ext.type}) hooks=${(ext.runs_on || []).join(",")}`);
    }
    return;
  }
  if (subcommand === "run") {
    const hook = options._[0];
    if (!hook) throw new Error("extension run requires a hook name.");
    await runExtensionHook(resolveDirectory(options), hook);
    return;
  }
  if (subcommand !== "create") {
    throw new Error("use `blueprint extension list|create <name>|run <hook>`.");
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

async function commandGithub(args) {
  const subcommand = args[0];
  const options = parseOptions(args.slice(1));
  if (subcommand !== "create-issues") {
    throw new Error("use `blueprint github create-issues [--use-gh] [--repo owner/name]`.");
  }
  const root = resolveDirectory(options);
  const outDir = path.join(root, ".blueprint/github/issues");
  const indexPath = path.join(root, ".blueprint/github/issues.index.json");
  const issueIndex = await readJson(indexPath, {});
  await fs.mkdir(outDir, { recursive: true });
  const storiesDir = path.join(root, "docs/stories");
  const stories = await listMarkdown(storiesDir);
  for (const story of stories) {
    const storyPath = path.join(storiesDir, story);
    const text = await readText(storyPath);
    const id = story.match(/US-\d{3}/)?.[0] || story.replace(/\.md$/, "");
    const title = text.split(/\r?\n/)[0].replace(/^#\s*/, "");
    const body = `# ${title}

Generated from ${path.relative(root, storyPath).replaceAll("\\", "/")}.

${text}
`;
    const bodyFile = path.join(outDir, `${id}.md`);
    await fs.writeFile(bodyFile, body, "utf8");
    console.log(`created ${path.relative(root, bodyFile).replaceAll("\\", "/")}`);

    const relativeBodyFile = path.relative(root, bodyFile).replaceAll("\\", "/");
    issueIndex[id] = {
      ...(issueIndex[id] || {}),
      story: path.relative(root, storyPath).replaceAll("\\", "/"),
      title,
      body_file: relativeBodyFile,
      status: issueIndex[id]?.status || "exported",
      updated_at: new Date().toISOString()
    };

    if (options["use-gh"]) {
      if (issueIndex[id]?.status === "created" && !options.force) {
        console.log(`skip    ${id} (already created; use --force to recreate)`);
        await fs.writeFile(indexPath, `${JSON.stringify(issueIndex, null, 2)}\n`, "utf8");
        continue;
      }
      const ghArgs = ["issue", "create", "--title", title, "--body-file", bodyFile];
      if (options.repo) ghArgs.push("--repo", options.repo);
      await runCommand("gh", ghArgs);
      issueIndex[id] = {
        ...issueIndex[id],
        status: "created",
        repo: options.repo || null,
        created_at: issueIndex[id]?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    await fs.writeFile(indexPath, `${JSON.stringify(issueIndex, null, 2)}\n`, "utf8");
  }
  await fs.writeFile(indexPath, `${JSON.stringify(issueIndex, null, 2)}\n`, "utf8");
}

async function commandRefs(args) {
  const subcommand = args[0];
  const options = parseOptions(args.slice(1));
  const targetRoot = resolveDirectory(options);

  if (subcommand === "sync") {
    const ignoreResults = await ensureTargetGitignore(targetRoot, options);
    const results = await syncReferences({
      repoRoot,
      targetRoot,
      dryRun: Boolean(options["dry-run"]),
      force: Boolean(options.force)
    });
    for (const result of [...ignoreResults, ...results]) {
      const suffix = result.reason ? ` (${result.reason})` : "";
      console.log(`${result.action.padEnd(7)} ${result.name || result.relativePath}${suffix}`);
    }
    return;
  }

  if (subcommand === "status") {
    const rows = await statusReferences({ repoRoot, targetRoot });
    for (const row of rows) {
      const commit = row.commit ? row.commit.slice(0, 12) : "missing";
      const locked = row.lock_matches ? "lock-ok" : row.locked_commit ? "lock-drift" : "no-lock";
      console.log(`${row.status.padEnd(8)} ${row.name.padEnd(32)} ${commit} ${locked}`);
    }
    return;
  }

  if (subcommand === "index") {
    const index = await indexReferences({ repoRoot, targetRoot });
    for (const reference of index.references) {
      console.log(`${reference.status.padEnd(8)} ${reference.name.padEnd(32)} files=${reference.file_count}`);
    }
    console.log("created .blueprint/refs/index.json");
    return;
  }

  throw new Error("use `blueprint refs sync|status|index`.");
}

async function commandResearch(args) {
  const subcommand = args[0];
  const options = parseOptions(args.slice(1));
  const targetRoot = resolveDirectory(options);
  const topic = options.topic || options._.join(" ") || "production-grade software blueprint harness";
  const depth = options.depth || "standard";

  if (subcommand === "plan") {
    const result = await createResearchPlan({ targetRoot, topic, depth });
    console.log(`created ${path.relative(targetRoot, result.runDir).replaceAll("\\", "/")}/plan.md`);
    return;
  }

  if (subcommand === "run") {
    const result = await runResearch({ repoRoot, targetRoot, topic, depth });
    console.log(`created .blueprint/research/runs/${result.runId}`);
    console.log(`findings ${result.findings.length}`);
    console.log(`claims ${result.claimMap.claims.length}`);
    return;
  }

  if (subcommand === "synthesize") {
    const result = await synthesizeResearch({ targetRoot, runId: options.run });
    console.log(`updated ${path.relative(targetRoot, path.join(result.runDir, "synthesis.md")).replaceAll("\\", "/")}`);
    console.log("updated docs/research/latest-reference-synthesis.md");
    return;
  }

  if (subcommand === "report") {
    const report = await reportResearch({ targetRoot, runId: options.run });
    console.log(`Run: ${report.run}`);
    console.log(`References: ${report.present_references}/${report.references} present`);
    console.log(`Findings: ${report.findings}`);
    console.log(`Claims: ${report.claims}`);
    console.log(`Synthesis: ${report.synthesis}`);
    return;
  }

  if (subcommand === "validate") {
    const result = await validateResearch({ targetRoot, runId: options.run });
    console.log(result.status);
    for (const blocker of result.blockers) console.log(`blocker ${blocker}`);
    for (const concern of result.concerns) console.log(`concern ${concern}`);
    if (options.ci && (result.status === "FAIL" || (options.strict && result.concerns.length > 0))) process.exitCode = 1;
    return;
  }

  throw new Error("use `blueprint research plan|run|synthesize|report|validate`.");
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

async function updateMemory(root) {
  const passportText = await safeRead(path.join(root, "docs/product/product-passport.yaml"));
  const passport = passportText ? parseSimpleYaml(passportText) : {};
  const stories = await listMarkdown(path.join(root, "docs/stories"));
  const decisions = await listMarkdown(path.join(root, "docs/decisions"));
  const artifactRowsValue = await artifactRows(root);
  const memory = {
    product: {
      name: passport.product_name || "TBD",
      type: passport.product_type || "TBD",
      source: "docs/product/product-passport.yaml"
    },
    decisions: decisions.map((file) => ({ file: `docs/decisions/${file}` })),
    progress: {
      stage: passport.current_stage || "UNKNOWN",
      readiness: passport.readiness_status || "UNKNOWN",
      story_count: stories.length
    },
    artifacts: artifactRowsValue.map((row) => ({ path: row.path, exists: row.exists })),
    agent_handoffs: [],
    evidence: []
  };
  await fs.mkdir(path.join(root, ".blueprint/memory"), { recursive: true });
  await fs.writeFile(path.join(root, ".blueprint/memory/project-memory.yaml"), stringifySimpleYaml(memory), "utf8");
  await fs.writeFile(path.join(root, ".blueprint/memory/artifact-index.json"), JSON.stringify(memory.artifacts, null, 2), "utf8");
  await fs.writeFile(path.join(root, ".blueprint/memory/decisions.index.json"), JSON.stringify(memory.decisions, null, 2), "utf8");
}

async function compactMemory(root) {
  await updateMemory(root);
  const passportText = await safeRead(path.join(root, "docs/product/product-passport.yaml"));
  const readiness = await safeRead(path.join(root, "docs/readiness-review.md"));
  const stories = await listMarkdown(path.join(root, "docs/stories"));
  const compact = `# Compact Context

## Product Passport
${passportText}

## Readiness
${readiness.split(/\r?\n/).slice(0, 40).join("\n")}

## Stories
${stories.map((story) => `- docs/stories/${story}`).join("\n") || "- None"}

## Do Not Compress Away
- Commands
- Paths
- API/schema contracts
- Acceptance criteria
- Security/privacy warnings
`;
  await fs.mkdir(path.join(root, ".blueprint/memory"), { recursive: true });
  await fs.writeFile(path.join(root, ".blueprint/memory/compact-context.md"), compact, "utf8");
}

async function loadExtensions(root) {
  const extRoot = path.join(root, "extensions");
  try {
    const entries = await fs.readdir(extRoot, { withFileTypes: true });
    const extensions = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const manifestPath = path.join(extRoot, entry.name, "extension.yaml");
      const manifest = await safeRead(manifestPath);
      if (manifest) {
        const parsed = parseSimpleYaml(manifest);
        parsed._directory = path.join("extensions", entry.name);
        parsed._manifestPath = path.join("extensions", entry.name, "extension.yaml");
        extensions.push(parsed);
      }
    }
    return extensions;
  } catch {
    return [];
  }
}

async function evaluateExtensionGates(root) {
  const blockers = [];
  const concerns = [];
  const context = await extensionContext(root);
  const extensions = await loadExtensions(root);

  for (const extension of extensions) {
    const outputs = asArray(extension.outputs);
    const required = extensionIsRequired(extension, context);

    if (required && outputs.length === 0) {
      blockers.push(`${extension.name || extension._directory} is required but declares no outputs.`);
      continue;
    }

    for (const output of outputs) {
      const target = path.join(root, output);
      const existsOutput = await exists(target);
      const content = existsOutput ? await safeRead(target) : "";

      if (required && !existsOutput) {
        blockers.push(`${extension.name || extension._directory} is required but missing output: ${output}`);
        continue;
      }

      if (existsOutput && outputGateStatus(content) === "BLOCKED") {
        blockers.push(`${extension.name || extension._directory} output is BLOCKED: ${output}`);
      }
    }
  }

  return { blockers, concerns };
}

async function runExtensionHook(root, hook) {
  const extensions = await loadExtensions(root);
  let ran = 0;
  for (const extension of extensions) {
    if (!Array.isArray(extension.runs_on) || !extension.runs_on.includes(hook)) continue;
    ran += 1;
    for (const output of extension.outputs || []) {
      const target = path.join(root, output);
      if (await exists(target)) {
        console.log(`skip    ${output} (exists)`);
        continue;
      }
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, extensionOutputTemplate(extension, hook, output), "utf8");
      console.log(`create  ${output}`);
    }
  }
  if (ran === 0) console.log(`no extensions registered for ${hook}`);
}

async function extensionContext(root) {
  const files = [
    "docs/product/product-passport.yaml",
    "docs/product/prd.md",
    "docs/product/data-api-contract.md",
    "docs/architecture.md"
  ];
  const chunks = [];
  for (const file of files) {
    chunks.push(await safeRead(path.join(root, file)));
  }
  return normalizeText(chunks.join("\n"));
}

function extensionIsRequired(extension, context) {
  const requiredWhen = extension.required_when;
  if (!requiredWhen || typeof requiredWhen !== "object") return false;
  const flags = asArray(requiredWhen.risk_flags);
  if (flags.length === 0) return false;
  return flags.some((flag) => contextMatchesRiskFlag(context, flag));
}

function contextMatchesRiskFlag(context, flag) {
  const normalizedFlag = normalizeText(flag);
  const aliases = {
    auth: ["auth", "authentication", "login", "sign in", "role based access", "rbac"],
    authorization: ["authorization", "permission", "permissions", "role based", "rbac"],
    payment: ["payment", "payments", "billing", "tuition", "invoice", "checkout"],
    sensitive_data: ["sensitive data", "personal data", "privacy", "pii", "student data", "customer data"],
    personal_data: ["personal data", "privacy", "pii", "student data", "customer data"]
  };
  const terms = aliases[normalizedFlag.replaceAll(" ", "_")] || [normalizedFlag];
  return terms.some((term) => context.includes(normalizeText(term)));
}

function outputGateStatus(content) {
  const match = content.match(/##?\s*Gate Status\s*:?\s*\n?\s*([A-Z_]+)/i);
  return match ? match[1].toUpperCase() : "";
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== undefined && item !== null);
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function extensionOutputTemplate(extension, hook, output) {
  return `# ${extension.name}

Hook: ${hook}
Output: ${output}
Generated: ${new Date().toISOString()}

## Purpose
Document the review, gate, or artifact required by this extension.

## Findings
- TBD

## Gate Status
BLOCKED

## Required Before Proceeding
- Complete this artifact.
`;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
    child.on("error", reject);
  });
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
outputs:
  - docs/extensions/${slugify(name)}.md
permissions:
  - read_docs
  - write_docs
`;
}
