import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { templates, exampleTemplates, githubTemplates } from "./templates.js";
import { parseSimpleYaml, stringifySimpleYaml } from "./simple-yaml.js";
import { lintProject, validateProject } from "./validation.js";
import { indexReferences, statusReferences, syncReferences } from "./refs.js";
import {
  createResearchPlan,
  reportResearch,
  runResearch,
  synthesizeResearch,
  validateResearch
} from "./research.js";
import { resolveInside } from "./path-safety.js";

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
  "docs/ARTIFACT_DEPTH_STANDARD.md",
  "docs/SCHEMA_REFERENCE.md",
  "docs/EXAMPLE_COMPARISON.md",
  "docs/PROJECT_RECOVERY_GUIDE.md",
  "docs/COMMERCE_RISK_PLAYBOOK.md",
  "docs/TEST_MATRIX.md",
  "docs/TRACEABILITY_MATRIX.md",
  "docs/EDGE_CASE_MATRIX.md",
  "docs/MEMORY.md",
  "docs/product/product-passport.yaml",
  "docs/product/prd.md",
  "docs/product/ux-spec.md",
  "docs/product/data-api-contract.md",
  "docs/product/integration-protocol.md",
  "docs/specs/state-machines.yaml",
  "docs/specs/rbac.yaml",
  "docs/specs/error-codes.yaml",
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

const TARGET_GITIGNORE_ENTRIES = ["refs/vendor/", "refs/REFS_LOCK.json", ".blueprint/next.json"];

const COMMANDS = new Set([
  "help",
  "init",
  "start",
  "start-base",
  "start-deep",
  "approve",
  "next",
  "assess",
  "doctor",
  "status",
  "check",
  "explain-fail",
  "lint",
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
  const [rawCommand = "help", ...rest] = argv;
  const command = rawCommand === "/start" ? "start" : rawCommand;
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
    case "start":
      await commandStartBase(parseOptions(rest));
      return;
    case "start-base":
      await commandStartBase(parseOptions(rest));
      return;
    case "start-deep":
      await commandStartDeep(parseOptions(rest));
      return;
    case "approve":
      await commandApprove(parseOptions(rest));
      return;
    case "next":
      await commandNext(parseOptions(rest));
      return;
    case "assess":
      await commandAssess(parseOptions(rest));
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
    case "explain-fail":
      await commandExplainFail(parseOptions(rest));
      return;
    case "lint":
      await commandLint(parseOptions(rest));
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
  blueprint start-base "I want to build ..." [--directory <path>] [--depth quick|standard|deep] [--run-research] [--json]
  blueprint start "I want to build ..." [--directory <path>] [--depth quick|standard|deep] [--run-research] [--json]
  blueprint /start "I want to build ..." [--directory <path>] [--depth quick|standard|deep] [--run-research] [--json]
  blueprint start-deep [--from-latest] [--directory <path>] [--dry-run] [--json]
  blueprint approve [--from-latest] [--yes] [--directory <path>] [--dry-run] [--json]
  blueprint next [--directory <path>] [--json]
  blueprint assess [--directory <path>] [--json] [--ci --min-score <number>]
  blueprint doctor [--directory <path>] [--ci]
  blueprint --version
  blueprint status [--directory <path>]
  blueprint check [--directory <path>] [--strict]
  blueprint explain-fail [--directory <path>]
  blueprint lint [--directory <path>] [--strict] [--ci]
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
  blueprint github create-issues [--directory <path>] [--use-gh --repo owner/name --confirm-publish] [--force]
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
  const target = resolveInside(root, relativePath, "template output");
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

async function writeProfessionalFiles(root, files, options = {}) {
  const results = [];
  for (const [relativePath, content] of Object.entries(files)) {
    const target = resolveInside(root, relativePath, "professional workflow output");
    const alreadyExists = await exists(target);
    if (alreadyExists) {
      const existing = await safeRead(target);
      if (!options.override && !containsObviousPlaceholder(existing)) {
        results.push({ relativePath, action: "skip", reason: "existing-non-placeholder" });
        continue;
      }
    }
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, "utf8");
    results.push({ relativePath, action: alreadyExists ? "update" : "create" });
  }
  return results;
}

async function writeMany(root, files, options) {
  const results = [];
  for (const [relativePath, content] of Object.entries(files)) {
    results.push(await writeFileSafe(root, relativePath, content, options));
  }
  return results;
}

async function readDirectoryTemplates(relativeRoot, skip = new Set()) {
  const absoluteRoot = path.join(repoRoot, relativeRoot);
  const files = {};

  async function walk(currentDir) {
    let entries = [];
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;
      const relativePath = path.relative(repoRoot, absolutePath).replaceAll("\\", "/");
      if (relativePath.endsWith(".blueprint/next.json")) continue;
      if (skip.has(relativePath)) continue;
      files[relativePath] = await fs.readFile(absolutePath, "utf8");
    }
  }

  await walk(absoluteRoot);
  return files;
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

  const files = { ...templates, ...(await readDirectoryTemplates("docs", new Set(["docs/TEST_MATRIX.md"]))) };
  if (options["with-examples"]) {
    Object.assign(files, exampleTemplates);
    Object.assign(files, await readDirectoryTemplates("examples"));
  }
  if (options["with-github"]) {
    Object.assign(files, githubTemplates);
  }

  const results = await writeMany(root, files, options);
  results.push(...(await ensureTargetGitignore(root, options)));
  printWriteResults(root, results, options);
  const next = {
    command: "blueprint start-base \"<ý tưởng sản phẩm>\"",
    prompt: "Framework đã được cài. Hãy gửi /start <ý tưởng> hoặc chạy blueprint start-base \"<ý tưởng>\" để phân tích sơ bộ trước khi viết tài liệu sâu.",
    reason: "A new harness needs a product idea before deep planning.",
    updated_at: new Date().toISOString()
  };
  if (!options["dry-run"]) await writeNext(root, next);
  if (!options.json) printNext(next);
}

async function commandStartBase(options) {
  const root = resolveDirectory(options);
  const idea = (options.idea || options._.join(" ")).trim();
  if (!idea) {
    throw new Error('start-base requires an idea, for example: blueprint start-base "I want to build a student management app".');
  }

  const depth = options.depth || "deep";
  const runId = workflowRunId(idea);
  const intakeRoot = path.join(root, ".blueprint/intake", runId);
  const docsIntakeRoot = path.join(root, "docs/intake");
  const questions = intakeQuestions(idea);
  let researchPath = `.blueprint/research/runs/${runId}`;
  if (!options["dry-run"]) {
    const research = options["run-research"]
      ? await runResearch({ repoRoot, targetRoot: root, topic: idea, depth })
      : await createResearchPlan({ targetRoot: root, topic: idea, depth });
    researchPath = path.relative(root, research.runDir).replaceAll("\\", "/");
  }

  const files = {
    "00-raw-input.md": rawInputTemplate({ idea, runId }),
    "00-base-analysis.md": baseAnalysisTemplate({ idea, questions }),
    "01-questions.md": questionsTemplate({ idea, questions }),
    "02-multi-agent-plan.md": multiAgentPlanTemplate({ idea, researchPath }),
    "03-verification-gate.md": verificationGateTemplate({ idea }),
    "04-human-approval.md": humanApprovalTemplate({ idea }),
    "05-documentation-workplan.md": documentationWorkplanTemplate({ idea }),
    "orchestrator-prompt.md": orchestratorPromptTemplate({ idea, questions, researchPath }),
    "next-commands.md": nextCommandsTemplate({ idea, depth })
  };

  if (!options["dry-run"]) {
    await fs.mkdir(intakeRoot, { recursive: true });
    await fs.mkdir(docsIntakeRoot, { recursive: true });
    for (const [file, content] of Object.entries(files)) {
      await fs.writeFile(path.join(intakeRoot, file), content, "utf8");
    }
    await fs.writeFile(path.join(docsIntakeRoot, `${runId}.md`), startSummaryTemplate({ idea, runId, questions, researchPath }), "utf8");
    await fs.writeFile(
      path.join(root, ".blueprint/intake/latest.json"),
      `${JSON.stringify(
        {
          run_id: runId,
          idea,
          intake_dir: path.relative(root, intakeRoot).replaceAll("\\", "/"),
          research_dir: researchPath,
          approval_status: "PENDING",
          workflow_phase: "START_BASE",
          depth
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    await writeProfessionalFiles(
      root,
      {
        "docs/product/project-brief.md": projectBriefTemplate({ idea }),
        "docs/product/feature-map.md": featureMapTemplate({ idea }),
        "docs/product/mvp-scope.md": mvpScopeTemplate({ idea })
      },
      options
    );
  }

  const next = nextForStartBase({ root, runId, idea });
  if (!options["dry-run"]) await writeNext(root, next);

  if (options.json) {
    console.log(JSON.stringify({ run_id: runId, idea, research_path: researchPath, questions, next }, null, 2));
    return;
  }

  console.log(`${options["dry-run"] ? "would create" : "created"} .blueprint/intake/${runId}`);
  console.log(`${options["run-research"] ? "research run" : "research plan"} ${researchPath}`);
  console.log("ask these first:");
  questions.slice(0, 5).forEach((question, index) => {
    console.log(`${index + 1}. ${question}`);
  });
  console.log("human gate: answer questions before start-deep.");
  printNext(next);
}

async function commandStartDeep(options) {
  const root = resolveDirectory(options);
  const latest = await readLatestIntake(root);
  const idea = (options.idea || options._.join(" ") || latest?.idea || "").trim();
  if (!idea) {
    throw new Error('start-deep requires an idea or --from-latest after start-base.');
  }
  if (options["from-latest"] && !latest) {
    throw new Error("start-deep --from-latest could not find .blueprint/intake/latest.json.");
  }

  const runId = latest?.run_id || workflowRunId(idea);
  const deepFiles = professionalDeepFiles({ idea, runId });
  const next = nextForStartDeep({ root, runId, idea });

  if (options["dry-run"]) {
    if (options.json) {
      console.log(JSON.stringify({ run_id: runId, idea, would_create: Object.keys(deepFiles), next }, null, 2));
      return;
    }
    console.log(`would create professional deep plan for ${runId}`);
    for (const file of Object.keys(deepFiles)) console.log(`would create ${file}`);
    printNext(next);
    return;
  }

  const results = await writeProfessionalFiles(root, deepFiles, options);
  if (latest) {
    latest.workflow_phase = "START_DEEP";
    latest.deep_plan_status = "READY_FOR_REVIEW";
    latest.deep_docs = Object.keys(deepFiles);
    await writeLatestIntake(root, latest);
  }
  if (!options.json) await writeNext(root, next);

  if (options.json) {
    console.log(JSON.stringify({ run_id: runId, idea, created: results, next }, null, 2));
    return;
  }

  console.log(`created professional deep plan for ${runId}`);
  for (const result of results) {
    const suffix = result.reason ? ` (${result.reason})` : "";
    console.log(`${result.action.padEnd(7)} ${result.relativePath}${suffix}`);
  }
  printNext(next);
}

async function commandApprove(options) {
  const root = resolveDirectory(options);
  const latest = await readLatestIntake(root);
  if (options["from-latest"] && !latest) {
    throw new Error("approve --from-latest could not find .blueprint/intake/latest.json.");
  }
  if (!latest) {
    throw new Error("approve requires an existing start-base/start-deep run.");
  }
  if (!options.yes && !options["dry-run"]) {
    throw new Error("approve requires --yes to record human approval.");
  }

  const approval = {
    run_id: latest.run_id,
    idea: latest.idea,
    approved_at: new Date().toISOString(),
    approved_by: "human",
    approval_status: "APPROVED_FOR_READINESS",
    note: "Human approved the blueprint plan for lint/readiness review. Implementation still requires readiness."
  };
  const approvalPath = `.blueprint/approvals/${latest.run_id}.json`;
  const next = nextForApprove({ root, runId: latest.run_id, idea: latest.idea });

  if (options["dry-run"]) {
    if (options.json) {
      console.log(JSON.stringify({ would_write: approvalPath, approval, next }, null, 2));
      return;
    }
    console.log(`would write ${approvalPath}`);
    printNext(next);
    return;
  }

  latest.approval_status = "APPROVED_FOR_READINESS";
  latest.workflow_phase = "APPROVED";
  latest.approved_at = approval.approved_at;
  await writeLatestIntake(root, latest);
  await fs.mkdir(path.join(root, ".blueprint/approvals"), { recursive: true });
  await fs.writeFile(path.join(root, approvalPath), `${JSON.stringify(approval, null, 2)}\n`, "utf8");
  await updateHumanApprovalFile(root, latest);
  if (!options.json) await writeNext(root, next);

  if (options.json) {
    console.log(JSON.stringify({ wrote: approvalPath, approval, next }, null, 2));
    return;
  }

  console.log(`approved ${latest.run_id}`);
  console.log(`wrote ${approvalPath}`);
  printNext(next);
}

async function commandNext(options) {
  const root = resolveDirectory(options);
  const next = await readNext(root);
  if (options.json) {
    console.log(JSON.stringify(next || defaultNext(root), null, 2));
    return;
  }
  if (!next) {
    console.log("No next prompt recorded yet.");
    printNext(defaultNext(root));
    return;
  }
  printNext(next);
}

async function commandAssess(options) {
  const root = resolveDirectory(options);
  const report = await assessProject(root);
  const minScore = Number(options["min-score"] || 80);
  const scorePasses = report.score >= minScore;
  const weakest = report.roles.slice().sort((a, b) => a.score - b.score)[0];
  const next = {
    command: scorePasses ? "blueprint lint --ci" : "blueprint start-deep --from-latest",
    prompt:
      scorePasses
        ? "Điểm advisory đã đạt ngưỡng. Hãy chạy blueprint lint --ci và blueprint readiness để kiểm tra pre-code gate."
        : `Điểm advisory chưa đạt ngưỡng ${minScore}. Phần yếu nhất là ${weakest.role} (${weakest.score}/100); hãy bổ sung tài liệu còn thiếu rồi chạy lại assess.`,
    reason: scorePasses ? "Advisory score is ready for hard gates." : "Role-based advisory score is below the configured bar.",
    updated_at: new Date().toISOString()
  };
  if (!options.json) await writeNext(root, next);

  if (options.json) {
    console.log(JSON.stringify({ ...report, next }, null, 2));
  } else {
    console.log(`Assessment score: ${report.score}/100`);
    for (const role of report.roles) {
      console.log(`${role.score >= 80 ? "PASS" : "WARN"} ${role.role}: ${role.score}/100`);
      for (const finding of role.findings) console.log(`  - ${finding}`);
    }
    printNext(next);
  }

  if (options.ci && report.score < minScore) {
    process.exitCode = 1;
  }
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

  const next = {
    command: ok ? "blueprint init --directory . --yes --merge" : "blueprint doctor",
    prompt: ok
      ? "Doctor đã ổn. Nếu project chưa có harness, hãy chạy blueprint init --directory . --yes --merge, sau đó chạy blueprint start-base \"<ý tưởng sản phẩm>\"."
      : "Doctor phát hiện môi trường chưa ổn. Hãy sửa Node.js/framework root/target directory rồi chạy lại blueprint doctor.",
    reason: ok ? "Environment is ready for project setup." : "Doctor checks must pass before setup or validation.",
    updated_at: new Date().toISOString()
  };
  if (targetExists) await emitNext(root, next, options);
  else if (!options.json) printNext(next);
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
  await recordNext(
    root,
    "blueprint check",
    "Status đã hiển thị tình trạng hiện tại. Hãy chạy blueprint check để phân biệt lỗi cấu trúc và concern trước khi đi sâu.",
    "Status is informational; check gives actionable structure findings."
  );
}

async function commandCheck(options) {
  const root = resolveDirectory(options);
  const result = await validateProject(root, REQUIRED_ARTIFACTS);
  const missing = result.missing;
  const concerns = result.concerns;
  const failures = result.failures;

  if (missing.length === 0 && concerns.length === 0 && failures.length === 0) {
    console.log("PASS blueprint structural check");
    const next = {
      command: "blueprint lint --ci",
      prompt: "Structural check đã pass. Hãy chạy blueprint lint --ci để kiểm tra chất lượng tài liệu trước readiness.",
      reason: "Structural pass only proves files exist; lint checks depth.",
      updated_at: new Date().toISOString()
    };
    await writeNext(root, next);
    printNext(next);
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
  const next = {
    command: hasFailures ? "blueprint explain-fail" : "blueprint lint --ci",
    prompt: hasFailures
      ? "Structural check còn lỗi. Hãy chạy blueprint explain-fail, sửa artifact thiếu/hỏng, rồi chạy lại check."
      : "Structural check có concern nhưng không blocker. Hãy chạy blueprint lint --ci để biết tài liệu đã đủ sâu chưa.",
    reason: hasFailures ? "Structural failures block adoption." : "Concerns should be resolved before implementation.",
    updated_at: new Date().toISOString()
  };
  await writeNext(root, next);
  printNext(next);
}

async function commandLint(options) {
  const root = resolveDirectory(options);
  const result = await lintProject(root, REQUIRED_ARTIFACTS);
  const missing = result.missing;
  const failures = result.failures;
  const concerns = result.concerns;
  const hasFailures = missing.length > 0 || failures.length > 0;
  const status = hasFailures ? "FAIL" : concerns.length > 0 ? "PASS_WITH_CONCERNS" : "PASS";

  console.log(`${status} blueprint production lint`);
  for (const item of missing) console.log(`missing ${item}`);
  for (const item of failures) console.log(`failure ${item}`);
  for (const item of concerns) console.log(`concern ${item}`);

  if (options.ci && status !== "PASS") {
    process.exitCode = 1;
  } else if (options.strict && (hasFailures || concerns.length > 0)) {
    process.exitCode = 1;
  } else if (hasFailures) {
    process.exitCode = 1;
  }
  const next = {
    command: status === "PASS" ? "blueprint readiness" : "blueprint explain-fail",
    prompt:
      status === "PASS"
        ? "Production lint đã pass. Hãy chạy blueprint readiness để xác nhận pre-code gate."
        : "Production lint chưa pass. Hãy chạy blueprint explain-fail, sửa docs/spec/story/test matrix, rồi chạy lại lint.",
    reason: status === "PASS" ? "Lint passed; readiness can decide implementation gate." : "Lint blockers must be fixed before readiness.",
    updated_at: new Date().toISOString()
  };
  await writeNext(root, next);
  printNext(next);
}

async function commandExplainFail(options) {
  const root = resolveDirectory(options);
  const result = await lintProject(root, REQUIRED_ARTIFACTS);
  const items = [
    ...result.missing.map((item) => ({ type: "missing", text: item })),
    ...result.failures.map((item) => ({ type: "failure", text: item })),
    ...result.concerns.map((item) => ({ type: "concern", text: item }))
  ];

  if (items.length === 0) {
    console.log("PASS no lint failures to explain.");
    return;
  }

  console.log("# Blueprint Repair Checklist");
  console.log("");
  console.log("Run these before implementation:");
  console.log("1. blueprint init --directory . --yes --merge");
  console.log("2. Fill missing production artifacts, do not leave placeholder rows.");
  console.log("3. blueprint lint --directory . --ci");
  console.log("4. blueprint readiness --directory . --ci");
  console.log("");
  console.log("## Findings");
  for (const item of items) {
    console.log(`- ${item.type}: ${item.text}`);
    console.log(`  repair: ${repairHint(item.text)}`);
  }
  const next = {
    command: "blueprint lint --ci",
    prompt: "Hãy sửa lần lượt các repair item ở trên, sau đó chạy lại blueprint lint --ci và blueprint readiness.",
    reason: "The repair checklist is the shortest path back to readiness.",
    updated_at: new Date().toISOString()
  };
  await writeNext(root, next);
  printNext(next);
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
  const status = ready ? (concerns.length ? "READY_WITH_ACCEPTED_RISK" : "READY_FOR_IMPLEMENTATION") : "NOT_READY";
  const content = `# Readiness Review

Status: ${status}
Generated: ${new Date().toISOString()}

## Blockers
${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None"}

## Concerns
${concerns.length ? concerns.map((item) => `- ${item}`).join("\n") : "- None"}

## Required Before Code
${ready && concerns.length === 0 ? "- Approved story packet and context packet for each implementation agent." : ready ? "- Human must explicitly accept every concern with owner, impact, expiry, and rollback note before implementation." : "- Resolve blockers above, then rerun `blueprint readiness`."}
`;

  if (!options["dry-run"]) {
    await fs.mkdir(path.join(root, "docs"), { recursive: true });
    await fs.writeFile(path.join(root, "docs/readiness-review.md"), content, "utf8");
  }

  console.log(status);
  const next = nextForReadiness(status);
  if (!options["dry-run"]) await writeNext(root, next);
  if (!options.json) printNext(next);
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
  const next = {
    command: "blueprint export-context " + id + " --agent developer-agent",
    prompt: `Story ${id} đã được tạo. Hãy hoàn thiện acceptance criteria, scope, allowed/forbidden files, validation proof, rồi export context cho agent phù hợp.`,
    reason: "New story packets need completion before implementation context export.",
    updated_at: new Date().toISOString()
  };
  await writeNext(root, next);
  printNext(next);
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
  await recordNext(
    root,
    "blueprint memory update",
    `Decision ${nextNumber} đã được tạo. Hãy điền context/options/consequences, cập nhật trace nếu ảnh hưởng story hoặc architecture, rồi chạy blueprint memory update.`,
    "Decision records should be captured in project memory before handoff."
  );
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
- docs/product/integration-protocol.md
- docs/specs/state-machines.yaml
- docs/specs/rbac.yaml
- docs/specs/error-codes.yaml
- ${path.relative(root, storyFile).replaceAll("\\", "/")}
- docs/TEST_MATRIX.md
- docs/TRACEABILITY_MATRIX.md
- docs/EDGE_CASE_MATRIX.md

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
  const next = {
    command: "blueprint lint --ci",
    prompt: `Context packet cho ${storyId} đã sẵn sàng. Hãy triển khai đúng story scope, chạy test liên quan, cập nhật TEST_MATRIX evidence và memory.`,
    reason: "Implementation should stay bound to the exported context packet.",
    updated_at: new Date().toISOString()
  };
  await writeNext(root, next);
  printNext(next);
}

async function commandMemory(args) {
  const subcommand = args[0] || "show";
  const options = parseOptions(args.slice(1));
  const root = resolveDirectory(options);
  const memoryPath = path.join(root, ".blueprint/memory/project-memory.yaml");
  if (subcommand === "update") {
    await updateMemory(root);
    console.log("updated .blueprint/memory/project-memory.yaml");
    await recordNext(
      root,
      "blueprint memory compact",
      "Memory đã cập nhật. Hãy chạy blueprint memory compact nếu cần handoff cho agent khác, hoặc blueprint readiness nếu đang chuẩn bị mở implementation.",
      "Fresh memory can be compacted for agent handoff or used by readiness review."
    );
    return;
  }
  if (subcommand === "compact") {
    await compactMemory(root);
    console.log("created .blueprint/memory/compact-context.md");
    await recordNext(
      root,
      "blueprint export-context US-001 --agent developer-agent",
      "Compact context đã sẵn sàng. Nếu readiness đã pass, hãy export context cho story đầu tiên; nếu chưa, chạy blueprint lint --ci và blueprint readiness.",
      "Compact memory is useful once the implementation story is selected."
    );
    return;
  }
  if (subcommand !== "show") {
    throw new Error("use `blueprint memory show|update|compact`.");
  }
  const memory = await safeRead(memoryPath);
  console.log(memory || "No project memory found. Run `blueprint init` first.");
  await recordNext(
    root,
    memory ? "blueprint status" : "blueprint init --directory . --yes",
    memory
      ? "Memory đã được hiển thị. Hãy chạy blueprint status để đối chiếu stage/readiness/artifact, hoặc memory compact để handoff ngắn gọn."
      : "Project chưa có memory. Hãy chạy blueprint init --directory . --yes, sau đó start-base cho ý tưởng sản phẩm.",
    memory ? "Status summarizes the current project state after memory review." : "Memory is created by project initialization and updates."
  );
}

async function commandExtension(args) {
  const subcommand = args[0];
  const options = parseOptions(args.slice(1));
  if (subcommand === "list") {
    const root = resolveDirectory(options);
    for (const ext of await loadExtensions(root)) {
      console.log(`${ext.name} (${ext.type}) hooks=${(ext.runs_on || []).join(",")}`);
    }
    await recordNext(
      root,
      "blueprint extension run before_readiness",
      "Extension list đã hiển thị. Hãy chạy hook phù hợp như blueprint extension run before_readiness trước readiness, hoặc tạo extension mới nếu thiếu gate chuyên môn.",
      "Extensions are only useful when their hooks are run before the matching gate."
    );
    return;
  }
  if (subcommand === "run") {
    const hook = options._[0];
    if (!hook) throw new Error("extension run requires a hook name.");
    const root = resolveDirectory(options);
    await runExtensionHook(root, hook);
    await recordNext(
      root,
      "blueprint readiness",
      `Hook ${hook} đã chạy. Hãy đọc output extension, sửa BLOCKED/WARN nếu có, rồi chạy blueprint readiness.`,
      "Readiness enforces required extension outputs and blocked extension reports."
    );
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
  const results = await writeMany(root, files, { merge: true, ...options });
  printWriteResults(root, results, options);
  await emitNext(
    root,
    {
      command: `blueprint extension run before_readiness`,
      prompt: `Extension ${slugify(name)} đã được tạo. Hãy chỉnh extension.yaml, khai báo required_when/outputs, rồi chạy blueprint extension run before_readiness để sinh báo cáo gate.`,
      reason: "New extensions should be connected to a lifecycle hook before they can influence readiness.",
      updated_at: new Date().toISOString()
    },
    options
  );
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
  await emitNext(
    root,
    {
      command: "blueprint check",
      prompt: "GitHub integration đã được thêm. Hãy review PR template/workflow, chạy blueprint check và blueprint lint --ci trước khi push CI.",
      reason: "The GitHub workflow should be verified locally before remote CI enforces it.",
      updated_at: new Date().toISOString()
    },
    options
  );
}

async function commandGithub(args) {
  const subcommand = args[0];
  const options = parseOptions(args.slice(1));
  if (subcommand !== "create-issues") {
    throw new Error("use `blueprint github create-issues [--use-gh --repo owner/name --confirm-publish]`.");
  }
  const root = resolveDirectory(options);
  if (options["use-gh"]) {
    if (!options.repo) {
      throw new Error("live GitHub issue creation requires --repo owner/name to avoid publishing to the wrong repository.");
    }
    if (!options["confirm-publish"]) {
      throw new Error("live GitHub issue creation publishes story text. Re-run with --confirm-publish after reviewing generated issue bodies.");
    }
  }

  const outDir = resolveInside(root, ".blueprint/github/issues", "GitHub issue export directory");
  const indexPath = resolveInside(root, ".blueprint/github/issues.index.json", "GitHub issue index");
  const issueIndex = await readJson(indexPath, {});
  await fs.mkdir(outDir, { recursive: true });
  const storiesDir = path.join(root, "docs/stories");
  const stories = await listMarkdown(storiesDir);
  for (const story of stories) {
    const storyPath = path.join(storiesDir, story);
    const text = await readText(storyPath);
    const id = story.match(/US-\d{3}/)?.[0] || slugify(story.replace(/\.md$/, ""));
    const title = text.split(/\r?\n/)[0].replace(/^#\s*/, "");
    const body = `# ${title}

Generated from ${path.relative(root, storyPath).replaceAll("\\", "/")}.

${text}
`;
    const bodyFile = resolveInside(outDir, `${id}.md`, "GitHub issue body");
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
      ghArgs.push("--repo", options.repo);
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
  await recordNext(
    root,
    options["use-gh"] ? "blueprint next" : "blueprint github create-issues --use-gh --repo owner/name --confirm-publish",
    options["use-gh"]
      ? "GitHub issues đã được publish hoặc cập nhật index. Hãy review issue tracker, gắn milestone/assignee, rồi tiếp tục export context cho story ưu tiên."
      : "Issue bodies đã được export nội bộ. Hãy review .blueprint/github/issues/*.md; nếu ổn mới chạy lại với --use-gh --repo owner/name --confirm-publish.",
    options["use-gh"] ? "Live GitHub publishing should be followed by tracker hygiene." : "Dry issue export prevents accidental public issue spam."
  );
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
    await emitNext(
      targetRoot,
      {
        command: "blueprint refs status",
        prompt: "References đã sync. Hãy chạy blueprint refs status để kiểm tra lock/drift, sau đó dùng blueprint research run --topic \"<chủ đề>\" --depth deep để tổng hợp bài học áp dụng.",
        reason: "Reference repos should be checked before they are used as research evidence.",
        updated_at: new Date().toISOString()
      },
      options
    );
    return;
  }

  if (subcommand === "status") {
    const rows = await statusReferences({ repoRoot, targetRoot });
    for (const row of rows) {
      const commit = row.commit ? row.commit.slice(0, 12) : "missing";
      const locked = row.lock_matches ? "lock-ok" : row.locked_commit ? "lock-drift" : "no-lock";
      console.log(`${row.status.padEnd(8)} ${row.name.padEnd(32)} ${commit} ${locked}`);
    }
    await recordNext(
      targetRoot,
      "blueprint refs index",
      "Refs status đã hiển thị. Hãy chạy blueprint refs index để tạo inventory có thể audit, rồi chạy research/synthesize nếu cần đưa bài học vào tài liệu.",
      "An indexed reference set is easier to cite and audit."
    );
    return;
  }

  if (subcommand === "index") {
    const index = await indexReferences({ repoRoot, targetRoot });
    for (const reference of index.references) {
      console.log(`${reference.status.padEnd(8)} ${reference.name.padEnd(32)} files=${reference.file_count}`);
    }
    console.log("created .blueprint/refs/index.json");
    await recordNext(
      targetRoot,
      "blueprint research run --topic \"<chủ đề cần nghiên cứu>\" --depth deep",
      "Refs index đã tạo. Hãy chạy research run cho chủ đề cụ thể, sau đó synthesize để biến tài liệu tham khảo thành quyết định áp dụng.",
      "Research runs connect vendored references to project decisions."
    );
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
    await recordNext(
      targetRoot,
      `blueprint research run --topic "${topic}" --depth ${depth}`,
      "Research plan đã tạo. Hãy chạy research run để thu thập findings/claim map, rồi synthesize trước khi start-deep hoặc approve.",
      "A plan becomes useful once it is executed against references and project docs."
    );
    return;
  }

  if (subcommand === "run") {
    const result = await runResearch({ repoRoot, targetRoot, topic, depth });
    console.log(`created .blueprint/research/runs/${result.runId}`);
    console.log(`findings ${result.findings.length}`);
    console.log(`claims ${result.claimMap.claims.length}`);
    await recordNext(
      targetRoot,
      `blueprint research synthesize --run ${result.runId}`,
      "Research run đã có findings và claims. Hãy chạy synthesize để tạo báo cáo reference synthesis có thể dùng trong deep plan.",
      "Synthesis turns raw findings into project-facing guidance."
    );
    return;
  }

  if (subcommand === "synthesize") {
    const result = await synthesizeResearch({ targetRoot, runId: options.run });
    console.log(`updated ${path.relative(targetRoot, path.join(result.runDir, "synthesis.md")).replaceAll("\\", "/")}`);
    console.log("updated docs/research/latest-reference-synthesis.md");
    await recordNext(
      targetRoot,
      options.run ? `blueprint research validate --run ${options.run}` : "blueprint research validate",
      "Research synthesis đã cập nhật. Hãy validate research để bắt thiếu reference/claim, rồi đưa kết luận vào start-deep hoặc decision records.",
      "Validated synthesis is safer to use as planning evidence."
    );
    return;
  }

  if (subcommand === "report") {
    const report = await reportResearch({ targetRoot, runId: options.run });
    console.log(`Run: ${report.run}`);
    console.log(`References: ${report.present_references}/${report.references} present`);
    console.log(`Findings: ${report.findings}`);
    console.log(`Claims: ${report.claims}`);
    console.log(`Synthesis: ${report.synthesis}`);
    await recordNext(
      targetRoot,
      options.run ? `blueprint research validate --run ${options.run}` : "blueprint research validate",
      "Research report đã hiển thị. Hãy validate run này, sau đó sửa missing/concern trước khi dùng kết quả trong tài liệu.",
      "Research validation catches incomplete source synthesis."
    );
    return;
  }

  if (subcommand === "validate") {
    const result = await validateResearch({ targetRoot, runId: options.run });
    console.log(result.status);
    for (const blocker of result.blockers) console.log(`blocker ${blocker}`);
    for (const concern of result.concerns) console.log(`concern ${concern}`);
    if (options.ci && (result.status === "FAIL" || (options.strict && result.concerns.length > 0))) process.exitCode = 1;
    await recordNext(
      targetRoot,
      result.status === "PASS" ? "blueprint start-deep --from-latest" : "blueprint research synthesize",
      result.status === "PASS"
        ? "Research đã pass. Hãy chạy start-deep --from-latest để sinh bộ tài liệu chuyên sâu dựa trên findings đã kiểm."
        : "Research chưa pass. Hãy bổ sung refs/findings/synthesis theo blocker/concern rồi validate lại trước khi approve.",
      result.status === "PASS" ? "Validated research can feed deep planning." : "Invalid research should not drive planning decisions."
    );
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

async function readLatestIntake(root) {
  return readJson(path.join(root, ".blueprint/intake/latest.json"), null);
}

async function writeLatestIntake(root, latest) {
  await fs.mkdir(path.join(root, ".blueprint/intake"), { recursive: true });
  await fs.writeFile(path.join(root, ".blueprint/intake/latest.json"), `${JSON.stringify(latest, null, 2)}\n`, "utf8");
}

async function readNext(root) {
  return readJson(path.join(root, ".blueprint/next.json"), null);
}

async function writeNext(root, next) {
  await fs.mkdir(path.join(root, ".blueprint"), { recursive: true });
  await fs.writeFile(path.join(root, ".blueprint/next.json"), `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

async function emitNext(root, next, options = {}) {
  if (!options["dry-run"] && !options.json) await writeNext(root, next);
  if (!options.json) printNext(next);
  return next;
}

async function recordNext(root, command, prompt, reason) {
  const next = { command, prompt, reason, updated_at: new Date().toISOString() };
  await writeNext(root, next);
  printNext(next);
  return next;
}

function printNext(next) {
  console.log("");
  console.log(`Next command: ${next.command}`);
  console.log("Suggested prompt:");
  console.log(next.prompt);
  if (next.reason) console.log(`Reason: ${next.reason}`);
}

function defaultNext(root) {
  return {
    command: "blueprint start-base \"<ý tưởng sản phẩm>\"",
    prompt: "Tôi muốn bắt đầu một dự án mới. Hãy chạy start-base để phân tích sơ bộ, hỏi câu cần thiết, rồi gợi ý bước tiếp theo.",
    reason: `No next prompt recorded for ${root}.`,
    updated_at: new Date().toISOString()
  };
}

function nextForStartBase({ runId, idea }) {
  return {
    command: "blueprint start-deep --from-latest",
    prompt: `Tôi trả lời các câu hỏi base cho "${idea}" như sau:\nQ1: ...\nQ2: ...\nQ3: ...\nHãy chạy blueprint start-deep --from-latest, nghiên cứu sâu hơn, lập feature map, epics, stories, frontend/backend/API/security/SEO/code rules.`,
    reason: `Base analysis ${runId} is ready for answers and deep planning.`,
    updated_at: new Date().toISOString()
  };
}

function nextForStartDeep({ runId, idea }) {
  return {
    command: "blueprint approve --from-latest --yes",
    prompt: `Tôi đã đọc deep plan cho "${idea}". Hãy đóng vai verifier/PM/architect/security reviewer, chỉ ra rủi ro hoặc điểm mơ hồ cần sửa trước khi approve. Nếu ổn, hãy ghi nhận để chạy blueprint approve --from-latest --yes.`,
    reason: `Deep plan ${runId} needs human review before lint/readiness.`,
    updated_at: new Date().toISOString()
  };
}

function nextForApprove({ runId }) {
  return {
    command: "blueprint lint --ci && blueprint readiness",
    prompt: `Kế hoạch ${runId} đã được approve. Hãy chạy blueprint lint --ci và blueprint readiness, sửa mọi blocker trong tài liệu, rồi chuẩn bị context packet cho story đầu tiên khi READY_FOR_IMPLEMENTATION.`,
    reason: "Human approval recorded; hard gates still decide whether implementation can start.",
    updated_at: new Date().toISOString()
  };
}

function nextForReadiness(status) {
  if (status === "READY_FOR_IMPLEMENTATION") {
    return {
      command: "blueprint export-context US-001 --agent developer-agent",
      prompt: "Readiness đã pass. Hãy export context cho story đầu tiên, triển khai đúng story scope, chạy test, cập nhật evidence và memory.",
      reason: "Pre-code gate passed.",
      updated_at: new Date().toISOString()
    };
  }
  return {
    command: "blueprint explain-fail",
    prompt: "Readiness chưa pass. Hãy chạy blueprint explain-fail, sửa tài liệu/story/spec/test matrix theo checklist, rồi chạy lại blueprint lint --ci và blueprint readiness.",
    reason: `Readiness status is ${status}.`,
    updated_at: new Date().toISOString()
  };
}

async function updateHumanApprovalFile(root, latest) {
  const approvalFile = path.join(root, latest.intake_dir || "", "04-human-approval.md");
  if (!(await exists(approvalFile))) return;
  const oldText = await safeRead(approvalFile);
  const newText = oldText
    .replace(/APPROVED_FOR_DOCUMENTATION:\s*no/i, "APPROVED_FOR_DOCUMENTATION: yes")
    .replace(/- Pending\./i, `- Approved at ${latest.approved_at}.`);
  await fs.writeFile(approvalFile, newText, "utf8");
}

function professionalDeepFiles({ idea, runId }) {
  return {
    "docs/product/project-brief.md": projectBriefTemplate({ idea }),
    "docs/product/feature-map.md": featureMapTemplate({ idea }),
    "docs/product/mvp-scope.md": mvpScopeTemplate({ idea }),
    "docs/frontend/design-system.md": frontendDesignSystemTemplate({ idea }),
    "docs/frontend/component-architecture.md": frontendComponentArchitectureTemplate({ idea }),
    "docs/frontend/page-flow.md": frontendPageFlowTemplate({ idea }),
    "docs/frontend/seo.md": frontendSeoTemplate({ idea }),
    "docs/backend/backend-architecture.md": backendArchitectureTemplate({ idea }),
    "docs/backend/api-guidelines.md": backendApiGuidelinesTemplate({ idea }),
    "docs/backend/database-schema.md": backendDatabaseSchemaTemplate({ idea }),
    "docs/backend/error-handling.md": backendErrorHandlingTemplate({ idea }),
    "docs/security/security-privacy-seo.md": securityPrivacySeoTemplate({ idea }),
    "docs/delivery/DELIVERY_PLAN.md": deliveryPlanTemplate({ idea }),
    "docs/engineering/ENGINEERING_STANDARDS.md": engineeringStandardsTemplate({ idea }),
    "docs/specs/project-blueprint.yaml": projectBlueprintSpecTemplate({ idea, runId }),
    "docs/specs/engineering-standards.yaml": engineeringStandardsSpecTemplate({ idea }),
    "docs/epics/EPIC-001-product-foundation.md": epicTemplate("EPIC-001", "Product foundation", idea),
    "docs/stories/US-001-define-product-foundation.md": deepStoryTemplate("US-001", "Define product foundation", idea)
  };
}

async function assessProject(root) {
  const roles = [
    await assessRole(root, "PM", [
      ["Project brief exists", "docs/product/project-brief.md", ["Problem", "Outcome"]],
      ["MVP scope exists", "docs/product/mvp-scope.md", ["MVP", "Out Of Scope"]],
      ["Delivery plan exists", "docs/delivery/DELIVERY_PLAN.md", ["Milestones", "Definition of Ready"]]
    ]),
    await assessRole(root, "BA", [
      ["PRD has requirements", "docs/product/prd.md", ["Functional Requirements", "Acceptance Criteria"]],
      ["Feature map exists", "docs/product/feature-map.md", ["Feature Catalog", "Release Mapping"]],
      ["Traceability exists", "docs/TRACEABILITY_MATRIX.md", ["Requirement", "Story", "Evidence"]]
    ]),
    await assessRole(root, "UX", [
      ["UX spec exists", "docs/product/ux-spec.md", ["User Journeys", "Screens", "Accessibility"]],
      ["Design system exists", "docs/frontend/design-system.md", ["Color", "Typography", "Spacing"]],
      ["Page flow exists", "docs/frontend/page-flow.md", ["Routes", "States"]]
    ]),
    await assessRole(root, "Frontend", [
      ["Component architecture exists", "docs/frontend/component-architecture.md", ["Component", "Naming", "State"]],
      ["SEO doc exists", "docs/frontend/seo.md", ["Metadata", "Canonical", "Sitemap"]],
      ["Engineering standards exist", "docs/engineering/ENGINEERING_STANDARDS.md", ["SOLID", "Naming", "Testing"]]
    ]),
    await assessRole(root, "Backend", [
      ["Backend architecture exists", "docs/backend/backend-architecture.md", ["Layers", "Services", "Repository"]],
      ["Database schema exists", "docs/backend/database-schema.md", ["Entities", "Indexes", "Migrations"]],
      ["Error handling exists", "docs/backend/error-handling.md", ["Error Envelope", "Retryable"]]
    ]),
    await assessRole(root, "API", [
      ["Data/API contract exists", "docs/product/data-api-contract.md", ["Commands", "Queries", "Status Code"]],
      ["API guidelines exist", "docs/backend/api-guidelines.md", ["REST", "Versioning", "Pagination"]],
      ["Error codes exist", "docs/specs/error-codes.yaml", ["http_status", "retryable"]]
    ]),
    await assessRole(root, "Security", [
      ["Security/Privacy/SEO exists", "docs/security/security-privacy-seo.md", ["Authentication", "Authorization", "Privacy"]],
      ["RBAC exists", "docs/specs/rbac.yaml", ["roles", "permissions"]],
      ["Threat model extension is available", "extensions/security-threat-model/extension.yaml", ["required_when", "outputs"]]
    ]),
    await assessRole(root, "QA", [
      ["Test matrix exists", "docs/TEST_MATRIX.md", ["Scenario ID", "Command", "Evidence"]],
      ["Edge cases exist", "docs/EDGE_CASE_MATRIX.md", ["Trigger", "Expected behavior"]],
      ["Readiness review exists", "docs/readiness-review.md", ["Status"]]
    ]),
    await assessRole(root, "DevOps", [
      ["Workflow exists", "docs/WORKFLOW.md", ["RAW_INPUT", "READY_FOR_IMPLEMENTATION"]],
      ["Integration protocol exists", "docs/product/integration-protocol.md", ["Retry Policy", "Observability"]],
      ["GitHub workflow exists", ".github/workflows/blueprint-check.yml", ["blueprint"]]
    ])
  ];
  const score = Math.round(roles.reduce((total, role) => total + role.score, 0) / roles.length);
  return { score, roles, generated_at: new Date().toISOString() };
}

async function assessRole(root, role, checks) {
  let passed = 0;
  const findings = [];
  for (const [name, relativePath, markers] of checks) {
    const text = await safeRead(path.join(root, relativePath));
    if (!text) {
      findings.push(`${name}: missing ${relativePath}`);
      continue;
    }
    const missingMarkers = markers.filter((marker) => !text.toLowerCase().includes(marker.toLowerCase()));
    if (missingMarkers.length > 0 || containsObviousPlaceholder(text)) {
      findings.push(`${name}: incomplete markers (${missingMarkers.join(", ") || "placeholder content"})`);
      continue;
    }
    passed += 1;
  }
  return { role, score: Math.round((passed / checks.length) * 100), findings };
}

function containsObviousPlaceholder(text) {
  return /\b(TBD|TODO|lorem ipsum|sample placeholder|coming soon|to be defined)\b|chưa xác định/i.test(text);
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
      let target;
      try {
        target = resolveInside(root, output, `${extension.name || extension._directory} output`);
      } catch {
        blockers.push(`${extension.name || extension._directory} has unsafe output path: ${output}`);
        continue;
      }
      const existsOutput = await exists(target);
      const content = existsOutput ? await safeRead(target) : "";

      if (required && !existsOutput) {
        blockers.push(`${extension.name || extension._directory} is required but missing output: ${output}`);
        continue;
      }

      if (existsOutput && outputGateStatus(content) === "BLOCKED") {
        blockers.push(`${extension.name || extension._directory} output is BLOCKED: ${output}`);
      }
      if (existsOutput && extensionOutputIncomplete(content)) {
        blockers.push(`${extension.name || extension._directory} output is incomplete or placeholder: ${output}`);
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
      const target = resolveInside(root, output, `${extension.name || extension._directory} output`);
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

function extensionOutputIncomplete(content) {
  if (!content.trim()) return true;
  if (/\b(TBD|TODO|coming soon|to be defined|sample)\b|chưa xác định/i.test(content)) return true;
  for (const marker of ["## Findings", "## Gate Status"]) {
    if (!content.includes(marker)) return true;
  }
  return false;
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

function repairHint(text) {
  if (text.startsWith("docs/") || text.startsWith(".blueprint/") || text.startsWith("AGENTS.md")) {
    return "Run `blueprint init --directory . --yes --merge`, then fill the created artifact with project-specific content.";
  }
  if (/Status drift|Product Passport|risk_level|current_stage|readiness_status/i.test(text)) {
    return "Update `docs/product/product-passport.yaml` and `.blueprint/status.json` so stage/risk/readiness use the same values.";
  }
  if (/story|US-\d{3}|Definition|Proof Format|Agent Ownership|Lane/i.test(text)) {
    return "Regenerate or rewrite the story using the production story template: status, lane, DoR, DoD, contract links, edge cases, ownership, proof format.";
  }
  if (/research|simulated|planned\/simulated|source inventory|claim map/i.test(text)) {
    return "Replace simulated research with source inventory, evidence cards, claim map, conflicts, and named assumptions.";
  }
  if (/Data\/API Contract|Request|Response|Status Code|Event Payload|Authorization|Idempotency/i.test(text)) {
    return "Complete the Data/API Contract with request/response shapes, status codes, authorization, idempotency, event payloads, validation errors, and owners.";
  }
  if (/Integration Protocol|idempotency|retry|callback|dead letter|reconcile/i.test(text)) {
    return "Complete `docs/product/integration-protocol.md` with idempotency, retry, signature, callback ordering, dead-letter, and reconciliation rules.";
  }
  if (/TEST_MATRIX|boolean|yes\/no|test scenario|TC-|Fixture|Command|pending implementation/i.test(text)) {
    return "Replace yes/no cells with scenario IDs, commands, fixtures, expected evidence paths, owner, and status.";
  }
  if (/PRD|REQ-|AC-|requirement/i.test(text)) {
    return "Rewrite PRD requirements with stable IDs such as `REQ-CORE-001` and acceptance criteria IDs such as `AC-CORE-001`.";
  }
  if (/TRACEABILITY_MATRIX/i.test(text)) {
    return "Add rows mapping requirement -> spec contract -> story -> test scenario -> evidence -> owner.";
  }
  if (/EDGE_CASE_MATRIX/i.test(text)) {
    return "Add failure rows for duplicate submit, invalid input, permission denied, concurrent update, stale data, timeout, partial failure, retry exhaustion, authorization, and privacy where relevant.";
  }
  if (/State machine|state-machine|state_machines/i.test(text)) {
    return "Define states, transitions, guards, side effects, errors, terminal states, and linked stories in `docs/specs/state-machines.yaml`.";
  }
  if (/RBAC|roles|permission/i.test(text)) {
    return "Define role/resource/action rules, audit requirements, denial behavior, and linked stories in `docs/specs/rbac.yaml`.";
  }
  if (/Error-code|error-codes|error code/i.test(text)) {
    return "Define code, HTTP status, retryability, user/admin message, owner, and linked story in `docs/specs/error-codes.yaml`.";
  }
  return "Open `docs/ARTIFACT_DEPTH_STANDARD.md` and fill the affected artifact to implementation-ready depth.";
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

function workflowRunId(idea) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "Z");
  return `${stamp}-${slugify(idea).slice(0, 40) || "product-start"}`;
}

function intakeQuestions(idea) {
  const normalized = normalizeText(idea);
  const questions = [
    "Who are the primary users and which roles must exist in the MVP?",
    "What is the smallest useful MVP workflow from start to finish?",
    "Which data is sensitive, private, regulated, or dangerous to lose?",
    "Which actions require login, permissions, approval, audit logs, or admin control?",
    "What integrations, imports, payments, notifications, or external systems are required?",
    "Which frontend style, design system, color direction, responsive targets, and SEO needs matter for MVP?",
    "Which backend/API/data constraints, error rules, naming rules, and code standards must be enforced?",
    "Where should this run first: local, web, mobile, desktop, internal server, cloud, or SaaS?",
    "Which matters most for the first release: speed, cost, maintainability, scale, security, or polish?",
    "Do you already prefer a technology stack, database, hosting provider, UI style, or design system?",
    "What does success look like in measurable terms after the first release?",
    "What is explicitly out of scope for version 1?"
  ];

  if (/student|class|attendance|tuition|school|training/.test(normalized)) {
    questions.splice(2, 0, "Do students, teachers, parents, and admins all log in, or is this staff-only?");
    questions.splice(5, 0, "Is tuition only tracked internally, or does the product process payments?");
  }
  if (/shop|commerce|payment|booking|order/.test(normalized)) {
    questions.splice(4, 0, "Which payment, booking, inventory, refund, or order states must be supported in MVP?");
  }
  if (/ai|agent|automation|workflow/.test(normalized)) {
    questions.splice(4, 0, "Which decisions can the automation make by itself, and which require human approval?");
  }

  return [...new Set(questions)].slice(0, 12);
}

function rawInputTemplate({ idea, runId }) {
  return `# Raw Product Input

Run: ${runId}
Created: ${new Date().toISOString()}

## User Prompt
${idea}

## Rule
Do not write implementation code from this input. Convert it into questions, research, a multi-agent plan, verification, human approval, and then full documentation.
`;
}

function baseAnalysisTemplate({ idea, questions }) {
  return `# Base Analysis

Idea: ${idea}

## Initial Understanding
This product request must be clarified before any implementation starts. The base pass identifies product intent, users, MVP boundaries, risk, and unknowns.

## Likely Discovery Areas
- Domain and business workflow.
- Primary users, roles, and permissions.
- MVP outcome and success metrics.
- Sensitive data and operational risk.
- Frontend, backend, API, security, SEO, and delivery expectations.

## Required Answers Before Deep Plan
${questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}

## Base Decision
Proceed to \`blueprint start-deep --from-latest\` only after the answers are good enough to avoid inventing product truth.
`;
}

function questionsTemplate({ idea, questions }) {
  return `# Clarifying Questions

Idea: ${idea}

Ask only these questions first. Do not ask questions that reference research or project docs can answer.

${questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}

## Answer Format

\`\`\`text
Q1: ...
Q2: ...
Q3: ...
\`\`\`
`;
}

function multiAgentPlanTemplate({ idea, researchPath }) {
  return `# Multi-Agent Plan

Idea: ${idea}
Research context: ${researchPath}

## Stage 1: Orchestrator
- Read raw input and answers.
- Classify product type, risk lane, and missing decisions.
- Keep implementation blocked.

## Stage 2: Research Agents
- Reference research agent: use refs and research outputs.
- Domain research agent: identify common product modules, risks, and patterns.
- Technology research agent: compare stack options only after product intent is clear.

## Stage 3: Planning Agents
- Product agent: Product Passport and PRD.
- UX agent: flows, screens, states, accessibility.
- Architect agent: stack options, module boundaries, deployment.
- Data/API agent: entities, commands, queries, permissions.
- Scrum planner: epics, stories, dependencies.
- QA agent: test matrix and evidence expectations.
- Risk reviewer: security, privacy, cost, accessibility, performance.

## Stage 4: Verification Agents
- Consistency reviewer: checks contradictions across docs.
- Evidence reviewer: checks research claims have source evidence.
- Readiness reviewer: checks no placeholder can pass.

## Stage 5: Human Approval
Human approves the plan before documentation writing proceeds.

## Stage 6: Documentation Production
Agents write full docs only after approval, then run readiness.
`;
}

function verificationGateTemplate({ idea }) {
  return `# Verification Gate

Idea: ${idea}

## Verify Before Human Approval
- Questions are answered or marked as assumptions.
- Research has source inventory, findings, claim map, and synthesis.
- Plan names agents, outputs, dependencies, and forbidden actions.
- Security/privacy/data risks are explicit.
- Technology choice is proposed, not silently locked.
- Documentation outputs are listed.
- Implementation remains blocked.

## Status
PENDING_VERIFICATION
`;
}

function humanApprovalTemplate({ idea }) {
  return `# Human Approval

Idea: ${idea}

Human approval is required before agents write the full product document set.

## Decision
APPROVED_FOR_DOCUMENTATION: no

## Human Notes
- Pending.

## Approval Criteria
- The clarifying questions are answered enough for planning.
- Research and assumptions are acceptable.
- The multi-agent plan is understandable.
- The technology decision process is acceptable.
- The requested document outputs are correct.
`;
}

function documentationWorkplanTemplate({ idea }) {
  return `# Documentation Workplan

Idea: ${idea}

After human approval, create or update:

1. docs/product/product-passport.yaml
2. docs/product/project-brief.md
3. docs/product/feature-map.md
4. docs/product/mvp-scope.md
5. docs/research/latest-reference-synthesis.md
6. docs/product/prd.md
7. docs/product/ux-spec.md
8. docs/frontend/
9. docs/backend/
10. docs/security/security-privacy-seo.md
11. docs/engineering/ENGINEERING_STANDARDS.md
12. docs/delivery/DELIVERY_PLAN.md
13. docs/architecture.md
14. docs/product/data-api-contract.md
15. docs/product/integration-protocol.md
16. docs/specs/
17. docs/decisions/
18. docs/epics/
19. docs/stories/
20. docs/TRACEABILITY_MATRIX.md
21. docs/EDGE_CASE_MATRIX.md
22. docs/TEST_MATRIX.md
23. docs/readiness-review.md
24. .blueprint/memory/

## Done
- No TBD placeholders remain in implementation-critical docs.
- Every story has acceptance criteria and validation proof.
- Every high-risk area has an owner and gate output.
- Every story has traceability from requirement to spec, edge case, test row, and evidence.
`;
}

function orchestratorPromptTemplate({ idea, questions, researchPath }) {
  return `# /blueprint-start Orchestrator Prompt

\`\`\`text
/blueprint-start
I need to build: ${idea}

Rules:
- Do not code yet.
- Ask only the necessary questions below first.
- Use refs/research for deep research after answers are available.
- Create a multi-agent plan.
- Ask verifier agents to review the plan.
- Stop for human approval.
- After approval, write the full documentation set.

Questions:
${questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}

Research context:
${researchPath}
\`\`\`
`;
}

function nextCommandsTemplate({ idea, depth }) {
  return `# Next Commands

If reference repositories are not synced:

\`\`\`bash
blueprint refs sync --dry-run
blueprint refs sync
blueprint refs status
blueprint refs index
\`\`\`

Run or refresh research:

\`\`\`bash
blueprint research run --topic "${idea.replaceAll('"', '\\"')}" --depth ${depth}
blueprint research report
blueprint research validate
\`\`\`

After human approval:

\`\`\`bash
blueprint readiness
blueprint memory update
blueprint memory compact
\`\`\`
`;
}

function startSummaryTemplate({ idea, runId, questions, researchPath }) {
  return `# Intake Summary

Run: ${runId}
Idea: ${idea}
Research context: ${researchPath}

## First Questions
${questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}

## Simple Flow
Prompt -> questions -> deep research -> multi-agent plan -> verifier agents -> human approval -> full docs -> readiness -> implementation handoff.

## Approval File
.blueprint/intake/${runId}/04-human-approval.md
`;
}

function projectBriefTemplate({ idea }) {
  return `# Project Brief

## Topic
${idea}

## Problem
Define the real-world problem, who experiences it, and why current workarounds are insufficient.

## Outcome
State the measurable result the first release must create for users and the business.

## Domain Notes
- Business process to understand.
- Specialist terminology to define.
- Policy, compliance, or operational constraints to research.

## Primary Users
| Role | Goal | Key Permissions | Success Moment |
| --- | --- | --- | --- |
| product-owner | clarifies product decisions | approve scope and release tradeoffs | MVP scope is locked |

## Open Questions
| Question | Owner | Impact | Decision Needed By |
| --- | --- | --- | --- |
| Which workflow proves MVP value end-to-end? | product-owner | high | before start-deep approval |
`;
}

function featureMapTemplate({ idea }) {
  return `# Feature Map

Product idea: ${idea}

## Feature Catalog
| Feature ID | Feature | User Value | MVP | Dependencies | Risk |
| --- | --- | --- | --- | --- | --- |
| FEAT-CORE-001 | Core workflow foundation | lets the main user complete the primary task | yes | product brief, PRD | normal |

## Release Mapping
| Release | Features | Exit Criteria |
| --- | --- | --- |
| MVP | FEAT-CORE-001 | user can complete the primary workflow with validation and evidence |
| Later | advanced automation, analytics, optional integrations | after MVP evidence is accepted |

## Non-Functional Feature Needs
- Performance and SEO expectations.
- Accessibility and responsive behavior.
- Security, privacy, audit, and data retention needs.
`;
}

function mvpScopeTemplate({ idea }) {
  return `# MVP Scope

Product idea: ${idea}

## MVP
- Primary role can complete the main workflow.
- Admin or owner can review, correct, and audit key records.
- System validates inputs and returns consistent errors.
- Evidence exists for core happy path, permission denial, invalid input, timeout, and partial failure.

## Explicitly Out Of Scope
- Advanced analytics unless the product goal requires it.
- AI automation unless approved as part of MVP.
- Extra integrations that do not prove the first release.

## Scope Rules
- Every MVP item maps to a requirement ID, story, test row, and evidence path.
- Any scope expansion requires a decision record.
- If a feature needs payment, inventory, provider callbacks, or regulated data, switch to high-risk review.
`;
}

function frontendDesignSystemTemplate({ idea }) {
  return `# Frontend Design System

Product idea: ${idea}

## Visual Foundations
- Color tokens: primary, secondary, surface, border, success, warning, danger, info.
- Typography tokens: display, heading, body, caption, code.
- Spacing tokens: 4px base scale with consistent section, grid, and form spacing.

## Component Rules
- Use design-system components before custom UI.
- Components use PascalCase; hooks use useCamelCase; utility functions use camelCase.
- Keep page components thin; business logic belongs in hooks/services.

## Accessibility
- Keyboard reachable controls.
- Visible focus states.
- Labels, descriptions, and error text connected to inputs.
- Color contrast checked for semantic states.

## Frontend Review Checklist
- Responsive layouts for mobile, tablet, and desktop.
- Loading, empty, error, disabled, success, and permission-denied states.
- No hidden product rules in UI-only code.
`;
}

function frontendComponentArchitectureTemplate({ idea }) {
  return `# Frontend Component Architecture

Product idea: ${idea}

## Structure
| Layer | Responsibility | Naming |
| --- | --- | --- |
| pages/routes | route composition and data boundary | route-based |
| features | product workflows and screens | feature-name |
| components | reusable UI primitives and composed widgets | PascalCase |
| hooks | local interaction and data hooks | useCamelCase |
| services | API clients and adapters | camelCase |

## State Rules
- Server state uses query/cache library if available.
- Form state stays close to the form.
- Shared client state must have a named owner and reason.

## SOLID For UI
- Single Responsibility: one component owns one UI concern.
- Open/Closed: variants use props/tokens, not duplicated components.
- Dependency Inversion: components depend on interfaces/adapters, not raw providers.
`;
}

function frontendPageFlowTemplate({ idea }) {
  return `# Frontend Page Flow

Product idea: ${idea}

## Routes
| Route | Purpose | Role Access | Empty State | Error State |
| --- | --- | --- | --- | --- |
| / | primary entry point | configured by RBAC | show next action | show recoverable error |

## User Journeys
- User reaches the primary workflow.
- User creates or updates the key record.
- User receives validation feedback.
- User sees success evidence or next action.

## States
- loading
- empty
- validation-error
- permission-denied
- optimistic-update-pending
- success
`;
}

function frontendSeoTemplate({ idea }) {
  return `# Frontend SEO

Product idea: ${idea}

## Metadata Rules
- Every public page has title, description, canonical URL, and Open Graph metadata.
- Private/admin pages use noindex where appropriate.
- Page headings follow semantic order.

## Link Rules
- Internal links use stable routes.
- External links declare ownership and safety behavior.
- Broken-link checks run before release when public pages exist.

## Sitemap And Robots
- Public marketing/content pages are included in sitemap.
- Authenticated app pages are excluded unless intentionally public.
`;
}

function backendArchitectureTemplate({ idea }) {
  return `# Backend Architecture

Product idea: ${idea}

## Layers
| Layer | Responsibility | Rule |
| --- | --- | --- |
| API/controller | protocol, auth context, request validation | no business rules hidden here |
| application/service | use cases, transactions, orchestration | owns workflow behavior |
| domain | business rules and invariants | framework independent |
| repository | persistence access | no product decisions |
| integrations | external providers and queues | idempotent and observable |

## Patterns
- Repository pattern for persistence boundary when data access is non-trivial.
- Factory only when object creation has real variants.
- Observer/event pattern only for explicit side effects and audit/event needs.

## Operational Rules
- Every mutation validates authorization, input, idempotency when needed, and audit behavior.
- Background jobs have retry, timeout, owner, and dead-letter behavior.
`;
}

function backendApiGuidelinesTemplate({ idea }) {
  return `# API Guidelines

Product idea: ${idea}

## REST Rules
- Use plural nouns: /api/v1/resources.
- Use HTTP methods by intent: GET read, POST create/action, PATCH partial update, DELETE remove/archive.
- Version public APIs with /api/v1.

## Response Envelope
| Field | Meaning |
| --- | --- |
| data | successful payload |
| error | canonical error object |
| meta | pagination, request id, trace id |

## API Quality Rules
- Pagination for list endpoints.
- Idempotency keys for retryable mutations.
- Auth and authorization named per endpoint.
- OpenAPI/Swagger or equivalent generated before frontend implementation.
`;
}

function backendDatabaseSchemaTemplate({ idea }) {
  return `# Database Schema

Product idea: ${idea}

## Entity Rules
- Every entity has owner, primary identifier, lifecycle state if mutable, and audit fields when risk requires it.
- Personal or sensitive fields have privacy class and retention policy.
- Unique constraints protect business identity.

## Index Rules
- Index fields used by frequent filters, joins, and uniqueness.
- Avoid speculative indexes without query evidence.

## Migration Rules
- Migrations are reversible where feasible.
- Data migration needs dry-run, backup, rollback, and validation evidence.
`;
}

function backendErrorHandlingTemplate({ idea }) {
  return `# Backend Error Handling

Product idea: ${idea}

## Error Envelope
| Field | Meaning |
| --- | --- |
| code | canonical code from docs/specs/error-codes.yaml |
| message | safe user-facing message |
| details | field-level validation details when safe |
| request_id | support/debug correlation |

## Rules
- Do not leak secrets, stack traces, tokens, SQL, or provider raw payloads to users.
- Every retryable error says whether retry is safe.
- Permission errors are deterministic and auditable.
- Validation errors map to fields and canonical codes.
`;
}

function securityPrivacySeoTemplate({ idea }) {
  return `# Security, Privacy, And SEO

Product idea: ${idea}

## Security Baseline
- Authentication and session/token policy are explicit.
- Authorization uses RBAC or a documented policy model.
- Mutations log actor, action, target, time, and outcome when audit is required.
- Inputs are validated at API boundary and business boundary.

## Privacy Baseline
- Personal data inventory exists.
- Logs and exports mask sensitive data.
- Retention and deletion policy are documented for sensitive records.

## SEO Baseline
- Public pages define metadata, canonical URLs, Open Graph, sitemap, and robots behavior.
- Private/admin pages avoid accidental indexing.
`;
}

function deliveryPlanTemplate({ idea }) {
  return `# Delivery Plan

Product idea: ${idea}

## Milestones
| Milestone | Goal | Exit Criteria |
| --- | --- | --- |
| M1 Discovery | product truth and MVP scope accepted | base questions answered and deep plan reviewed |
| M2 Blueprint | implementation-ready docs created | lint/readiness pass or concerns accepted |
| M3 MVP Build | first story slice implemented | tests and evidence linked |

## Definition of Ready
- Requirement, acceptance criteria, story, API/spec links, test row, edge cases, and owner exist.

## Definition of Done
- Code, tests, docs, test matrix evidence, memory, and review findings are complete.

## Agile Rules
- Stories are implementation slices, not departments.
- Scope change requires decision record.
- Sprint planning uses only ready stories.
`;
}

function engineeringStandardsTemplate({ idea }) {
  return `# Engineering Standards

Product idea: ${idea}

## Code Principles
- Prefer simple, explicit code over premature abstraction.
- Apply SOLID where it reduces change risk.
- Design patterns must solve a named problem; do not add patterns for decoration.

## Naming
- Components/classes: PascalCase.
- Functions, variables, hooks, files where local convention allows: camelCase or kebab-case consistently.
- Requirement/story/test IDs stay stable.

## Library Policy
- Use established libraries for auth, validation, routing, forms, data fetching, and tests when appropriate.
- New dependencies require a decision note covering maintenance, license, security, and bundle/runtime cost.

## Review Rules
- No behavior without tests or an explicit accepted risk.
- No product rule exists only in frontend.
- No API contract drift without updating docs and tests.
`;
}

function projectBlueprintSpecTemplate({ idea, runId }) {
  return `version: 0.1.0
run_id: ${runId}
idea: "${escapeYamlString(idea)}"
profile: web_or_app
risk_lane: normal
workflow:
  phase: start-deep
  requires_human_approval: true
artifacts:
  product:
    - docs/product/project-brief.md
    - docs/product/feature-map.md
    - docs/product/mvp-scope.md
  frontend:
    - docs/frontend/design-system.md
    - docs/frontend/component-architecture.md
    - docs/frontend/page-flow.md
    - docs/frontend/seo.md
  backend:
    - docs/backend/backend-architecture.md
    - docs/backend/api-guidelines.md
    - docs/backend/database-schema.md
    - docs/backend/error-handling.md
  gates:
    - blueprint assess
    - blueprint lint --ci
    - blueprint readiness
`;
}

function engineeringStandardsSpecTemplate({ idea }) {
  return `version: 0.1.0
idea: "${escapeYamlString(idea)}"
principles:
  - simple_explicit_code
  - solid_when_useful
  - documented_design_patterns
naming:
  components: PascalCase
  functions: camelCase
  ids: stable_requirement_story_test_ids
quality:
  lint_required: true
  tests_required: true
  docs_traceability_required: true
dependency_policy:
  requires_decision_note: true
  check_license_security_cost: true
`;
}

function epicTemplate(id, title, idea) {
  return `# ${id} ${title}

Product idea: ${idea}

## Outcome
Create the product foundation needed before implementation stories begin.

## Included Stories
- US-001 Define product foundation.

## Exit Criteria
- Project brief, MVP scope, engineering standards, frontend/backend/API/security docs, specs, and matrices are aligned.
`;
}

function deepStoryTemplate(id, title, idea) {
  return `# ${id} ${title}

## Status
planned

## Lane
normal

## Product Contract
For ${idea}, the implementation team must have approved product, frontend, backend, API, security, delivery, and engineering standards before code begins.

## Acceptance Criteria
- AC-FOUNDATION-001 Given the deep plan is reviewed, when readiness starts, then every implementation-critical doc has an owner and trace target.
- AC-FOUNDATION-002 Given engineering standards are accepted, when agents implement stories, then they follow naming, SOLID, API, error, security, and testing rules.

## Definition of Ready
- Product brief, MVP scope, feature map, engineering standards, frontend/backend/API/security docs, and specs exist.
- Human approval is recorded.

## Definition of Done
- Readiness review is generated.
- Assessment score is acceptable or findings are owned.

## Machine-Readable Contract Links
- docs/specs/project-blueprint.yaml
- docs/specs/engineering-standards.yaml

## Edge Cases
- Duplicate submit, invalid input, permission denied, concurrent update, timeout, partial failure, retry exhaustion.

## Agent Ownership
- Primary agent: orchestrator-agent
- Reviewer: PM/BA/architect/security-reviewer
- Handoff target: implementation agents after readiness
- Files/modules allowed: docs/, .blueprint/
- Files/modules forbidden: application source code before readiness

## Validation
| Type | Command | Expected Evidence |
| --- | --- | --- |
| Advisory | blueprint assess | role scores and findings |
| Hard gate | blueprint lint --ci | no production lint blockers |
| Readiness | blueprint readiness | READY_FOR_IMPLEMENTATION or explicit blockers |

## Proof Format
- Commands run.
- Findings fixed or owned.
- Evidence path: docs/evidence/${id}.md
`;
}

function escapeYamlString(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
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
- docs/product/integration-protocol.md
- docs/specs/state-machines.yaml
- docs/specs/rbac.yaml
- docs/specs/error-codes.yaml
- docs/TRACEABILITY_MATRIX.md
- docs/EDGE_CASE_MATRIX.md

## Acceptance Criteria
- Criterion 1.
- Criterion 2.
- Criterion 3.

## Definition of Ready
- Product contract is linked to PRD requirement IDs.
- State, RBAC, error-code, and integration impacts are reviewed.
- Edge cases are mapped or explicitly marked not applicable with rationale.
- Acceptance criteria are testable.
- Primary agent, allowed files, and forbidden files are assigned.
- Proof format is clear enough for another agent to verify.

## Definition of Done
- Acceptance criteria are implemented within allowed scope.
- Unit/integration/E2E/platform proof is captured or explicitly not applicable.
- TEST_MATRIX row is updated with evidence.
- TRACEABILITY_MATRIX row links requirement, story, spec, test, and evidence.
- Memory and decisions are updated when product truth changes.
- No forbidden files or modules were changed.

## Machine-Readable Contract Links
| Contract | Link or IDs |
| --- | --- |
| State machines | docs/specs/state-machines.yaml |
| RBAC | docs/specs/rbac.yaml |
| Error codes | docs/specs/error-codes.yaml |
| Integration protocol | docs/product/integration-protocol.md |

## Edge Cases
Link rows from docs/EDGE_CASE_MATRIX.md or explain why none apply.

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
- Primary agent: TBD
- Handoff target: TBD
- Files/modules allowed: TBD
- Files/modules forbidden: TBD

## Proof Format
- Commands to run:
- Expected output:
- Evidence path:
- Reviewer:

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
